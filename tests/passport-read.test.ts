import { describe, expect, it, vi } from "vitest";

import {
  decodePassportResult,
  encodeGetPassportCall,
  loadPassport,
  parsePassportId,
  PrincipalPassportInputError,
  PrincipalPassportRpcError,
} from "../lib/principal/passport.server";

const registry = "0xcf145f0730989137cce3b94863490e6ac0f84c8b";
const vault = "0x0355E4c81d0bD4212A1c0402E0438DCd7ED52837";
const cva = "0xaC0893567D43C3E7e6e35a72803df05416C1f20D";

function word(value: string) {
  return BigInt(value).toString(16).padStart(64, "0");
}

function passportResult(active = "1") {
  return `0x${[
    "0x2910E6AbE8FE3E9387921aAdc91C1e453b2019d2",
    vault,
    "0x7a824ba8287eace6a4ffc93ad13df2a8d0d403e40b418b96e45917061339edee",
    cva,
    "100000",
    "1786899878",
    "1",
    "10143",
    active,
  ].map(word).join("")}`;
}

describe("live passport reader", () => {
  it("encodes a standard getPassport read and rejects invalid IDs", () => {
    expect(encodeGetPassportCall(2n)).toBe(`0x9f5679f4${"2".padStart(64, "0")}`);
    expect(parsePassportId("2")).toBe(2n);
    expect(() => parsePassportId("0")).toThrow(PrincipalPassportInputError);
    expect(() => parsePassportId("2.5")).toThrow(PrincipalPassportInputError);
    expect(() => parsePassportId("9".repeat(79))).toThrow(PrincipalPassportInputError);
  });

  it("decodes every Passport field without trusting the frontend", () => {
    expect(decodePassportResult(registry, 2n, passportResult())).toMatchObject({
      registry,
      passportId: "2",
      vault: vault.toLowerCase(),
      asset: cva.toLowerCase(),
      amountCap: "100000",
      expiry: "1786899878",
      nonce: "1",
      chainId: "10143",
      active: true,
    });
  });

  it("rejects malformed tuples and invalid active flags", () => {
    expect(() => decodePassportResult(registry, 2n, "0x01")).toThrow(PrincipalPassportRpcError);
    expect(() => decodePassportResult(registry, 2n, passportResult("2"))).toThrow(PrincipalPassportRpcError);
  });

  it("reads the supplied registry instead of the seeded deployment", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: passportResult() })));
    await loadPassport(registry, "2", fetcher, "https://rpc.example");
    const request = JSON.parse(String((fetcher.mock.calls[0]?.[1] as RequestInit).body));
    expect(request.params[0].to).toBe(registry);
    expect(request.params[0].data).toMatch(/^0x9f5679f4/);
  });
});
