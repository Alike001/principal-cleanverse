import { describe, expect, it, vi } from "vitest";

import {
  encodeEvaluateCall,
  evaluatePrincipalPassport,
  parseAssetAmount,
  PrincipalInputError,
  PrincipalRpcError,
} from "../lib/principal/evaluate.server";
import { principalDeployment } from "../lib/principal/deployment";

function rpcResponse(result: string) {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Principal live preflight", () => {
  it("parses aUSDC amounts exactly at six decimals", () => {
    expect(parseAssetAmount("0.05")).toBe(50_000n);
    expect(parseAssetAmount("1.000001")).toBe(1_000_001n);
  });

  it.each(["", "0", "-1", "1.0000001", "1e6", "1,000"])("rejects invalid amount %s", (amount) => {
    expect(() => parseAssetAmount(amount)).toThrow(PrincipalInputError);
  });

  it("encodes the deployed Passport #2 evaluate call", () => {
    const call = encodeEvaluateCall(principalDeployment.vaultAddress, principalDeployment.vaultAddress, 50_000n);
    expect(call).toHaveLength(2 + 8 + 64 * 4);
    expect(call).toMatch(/^0x7e8e89cb/);
    expect(call.toLowerCase()).toContain(principalDeployment.vaultAddress.slice(2).toLowerCase());
  });

  it("returns a live PERMITTED decision without broadcasting a transaction", async () => {
    const passportResult = `0x${[
      principalDeployment.vaultAddress,
      principalDeployment.vaultAddress,
      "0x7a824ba8287eace6a4ffc93ad13df2a8d0d403e40b418b96e45917061339edee",
      principalDeployment.cvaAddress,
      "100000",
      "1786899878",
      "1",
      "10143",
      "1",
    ].map((value) => BigInt(value).toString(16).padStart(64, "0")).join("")}`;
    const fetcher = vi.fn()
      .mockResolvedValueOnce(rpcResponse(passportResult))
      .mockResolvedValueOnce(rpcResponse(`0x${"0".repeat(64)}`));
    const result = await evaluatePrincipalPassport(
      principalDeployment.vaultAddress,
      "0.05",
      {},
      fetcher,
      "https://rpc.example",
    );

    expect(result).toMatchObject({ decision: "PERMITTED", permitted: true, source: "live_eth_call" });
    const request = JSON.parse(String((fetcher.mock.calls[0]?.[1] as RequestInit).body));
    expect(request.method).toBe("eth_call");
    expect(request.params[0].to).toBe(principalDeployment.factoryAddress);
  });

  it("returns deterministic blocked decisions", async () => {
    const encoded = (8n).toString(16).padStart(64, "0");
    const passportResult = `0x${[
      principalDeployment.vaultAddress,
      principalDeployment.vaultAddress,
      "0x7a824ba8287eace6a4ffc93ad13df2a8d0d403e40b418b96e45917061339edee",
      principalDeployment.cvaAddress,
      "100000",
      "1786899878",
      "1",
      "10143",
      "1",
    ].map((value) => BigInt(value).toString(16).padStart(64, "0")).join("")}`;
    const result = await evaluatePrincipalPassport(
      principalDeployment.vaultAddress,
      "0.11",
      {},
      vi.fn().mockResolvedValueOnce(rpcResponse(passportResult)).mockResolvedValueOnce(rpcResponse(`0x${encoded}`)),
    );
    expect(result).toMatchObject({ decision: "AMOUNT_CAP_EXCEEDED", permitted: false });
  });

  it("fails closed on malformed RPC data", async () => {
    await expect(
      evaluatePrincipalPassport(
        principalDeployment.vaultAddress,
        "0.05",
        {},
        vi.fn().mockResolvedValue(rpcResponse("0x01")),
      ),
    ).rejects.toBeInstanceOf(PrincipalRpcError);
  });

  it("falls back to the documented Monad RPC when an override is unavailable", async () => {
    const passportResult = `0x${[
      principalDeployment.vaultAddress,
      principalDeployment.vaultAddress,
      "0x7a824ba8287eace6a4ffc93ad13df2a8d0d403e40b418b96e45917061339edee",
      principalDeployment.cvaAddress,
      "100000",
      "1786899878",
      "1",
      "10143",
      "1",
    ].map((value) => BigInt(value).toString(16).padStart(64, "0")).join("")}`;
    const fetcher = vi.fn()
      .mockRejectedValueOnce(new Error("override unavailable"))
      .mockResolvedValueOnce(rpcResponse(passportResult))
      .mockResolvedValueOnce(rpcResponse(`0x${"0".repeat(64)}`));

    const result = await evaluatePrincipalPassport(
      principalDeployment.vaultAddress,
      "0.05",
      {},
      fetcher,
      "https://stale-rpc.example",
    );

    expect(result.decision).toBe("PERMITTED");
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher.mock.calls[1]?.[0]).toBe(principalDeployment.rpcUrl);
  });
});
