import { describe, expect, it } from "vitest";
import { createPassportLink } from "../lib/principal/passport-link";

describe("Passport inspection link", () => {
  it("creates a portable workspace link for one exact registry and Passport", () => {
    expect(createPassportLink("https://cleanverse-two.vercel.app", "0xab048434357b70ec7b7773ea3ef595a774cb7b5b", "1"))
      .toBe("https://cleanverse-two.vercel.app/workspace?registry=0xab048434357b70ec7b7773ea3ef595a774cb7b5b&passport=1");
  });

  it("rejects malformed targets rather than creating ambiguous links", () => {
    expect(() => createPassportLink("https://example.com", "not-an-address", "2")).toThrow("valid EVM address");
    expect(() => createPassportLink("https://example.com", "0xab048434357b70ec7b7773ea3ef595a774cb7b5b", "0")).toThrow("positive whole number");
  });
});
