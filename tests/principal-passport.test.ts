import { describe, expect, it } from "vitest";
import { principalPassport } from "../lib/principal/passport";

describe("principal passport snapshot", () => {
  it("reports the confirmed Validator pool and vault CVI state", () => {
    expect(principalPassport.state).toBe("Pool and CVI verified");
    expect(principalPassport.statusDetail).toContain("A passport and CVA transfer remain separate, unrun actions");
    expect(principalPassport.evidence.at(-1)).toMatchObject({
      title: "Pool and vault CVI verified",
      state: "verified",
      reference: "Pool tx 0x9298…2853 · CVI tx 0x6815…4f89",
    });
  });

  it("keeps the known scope narrow and public evidence redacted", () => {
    expect(principalPassport.authority).toBe("One aUSDC transfer capability, not issued");
    expect(principalPassport.cap).toBe("1.00 aUSDC proposed");
    expect(principalPassport.principal).toBe("Active A-Pass wallet");
    expect(principalPassport.principal).not.toMatch(/^0x[0-9a-f]{40}$/i);
  });
});
