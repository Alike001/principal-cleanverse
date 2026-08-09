import { describe, expect, it } from "vitest";
import { principalPassport } from "../lib/principal/passport";

describe("principal passport snapshot", () => {
  it("reports the completed passport-controlled transfer proof", () => {
    expect(principalPassport.state).toBe("Transfer proof verified");
    expect(principalPassport.statusDetail).toContain("0.05 aUSDC transfer");
    expect(principalPassport.evidence.at(-1)).toMatchObject({
      title: "Passport transfer verified",
      state: "verified",
      reference: "Deposit tx 0x7797…b250 · Permitted tx 0x43cd…349f",
    });
  });

  it("keeps the known scope narrow and public evidence redacted", () => {
    expect(principalPassport.authority).toBe("One aUSDC transfer capability, exercised");
    expect(principalPassport.cap).toBe("0.10 aUSDC");
    expect(principalPassport.principal).toBe("Active A-Pass wallet");
    expect(principalPassport.principal).not.toMatch(/^0x[0-9a-f]{40}$/i);
  });
});
