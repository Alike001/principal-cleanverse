import { describe, expect, it, vi } from "vitest";
import {
  connectPassportIssuer,
  encodeRegisterPassport,
  encodeRevokePassport,
  parseAusdcAmount,
  preflightPassportIssuance,
  waitForTransactionReceipt,
} from "../lib/principal/passport-issuer";

const registry = "0xab048434357b70ec7b7773ea3ef595a774cb7b5b";
const vault = "0x1115a4c26e6a4ed66c234b5290c3d427cb1c9335";
const account = "0x1111111111111111111111111111111111111111";
const wordAddress = (value: string) => `0x${"0".repeat(24)}${value.slice(2)}`;

describe("passport issuer", () => {
  it("encodes the exact registerPassport call with 6-decimal aUSDC units", () => {
    expect(parseAusdcAmount("1.00")).toBe(1_000_000n);
    expect(encodeRegisterPassport(vault, 1_000_000n, 1_800_000_000n)).toBe(
      `0x53eba396${vault.slice(2).padStart(64, "0")}${(1_000_000n).toString(16).padStart(64, "0")}${(1_800_000_000n).toString(16).padStart(64, "0")}`,
    );
  });

  it("rejects a cap that would silently lose aUSDC precision", () => {
    expect(() => parseAusdcAmount("0.0000001")).toThrow("up to 6 decimal places");
    expect(() => parseAusdcAmount("0")).toThrow("greater than zero");
  });

  it("encodes revocation without accepting a zero or fractional Passport ID", () => {
    expect(encodeRevokePassport("2")).toBe(`0x92c3ad1d${"2".padStart(64, "0")}`);
    expect(() => encodeRevokePassport("0")).toThrow("positive Passport ID");
    expect(() => encodeRevokePassport("2.5")).toThrow("positive Passport ID");
  });

  it("only connects accounts after the wallet is on Monad", async () => {
    const request = vi.fn()
      .mockResolvedValueOnce("0x279f")
      .mockResolvedValueOnce([account]);
    await expect(connectPassportIssuer({ request })).resolves.toBe(account);
    expect(request.mock.calls.map(([call]) => call.method)).toEqual(["eth_chainId", "eth_requestAccounts"]);
  });

  it("blocks issuance before the wallet transaction when the vault controller differs", async () => {
    const request = vi.fn()
      .mockResolvedValueOnce("0x279f")
      .mockResolvedValueOnce(wordAddress(vault))
      .mockResolvedValueOnce(wordAddress("0x2222222222222222222222222222222222222222"));
    await expect(preflightPassportIssuance({ request }, {
      registry,
      vault,
      account,
      amountCap: "1.00",
      expiry: "2030-01-01T00:00",
    })).rejects.toThrow("not this vault's controller");
    expect(request).not.toHaveBeenCalledWith(expect.objectContaining({ method: "eth_sendTransaction" }));
  });

  it("waits for a confirmed receipt rather than claiming a broadcast is complete", async () => {
    const request = vi.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ status: "0x1" });
    const wait = vi.fn().mockResolvedValue(undefined);
    await expect(waitForTransactionReceipt({ request }, `0x${"a".repeat(64)}`, wait)).resolves.toBeUndefined();
    expect(wait).toHaveBeenCalledTimes(1);
  });
});
