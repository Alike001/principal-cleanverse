import "server-only";

import { CleanverseConfigurationError } from "./errors";
import type { CleanverseConfig } from "./types";

const DEFAULT_BASE_URL = "https://uatapi.cleanverse.com/api/cooperate";

function required(value: string | undefined, name: string) {
  if (!value?.trim()) {
    throw new CleanverseConfigurationError(`${name} is required on the server.`);
  }

  return value.trim();
}

export function loadCleanverseConfig(env = process.env): CleanverseConfig {
  const apiId = required(env.CLEANVERSE_API_ID, "CLEANVERSE_API_ID");
  const apiKey = required(env.CLEANVERSE_API_KEY, "CLEANVERSE_API_KEY");
  const baseUrl = (env.CLEANVERSE_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/$/, "");

  const decodedKey = Buffer.from(apiKey, "base64");
  if (![16, 24, 32].includes(decodedKey.length)) {
    throw new CleanverseConfigurationError(
      "CLEANVERSE_API_KEY must be Base64 for a valid AES key length.",
    );
  }

  if (!URL.canParse(baseUrl)) {
    throw new CleanverseConfigurationError("CLEANVERSE_BASE_URL must be a valid URL.");
  }

  return { apiId, apiKey, baseUrl };
}

export function loadDemoPrincipalAddress(env = process.env): `0x${string}` {
  const address = required(env.DEMO_PRINCIPAL_ADDRESS, "DEMO_PRINCIPAL_ADDRESS");
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new CleanverseConfigurationError("DEMO_PRINCIPAL_ADDRESS must be an EVM address.");
  }

  return address as `0x${string}`;
}
