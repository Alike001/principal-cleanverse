import { describe, expect, it } from "vitest";
import { principalPassport } from "../lib/principal/passport";

describe("principal passport snapshot", () => {
  it("reports the completed passport-controlled transfer proof", () => {
    expect(principalPassport.state).toBe("Cumulative testnet passport");
    expect(principalPassport.statusDetail).toContain("1.00 aUSDC cumulative allowance");
    expect(principalPassport.evidence.at(-1)).toMatchObject({
      title: "Cumulative transfer verified",
      state: "verified",
      reference: "Funding tx 0x3d20…6b8d · Transfer tx 0xf8e2…0d0e",
    });
  });

  it("keeps the known scope narrow and public evidence redacted", () => {
    expect(principalPassport.authority).toBe("aUSDC transfer calls, cumulatively bounded");
    expect(principalPassport.cap).toBe("1.00 aUSDC total · 0.40 available");
    expect(principalPassport.principal).toBe("CVI verified in recorded proof");
    expect(principalPassport.principal).not.toMatch(/^0x[0-9a-f]{40}$/i);
    expect(principalPassport.codeHash).toBe("0x1b60…7108f2");
    expect(principalPassport.expiry).toBe("2026-08-16 19:38 UTC");
  });

  it("links the active cumulative Passport receipt", () => {
    expect(principalPassport.evidence).toContainEqual(expect.objectContaining({
      title: "Cumulative Passport issued",
      reference: "Passport tx 0x746a…ddbc",
      href: "https://testnet.monadscan.com/tx/0x746a348b135474c11c7068e4dfc036e65090ada20c6b35d8cf4d9bab336fddbc",
    }));
  });
});
