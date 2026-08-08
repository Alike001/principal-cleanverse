import "server-only";

import { createCipheriv } from "node:crypto";

import { CleanverseConfigurationError } from "./errors";

const ZERO_IV = Buffer.alloc(16, 0);

export function encryptCleanversePayload(payload: unknown, apiKeyBase64: string): string {
  const key = Buffer.from(apiKeyBase64, "base64");
  if (![16, 24, 32].includes(key.length)) {
    throw new CleanverseConfigurationError("The Cleanverse API key is not a valid AES key.");
  }

  const cipher = createCipheriv(`aes-${key.length * 8}-cbc`, key, ZERO_IV);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  return Buffer.concat([cipher.update(plaintext), cipher.final()]).toString("base64");
}
