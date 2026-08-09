import { createDecipheriv } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

import { CleanverseClient } from "../lib/cleanverse/client.server";
import { encryptCleanversePayload } from "../lib/cleanverse/crypto.server";
import {
  CleanverseMalformedResponseError,
  CleanverseResponseError,
  CleanverseTransportError,
} from "../lib/cleanverse/errors";
import { getMonadPrincipalStatus } from "../lib/cleanverse/monad-status.server";
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
        data: {
          customerId: "PrincipalWallet01",
          cvRecordId: "1",
          tier: "1",
          wallet: {
            operate: "update",
            address: "0x0000000000000000000000000000000000000001",
            chain: "monad",
            txHash: "0xregistration",
            depositUSDCWallet: "0xdeposit",
            depositUSDTWallet: "0xdeposit",
          },
        },
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

  it("encrypts Validator registrar grants and keeps the signature out of the URL", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({ code: "0000", message: "success", data: { chain: "monad", address: "0xfactory", tx_hash: "0xtx" } }),
    );
    const client = new CleanverseClient(config, fetcher);
    const signature = `0x${"a".repeat(130)}` as `0x${string}`;

    await client.grantValidatorRegistrar({
      chain: "monad",
      address: "0x0000000000000000000000000000000000000001",
      owner_signature: signature,
    });

    const [url, request] = fetcher.mock.calls[0] as [string, RequestInit];
    const wirePayload = JSON.parse(String(request.body));
    expect(url).toBe("https://uatapi.cleanverse.com/api/cooperate/validator/grant");
    expect(url).not.toContain(signature);
    expect(wirePayload.data).not.toContain(signature);
  });

  it("rejects malformed success data instead of trusting it", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({ code: "0000", message: "success", data: { chain: "monad", tokens: [{}] } }),
    );
    const client = new CleanverseClient(config, fetcher);

    await expect(client.queryDepositATokenList()).rejects.toBeInstanceOf(
      CleanverseMalformedResponseError,
    );
  });

  it("rejects non-JSON and invalid response envelopes", async () => {
    const nonJsonClient = new CleanverseClient(
      config,
      vi.fn().mockResolvedValue(new Response("not-json", { status: 200 })),
    );
    const invalidEnvelopeClient = new CleanverseClient(
      config,
      vi.fn().mockResolvedValue(jsonResponse({ status: "success", data: {} })),
    );

    await expect(nonJsonClient.queryDepositATokenList()).rejects.toBeInstanceOf(
      CleanverseMalformedResponseError,
    );
    await expect(invalidEnvelopeClient.queryDepositATokenList()).rejects.toBeInstanceOf(
      CleanverseMalformedResponseError,
    );
  });

  it("treats non-2xx responses as transport failures without exposing response data", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response("secret upstream diagnostic", { status: 500 }),
    );
    const client = new CleanverseClient(config, fetcher);

    await expect(client.queryDepositATokenList()).rejects.toEqual(
      expect.objectContaining<Partial<CleanverseTransportError>>({
        message: "Cleanverse returned HTTP 500.",
      }),
    );
  });

  it("fails closed on timeout without echoing the underlying error", async () => {
    const fetcher = vi.fn((_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("sandbox-secret")));
      }),
    ) as unknown as typeof fetch;
    const client = new CleanverseClient(config, fetcher, 1);

    await expect(client.queryDepositATokenList()).rejects.toEqual(
      expect.objectContaining<Partial<CleanverseTransportError>>({
        message: "Cleanverse request failed or timed out.",
      }),
    );
    await client.queryDepositATokenList().catch((error: unknown) => {
      expect(String(error)).not.toContain("sandbox-secret");
      expect(String(error)).not.toContain(apiKey);
    });
  });

  it("reports a missing A-Pass without exposing a principal wallet to the browser status model", async () => {
    const status = await getMonadPrincipalStatus(
      {
        queryDepositATokenList: vi.fn().mockResolvedValue({
          chain: "monad",
          tokens: [
            {
              atoken: { symbol: "ausdc", name: "aUSDC", decimals: 6, address: "0xasset", icon: "" },
              origin_token: { symbol: "usdc", name: "USDC", decimals: 6, address: "0xorigin", icon: "" },
              accesscore_address: "0xcore",
              apass_address: "0xpass",
            },
          ],
        }),
        queryAPass: vi.fn().mockRejectedValue(new CleanverseResponseError("A-Pass not found", "0002")),
      },
      "0x0000000000000000000000000000000000000001",
    );

    expect(status).toEqual({
      chain: "monad",
      principalCvi: "not_registered",
      assets: [{ symbol: "ausdc", name: "aUSDC", decimals: 6, contractAddress: "0xasset" }],
    });
    expect(JSON.stringify(status)).not.toContain("0000000000000000000000000000000000000001");
  });

  it("does not mistake an unrelated Cleanverse 0002 failure for a missing A-Pass", async () => {
    const failure = new CleanverseResponseError("Transient chain read failed", "0002");

    await expect(
      getMonadPrincipalStatus(
        {
          queryDepositATokenList: vi.fn().mockResolvedValue({ chain: "monad", tokens: [] }),
          queryAPass: vi.fn().mockRejectedValue(failure),
        },
        "0x0000000000000000000000000000000000000001",
      ),
    ).rejects.toBe(failure);
  });
});
