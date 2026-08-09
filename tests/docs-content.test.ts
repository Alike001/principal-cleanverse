import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const landing = readFileSync(new URL("../components/principal-landing.tsx", import.meta.url), "utf8");
const docs = readFileSync(new URL("../app/docs/page.tsx", import.meta.url), "utf8");
const workspace = readFileSync(new URL("../components/contract-passport.tsx", import.meta.url), "utf8");

describe("public product navigation", () => {
  it("takes the landing Evidence link to the public evidence section", () => {
    expect(landing).toContain('href="/docs#public-evidence"');
    expect(docs).toContain('id="public-evidence"');
  });

  it("keeps public docs focused on Principal rather than gated sponsor API docs", () => {
    expect(docs).toContain("this page documents Principal itself");
    expect(docs).not.toContain("https://docs.cleanverse.com");
  });

  it("shows the final factory and removes the obsolete blocked-pool state", () => {
    expect(landing).toContain("principalDeployment.factoryAddress");
    expect(landing).not.toContain("0x2683f26DDc6c2aF920Ee844150000a59FBBd4291");
    expect(landing).toContain("PERMITTED · 0.05 aUSDC");
    expect(workspace).toContain("Check authority");
    expect(workspace).toContain("Load Passport");
    expect(workspace).toContain("Principal registry");
    expect(workspace).not.toContain("CCP_POOL_NOT_REGISTERED");
    expect(workspace).not.toContain("Transfer unavailable");
    expect(workspace).not.toContain("Pool not registered");
  });

  it("keeps recorded proof separate from the live preflight", () => {
    expect(workspace).toContain("status-historical");
    expect(workspace).toContain("Load another passport to replace this reviewed snapshot");
    expect(workspace).toContain("The preflight reloads it before every decision");
    expect(workspace).toContain("Historical snapshot · Aug 9, 2026");
  });

  it("places the Principal mark beside the Contract Passport title", () => {
    expect(workspace).toContain('className="passport-product-title"');
    expect(workspace).toContain("<Mark size={32} /><h1>Principal</h1>");
  });
});
