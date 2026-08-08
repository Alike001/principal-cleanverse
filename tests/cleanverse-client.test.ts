import { createDecipheriv } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

import { CleanverseClient } from "../lib/cleanverse/client.server";
import { encryptCleanversePayload } from "../lib/cleanverse/crypto.server";
import { CleanverseResponseError } from "../lib/cleanverse/errors";
import type { CleanverseConfig } from "../lib/cleanverse/types";

const apiKey = Buffer.alloc(32, 7).toString("base64");
const config: CleanverseConfig = {
  apiId: "sandbox-test-id",
  apiKey,
  baseUrl: "https://uatapi.cleanverse.com/api/cooperate",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Cleanverse crypto", () => {
  it("encrypts a JSON request with AES-CBC and the required zero IV", () => {
    const plaintext = { customerId: "PrincipalWallet01", wallet: { chain: "monad" } };
    const encrypted = encryptCleanversePayload(plaintext, apiKey);
    const decipher = createDecipheriv("aes-256-cbc", Buffer.from(apiKey, "base64"), Buffer.alloc(16, 0));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, "base64")),
      decipher.final(),
    ]).toString("utf8");

    expect(JSON.parse(decrypted)).toEqual(plaintext);
  });
});

describe("CleanverseClient", () => {
  it("sends read requests as plain JSON with api-id authentication", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({ code: "0000", message: "success", data: { chain: "monad", tokens: [] } }),
    );
    const client = new CleanverseClient(config, fetcher);

    await expect(client.queryDepositATokenList()).resolves.toEqual({ chain: "monad", tokens: [] });
    expect(fetcher).toHaveBeenCalledWith(
      "https://uatapi.cleanverse.com/api/cooperate/query_deposit_atoken_list",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "api-id": "sandbox-test-id" }),
        body: JSON.stringify({ chain: "monad" }),
      }),
    );
  });

  it("treats an HTTP 200 business failure as an error", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({ code: "0002", message: "[CN_001] A-Pass not found", data: "" }),
    );
    const client = new CleanverseClient(config, fetcher);

    await expect(client.queryAPass("monad", "0x0000000000000000000000000000000000000001")).rejects.toEqual(
      expect.objectContaining<Partial<CleanverseResponseError>>({ code: "0002" }),
    );
  });

  it("encrypts Generate A-Pass requests before network transmission", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({
        code: "0000",
        message: "success",
        data: { customerId: "PrincipalWallet01", cvRecordId: "1", tier: "1", wallet: {} },
      }),
    );
    const client = new CleanverseClient(config, fetcher);
    const payload = {
      customerId: "PrincipalWallet01",
      expirationTime: 1_900_000_000,
      wallet: { chain: "monad" as const, address: "0x0000000000000000000000000000000000000001" },
    };

    await client.generateAPass(payload);
    const request = fetcher.mock.calls[0]?.[1] as RequestInit;
    const wirePayload = JSON.parse(String(request.body));

    expect(wirePayload).toHaveProperty("data");
    expect(wirePayload.data).not.toContain("PrincipalWallet01");
    expect(wirePayload).not.toHaveProperty("apiKey");
  });
});
