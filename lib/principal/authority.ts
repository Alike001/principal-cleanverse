export type AuthorityNode = "principal" | "factory" | "vault" | "asset";

export const authorityNodes: Record<AuthorityNode, { title: string; detail: string; state: "verified" | "blocked" }> = {
  principal: { title: "Verified principal", detail: "Recorded proof shows an active Cleanverse A-Pass for the configured principal.", state: "verified" },
  factory: { title: "Principal factory", detail: "Recorded onchain proof shows the deployed factory held Validator REGISTER_ROLE on Monad.", state: "verified" },
  vault: { title: "Immutable vault", detail: "The factory created one vault whose code and controller can be checked.", state: "verified" },
  asset: { title: "Cleanverse aUSDC", detail: "Recorded proof shows a 0.05 aUSDC transfer entered the CVI-registered vault and returned through Passport #1.", state: "verified" },
};

export const authorityChecks = [
  { label: "Principal CVI", value: "Recorded CVI proof", state: "verified" },
  { label: "Vault provenance", value: "Factory-created", state: "verified" },
  { label: "Registrar authority", value: "REGISTER_ROLE", state: "verified" },
  { label: "Passport transfer", value: "0.05 aUSDC permitted", state: "verified" },
] as const;
