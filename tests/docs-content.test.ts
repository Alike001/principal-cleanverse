import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const landing = readFileSync(new URL("../components/principal-landing.tsx", import.meta.url), "utf8");
const docs = readFileSync(new URL("../app/docs/page.tsx", import.meta.url), "utf8");

describe("public product navigation", () => {
  it("takes the landing Evidence link to the public evidence section", () => {
    expect(landing).toContain('href="/docs#public-evidence"');
    expect(docs).toContain('id="public-evidence"');
  });

  it("keeps public docs focused on Principal rather than gated sponsor API docs", () => {
    expect(docs).toContain("this page documents Principal itself");
    expect(docs).not.toContain("https://docs.cleanverse.com");
  });
});
