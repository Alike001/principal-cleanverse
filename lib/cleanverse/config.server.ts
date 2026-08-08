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
