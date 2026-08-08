import { describe, expect, it } from "vitest";
import { principalPassport } from "../lib/principal/passport";

describe("principal passport snapshot", () => {
  it("fails closed while the Validator pool is not registered", () => {
    expect(principalPassport.state).toBe("Pool registration blocked");
    expect(principalPassport.statusDetail).toContain("no CVA transfer can be attempted");
    expect(principalPassport.evidence.at(-1)).toMatchObject({
      title: "Pool registration blocked",
      state: "blocked",
      reference: "No CVA transfer was attempted",
    });
  });

  it("keeps the known scope narrow and public evidence redacted", () => {
    expect(principalPassport.authority).toBe("One aUSDC transfer capability");
    expect(principalPassport.cap).toBe("1.00 aUSDC");
    expect(principalPassport.principal).toBe("Active A-Pass wallet");
    expect(principalPassport.principal).not.toMatch(/^0x[0-9a-f]{40}$/i);
  });
});
