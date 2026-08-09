import { describe, expect, it } from "vitest";
import { createPassportLink } from "../lib/principal/passport-link";

describe("Passport inspection link", () => {
  it("creates a portable workspace link for one exact registry and Passport", () => {
    expect(createPassportLink("https://cleanverse-two.vercel.app", "0xcf145f0730989137cce3b94863490e6ac0f84c8b", "2"))
      .toBe("https://cleanverse-two.vercel.app/workspace?registry=0xcf145f0730989137cce3b94863490e6ac0f84c8b&passport=2");
  });

  it("rejects malformed targets rather than creating ambiguous links", () => {
    expect(() => createPassportLink("https://example.com", "not-an-address", "2")).toThrow("valid EVM address");
    expect(() => createPassportLink("https://example.com", "0xcf145f0730989137cce3b94863490e6ac0f84c8b", "0")).toThrow("positive whole number");
  });
});
