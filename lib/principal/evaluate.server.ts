import "server-only";

import { principalDeployment } from "./deployment";

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

export function encodeEvaluateCall(recipient: string, amountUnits: bigint) {
  if (!ADDRESS_PATTERN.test(recipient)) {
    throw new PrincipalInputError("Recipient must be a valid EVM address.");
  }

  return `0x${EVALUATE_SELECTOR}${encodeWord(BigInt(principalDeployment.passportId))}${encodeAddress(principalDeployment.vaultAddress)}${encodeAddress(recipient)}${encodeWord(amountUnits)}`;
}

export type PrincipalEvaluation = {
  chain: typeof principalDeployment.chainName;
  passportId: number;
  recipient: string;
  amount: string;
  amountUnits: string;
  decision: PrincipalDecision;
  permitted: boolean;
  source: "live_eth_call";
};

export async function evaluatePrincipalPassport(
  recipient: string,
  amount: string,
  fetcher: FetchLike = fetch,
  rpcUrl = process.env.MONAD_RPC_URL?.trim() || principalDeployment.rpcUrl,
): Promise<PrincipalEvaluation> {
  const amountUnits = parseAssetAmount(amount);
  const data = encodeEvaluateCall(recipient, amountUnits);

  let response: Response;
  try {
    response = await fetcher(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [{ to: principalDeployment.factoryAddress, data }, "latest"],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new PrincipalRpcError("Monad evaluation is temporarily unavailable.");
  }

  if (!response.ok) throw new PrincipalRpcError("Monad evaluation is temporarily unavailable.");

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new PrincipalRpcError("Monad returned an unreadable evaluation response.");
  }

  if (!payload || typeof payload !== "object" || "error" in payload) {
    throw new PrincipalRpcError("Monad rejected the evaluation request.");
  }

  const result = (payload as { result?: unknown }).result;
  if (typeof result !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(result)) {
    throw new PrincipalRpcError("Monad returned an invalid evaluation result.");
  }

  const decisionIndex = Number(BigInt(result));
  const decision = principalDecisionNames[decisionIndex];
  if (!decision) throw new PrincipalRpcError("Monad returned an unknown Principal decision.");

  return {
    chain: principalDeployment.chainName,
    passportId: principalDeployment.passportId,
    recipient,
    amount,
    amountUnits: amountUnits.toString(),
    decision,
    permitted: decision === "PERMITTED",
    source: "live_eth_call",
  };
}
