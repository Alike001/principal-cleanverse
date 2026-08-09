import { describe, expect, it } from "vitest";
import { authorityChecks, authorityNodes } from "../lib/principal/authority";

describe("authority graph facts", () => {
  it("shows the verified Cleanverse pool and vault CVI state", () => {
    expect(authorityNodes.asset.state).toBe("verified");
    expect(authorityNodes.asset.detail).toContain("No CVA balance or transfer is claimed");
    expect(authorityChecks.find((check) => check.label === "Validator pool")).toMatchObject({
      value: "CVI registered",
      state: "verified",
    });
  });

  it("does not turn setup evidence into a successful transfer claim", () => {
    expect(authorityChecks.filter((check) => check.state === "verified")).toHaveLength(4);
    expect(authorityChecks.map((check) => check.label)).not.toContain("Transfer succeeded");
  });
});
