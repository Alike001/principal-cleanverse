import "server-only";

import { principalDeployment } from "./deployment";
import { loadPassport, PrincipalPassportInputError, PrincipalPassportRpcError } from "./passport.server";

const EVALUATE_SELECTOR = "7e8e89cb";
const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;
const AMOUNT_PATTERN = /^(?:0|[1-9]\d*)(?:\.(\d{1,6}))?$/;

export const principalDecisionNames = [
  "PERMITTED",
  "PASSPORT_NOT_FOUND",
  "PASSPORT_INACTIVE",
  "PASSPORT_EXPIRED",
  "VAULT_MISMATCH",
  "CODE_MISMATCH",
  "CONTROLLER_MISMATCH",
  "ASSET_MISMATCH",
  "AMOUNT_CAP_EXCEEDED",
  "PRINCIPAL_INELIGIBLE",
  "RECIPIENT_INELIGIBLE",
  "VALIDATOR_UNAVAILABLE",
  "WRONG_CHAIN",
  "ALLOWANCE_EXHAUSTED",
] as const;

export type PrincipalDecision = (typeof principalDecisionNames)[number];

export class PrincipalInputError extends Error {
  name = "PrincipalInputError";
}
export class PrincipalRpcError extends Error {
  name = "PrincipalRpcError";
}

type FetchLike = typeof fetch;

function encodeWord(value: bigint) {
  return value.toString(16).padStart(64, "0");
}

function encodeAddress(address: string) {
  return address.slice(2).toLowerCase().padStart(64, "0");
}

export function parseAssetAmount(value: string) {
  const normalized = value.trim();
  const match = AMOUNT_PATTERN.exec(normalized);
  if (!match) {
    throw new PrincipalInputError("Enter an aUSDC amount with no more than six decimal places.");
  }

  const [whole, fraction = ""] = normalized.split(".");
  const units = BigInt(whole) * 10n ** BigInt(principalDeployment.assetDecimals)
    + BigInt(fraction.padEnd(principalDeployment.assetDecimals, "0") || "0");
  if (units === 0n) throw new PrincipalInputError("Amount must be greater than zero.");
  if (units > 2n ** 256n - 1n) throw new PrincipalInputError("Amount is too large.");
  return units;
}

export function encodeEvaluateCall(vault: string, recipient: string, amountUnits: bigint, passportId = String(principalDeployment.passportId)) {
  if (!ADDRESS_PATTERN.test(vault)) {
    throw new PrincipalInputError("Vault must be a valid EVM address.");
  }
  if (!ADDRESS_PATTERN.test(recipient)) {
    throw new PrincipalInputError("Recipient must be a valid EVM address.");
  }
  if (!/^[1-9]\d*$/.test(passportId)) {
    throw new PrincipalInputError("Passport ID must be a positive whole number.");
  }

  return `0x${EVALUATE_SELECTOR}${encodeWord(BigInt(passportId))}${encodeAddress(vault)}${encodeAddress(recipient)}${encodeWord(amountUnits)}`;
}

export type PrincipalEvaluation = {
  chain: typeof principalDeployment.chainName;
  registry: string;
  passportId: string;
  vault: string;
  recipient: string;
  amount: string;
  amountUnits: string;
  decision: PrincipalDecision;
  permitted: boolean;
  source: "live_eth_call";
};

type EvaluationTarget = {
  registry?: string;
  passportId?: string;
};

export async function evaluatePrincipalPassport(
  recipient: string,
  amount: string,
  target: EvaluationTarget = {},
  fetcher: FetchLike = fetch,
  rpcUrl = process.env.MONAD_RPC_URL?.trim() || principalDeployment.rpcUrl,
): Promise<PrincipalEvaluation> {
  const amountUnits = parseAssetAmount(amount);
  const registry = target.registry || principalDeployment.factoryAddress;
  const passportId = target.passportId || String(principalDeployment.passportId);
  let passport;
  try {
    passport = await loadPassport(registry, passportId, fetcher, rpcUrl);
  } catch (error) {
    if (error instanceof PrincipalPassportInputError) throw new PrincipalInputError(error.message);
    if (error instanceof PrincipalPassportRpcError) throw new PrincipalRpcError(error.message);
    throw error;
  }
  const data = encodeEvaluateCall(passport.vault, recipient, amountUnits, passport.passportId);

  const rpcUrls = [...new Set([rpcUrl, principalDeployment.rpcUrl])];
  let result: unknown;

  for (const candidateRpcUrl of rpcUrls) {
    try {
      const response = await fetcher(candidateRpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [{ to: passport.registry, data }, "latest"],
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) continue;

      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || "error" in payload) continue;

      const candidateResult = (payload as { result?: unknown }).result;
      if (typeof candidateResult === "string" && /^0x[0-9a-fA-F]{64}$/.test(candidateResult)) {
        result = candidateResult;
        break;
      }
    } catch {
      continue;
    }
  }

  if (typeof result !== "string") throw new PrincipalRpcError("Monad evaluation is temporarily unavailable.");

  const decisionIndex = Number(BigInt(result));
  const decision = principalDecisionNames[decisionIndex];
  if (!decision) throw new PrincipalRpcError("Monad returned an unknown Principal decision.");

  return {
    chain: principalDeployment.chainName,
    registry: passport.registry,
    passportId: passport.passportId,
    vault: passport.vault,
    recipient,
    amount,
    amountUnits: amountUnits.toString(),
    decision,
    permitted: decision === "PERMITTED",
    source: "live_eth_call",
  };
}
