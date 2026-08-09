import { describe, expect, it } from "vitest";
import { formatUnixTimestamp } from "../lib/principal/time";

describe("formatUnixTimestamp", () => {
  it("formats the live Passport expiry without BigInt conversion errors", () => {
    expect(formatUnixTimestamp("1786909103")).toBe("2026-08-16 19:38:23 UTC");
  });

  it("fails closed for invalid or unrepresentable chain values", () => {
    expect(formatUnixTimestamp("not-a-timestamp")).toBe("Invalid timestamp");
    expect(formatUnixTimestamp("9007199254741")).toBe("Unrepresentable timestamp");
  });
});
