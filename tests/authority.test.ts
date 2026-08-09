import { describe, expect, it } from "vitest";
import { authorityChecks, authorityNodes } from "../lib/principal/authority";

describe("authority graph facts", () => {
  it("shows the verified Cleanverse pool and vault CVI state", () => {
    expect(authorityNodes.asset.state).toBe("verified");
    expect(authorityNodes.asset.detail).toContain("0.05 aUSDC transfer entered");
    expect(authorityChecks.find((check) => check.label === "Passport transfer")).toMatchObject({
      value: "0.05 aUSDC permitted",
      state: "verified",
    });
  });

  it("does not turn setup evidence into a successful transfer claim", () => {
    expect(authorityChecks.filter((check) => check.state === "verified")).toHaveLength(4);
    expect(authorityChecks.map((check) => check.label)).not.toContain("Transfer succeeded");
  });
});
