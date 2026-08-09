export type EvidenceState = "verified" | "blocked" | "pending";

export type EvidenceItem = {
  title: string;
  detail: string;
  state: EvidenceState;
  reference?: string;
  href?: string;
};

// This is a deliberately small, reviewed record of historical public deployment evidence.
// It is not an indexer and must never override a fresh onchain or Cleanverse read.
export const principalPassport = {
  chain: "Monad testnet",
  passportId: "#1",
  state: "Historical testnet proof" as const,
  statusDetail: "On Aug. 9, 2026, Passport #1 permitted a 0.05 aUSDC transfer from the CVI-registered vault back to the verified principal on Monad.",
  principal: "CVI verified in recorded proof",
  registry: "0xcf14…4c8B",
  registryAddress: "0xcf145f0730989137cce3b94863490e6ac0f84c8b",
  vault: "0x0355…2837",
  vaultAddress: "0x0355E4c81d0bD4212A1c0402E0438DCd7ED52837",
  codeHash: "0x7a82…39edee",
  asset: "aUSDC · 0xaC08…1f20D",
  authority: "aUSDC transfer calls, per-call capped",
  cap: "0.10 aUSDC per transfer",
  expiry: "2026-08-10 14:00 UTC",
  nonce: "0",
  evidence: [
    {
      title: "A-Pass activated",
      detail: "The configured principal has an active Cleanverse CVI on Monad.",
      state: "verified" as const,
      reference: "Cleanverse record 1902",
    },
    {
      title: "Factory and vault deployed",
      detail: "The role-holding factory created the immutable vault on Monad testnet.",
      state: "verified" as const,
      reference: "Factory 0xcf14…4c8B · Vault 0x0355…2837",
      href: "https://testnet.monadscan.com/address/0xcf145f0730989137cce3b94863490e6ac0f84c8b",
    },
    {
      title: "Registrar authority confirmed",
      detail: "The factory holds the Validator REGISTER_ROLE required for pool registration.",
      state: "verified" as const,
      reference: "Onchain role check: true",
    },
    {
      title: "Pool and vault CVI verified",
      detail: "The Validator accepted the factory-mediated RuleV2 registration, then registered CVI for the vault and configured aUSDC.",
      state: "verified" as const,
      reference: "Pool tx 0x82e5…02af · CVI tx 0x73b5…cc94",
      href: "https://testnet.monadscan.com/tx/0x73b5406864fd228c20bb516098d3a255136fffa411fed5fe4f7963f0e422cc94",
    },
    {
      title: "Passport transfer verified",
      detail: "A 0.05 aUSDC deposit entered the vault. Passport #1 returned PERMITTED, then the vault transferred the same amount back to the verified principal.",
      state: "verified" as const,
      reference: "Deposit tx 0x7797…b250 · Permitted tx 0x43cd…349f",
      href: "https://testnet.monadscan.com/tx/0x43cdf188d90c0a2e8ce01ad566b2e5a9efa3c820bd676f5fa99d19ed551a349f",
    },
  ] satisfies EvidenceItem[],
};

export type PrincipalPassport = typeof principalPassport;
