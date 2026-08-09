import { describe, expect, it } from "vitest";
import { authorityChecks, authorityNodes } from "../lib/principal/authority";

describe("authority graph facts", () => {
  it("keeps the Cleanverse asset path fail-closed until pool registration succeeds", () => {
    expect(authorityNodes.asset.state).toBe("blocked");
    expect(authorityNodes.asset.detail).toContain("transfer authority remains blocked");
    expect(authorityChecks.find((check) => check.label === "Validator pool")).toMatchObject({
      value: "registerV2",
      state: "blocked",
    });
  });

  it("does not turn setup evidence into a successful transfer claim", () => {
    expect(authorityChecks.filter((check) => check.state === "verified")).toHaveLength(3);
    expect(authorityChecks.map((check) => check.label)).not.toContain("Transfer succeeded");
  });
});
