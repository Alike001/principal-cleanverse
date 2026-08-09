import { describe, expect, it } from "vitest";
import { principalPassport } from "../lib/principal/passport";

describe("principal passport snapshot", () => {
  it("reports the completed passport-controlled transfer proof", () => {
    expect(principalPassport.state).toBe("Renewed testnet passport");
    expect(principalPassport.statusDetail).toContain("Passport #2 renewed");
    expect(principalPassport.evidence.at(-1)).toMatchObject({
      title: "Passport transfer verified",
      state: "verified",
      reference: "Deposit tx 0x7797…b250 · Permitted tx 0x43cd…349f",
    });
  });

  it("keeps the known scope narrow and public evidence redacted", () => {
    expect(principalPassport.authority).toBe("aUSDC transfer calls, per-call capped");
    expect(principalPassport.cap).toBe("0.10 aUSDC per transfer");
    expect(principalPassport.principal).toBe("CVI verified in recorded proof");
    expect(principalPassport.principal).not.toMatch(/^0x[0-9a-f]{40}$/i);
    expect(principalPassport.codeHash).toBe("0x7a82…39edee");
    expect(principalPassport.expiry).toBe("2026-08-16 17:04 UTC");
  });

  it("links the active Passport #2 renewal receipt", () => {
    expect(principalPassport.evidence).toContainEqual(expect.objectContaining({
      title: "Passport #2 renewed",
      reference: "Passport tx 0xfb58…a4d8",
      href: "https://testnet.monadscan.com/tx/0xfb5882599ea6bd7ae77fbbd5fe728bf3e4c3d8972b48378a67eee2aba0a7a4d8",
    }));
  });
});
