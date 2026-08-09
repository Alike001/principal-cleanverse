import "server-only";

import { principalDeployment } from "./deployment";

const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;
const PASSPORT_ID_PATTERN = /^(?:0|[1-9]\d*)$/;
const GET_PASSPORT_SELECTOR = "9f5679f4";

export class PrincipalPassportInputError extends Error {
  name = "PrincipalPassportInputError";
}

export class PrincipalPassportRpcError extends Error {
  name = "PrincipalPassportRpcError";
}

export type LivePassport = {
  registry: string;
  passportId: string;
  principal: string;
  vault: string;
  runtimeCodeHash: string;
  asset: string;
  amountCap: string;
  expiry: string;
  nonce: string;
  chainId: string;
  active: boolean;
};

type FetchLike = typeof fetch;

function encodeWord(value: bigint) {
  return value.toString(16).padStart(64, "0");
}

function parseAddress(value: string, label: string) {
  const normalized = value.trim();
  if (!ADDRESS_PATTERN.test(normalized)) {
    throw new PrincipalPassportInputError(`${label} must be a valid EVM address.`);
  }
  return normalized.toLowerCase();
}

export function parsePassportId(value: string) {
  const normalized = value.trim();
  if (!PASSPORT_ID_PATTERN.test(normalized)) {
    throw new PrincipalPassportInputError("Passport ID must be a positive whole number.");
  }
  if (normalized.length > 78) {
    throw new PrincipalPassportInputError("Passport ID must be between 1 and 2²⁵⁶ - 1.");
  }
  const passportId = BigInt(normalized);
  if (passportId === 0n || passportId > 2n ** 256n - 1n) {
    throw new PrincipalPassportInputError("Passport ID must be between 1 and 2²⁵⁶ - 1.");
  }
  return passportId;
}

export function encodeGetPassportCall(passportId: bigint) {
  return `0x${GET_PASSPORT_SELECTOR}${encodeWord(passportId)}`;
}

function decodeAddress(word: string) {
  return `0x${word.slice(-40)}`;
}

export function decodePassportResult(registry: string, passportId: bigint, result: string): LivePassport {
  if (!/^0x[0-9a-fA-F]{576}$/.test(result)) {
    throw new PrincipalPassportRpcError("Monad returned an invalid Passport response.");
  }

  const words = result.slice(2).match(/.{64}/g);
  if (!words || words.length !== 9) {
    throw new PrincipalPassportRpcError("Monad returned an incomplete Passport response.");
  }

  const activeValue = BigInt(`0x${words[8]}`);
  if (activeValue !== 0n && activeValue !== 1n) {
    throw new PrincipalPassportRpcError("Monad returned an invalid Passport active flag.");
  }

  return {
    registry,
    passportId: passportId.toString(),
    principal: decodeAddress(words[0]),
    vault: decodeAddress(words[1]),
    runtimeCodeHash: `0x${words[2]}`,
    asset: decodeAddress(words[3]),
    amountCap: BigInt(`0x${words[4]}`).toString(),
    expiry: BigInt(`0x${words[5]}`).toString(),
    nonce: BigInt(`0x${words[6]}`).toString(),
    chainId: BigInt(`0x${words[7]}`).toString(),
    active: activeValue === 1n,
  };
}

export async function loadPassport(
  registryValue: string,
  passportIdValue: string,
  fetcher: FetchLike = fetch,
  rpcUrl = process.env.MONAD_RPC_URL?.trim() || principalDeployment.rpcUrl,
): Promise<LivePassport> {
  const registry = parseAddress(registryValue, "Registry");
  const passportId = parsePassportId(passportIdValue);
  const data = encodeGetPassportCall(passportId);

  const rpcUrls = [...new Set([rpcUrl, principalDeployment.rpcUrl])];
  for (const candidateRpcUrl of rpcUrls) {
    try {
      const response = await fetcher(candidateRpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [{ to: registry, data }, "latest"],
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) continue;
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || "error" in payload) continue;
      const result = (payload as { result?: unknown }).result;
      if (typeof result !== "string") continue;
      return decodePassportResult(registry, passportId, result);
    } catch (error) {
      if (error instanceof PrincipalPassportInputError || error instanceof PrincipalPassportRpcError) throw error;
    }
  }
  throw new PrincipalPassportRpcError("Monad Passport lookup is temporarily unavailable.");
}
