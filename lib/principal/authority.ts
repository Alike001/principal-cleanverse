export type AuthorityNode = "principal" | "factory" | "vault" | "asset";

export const authorityNodes: Record<AuthorityNode, { title: string; detail: string; state: "verified" | "blocked" }> = {
  principal: { title: "Verified principal", detail: "A Cleanverse A-Pass is active for the configured principal.", state: "verified" },
  factory: { title: "Principal factory", detail: "The deployed factory holds the Validator REGISTER_ROLE on Monad.", state: "verified" },
  vault: { title: "Immutable vault", detail: "The factory created one vault whose code and controller can be checked.", state: "verified" },
  asset: { title: "Cleanverse aUSDC", detail: "The vault targets Monad aUSDC, but transfer authority remains blocked until pool registration succeeds.", state: "blocked" },
};

export const authorityChecks = [
  { label: "Principal CVI", value: "Active A-Pass", state: "verified" },
  { label: "Vault provenance", value: "Factory-created", state: "verified" },
  { label: "Registrar authority", value: "REGISTER_ROLE", state: "verified" },
  { label: "Validator pool", value: "registerV2", state: "blocked" },
] as const;
