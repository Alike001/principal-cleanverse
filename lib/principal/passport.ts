export type EvidenceState = "verified" | "blocked" | "pending";

export type EvidenceItem = {
  title: string;
  detail: string;
  state: EvidenceState;
  reference?: string;
  href?: string;
};

// This is a deliberately small, reviewed snapshot of confirmed public deployment evidence.
// It is not an indexer and must never override a fresh onchain or Cleanverse read.
export const principalPassport = {
  chain: "Monad testnet",
  passportId: "not issued",
  state: "Pool and CVI verified" as const,
  statusDetail: "The Cleanverse Validator recognizes the factory-created pool and its CVI. A passport and CVA transfer remain separate, unrun actions.",
  principal: "Active A-Pass wallet",
  registry: "0xc58d…2719",
  registryAddress: "0xc58d8746762cfB34066D2ADED4a4A6dD76D62719",
  vault: "0xa920…e9D",
  vaultAddress: "0xa92026e106562314667479786a914A1D81e09e9D",
  codeHash: "0x796c…e59bc",
  asset: "aUSDC · 0xaC08…1f20D",
  authority: "One aUSDC transfer capability, not issued",
  cap: "1.00 aUSDC proposed",
  expiry: "Set at passport issuance",
  nonce: "Assigned at passport issuance",
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
      reference: "Factory 0xc58d…2719 · Vault 0xa920…e9D",
      href: "https://testnet.monadscan.com/address/0xc58d8746762cfB34066D2ADED4a4A6dD76D62719",
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
      reference: "Pool tx 0x9298…2853 · CVI tx 0x6815…4f89",
      href: "https://testnet.monadscan.com/tx/0x68150855070ca880929ac26e430a449ea60a0a331eaa1e3d62c1d70530948f89",
    },
  ] satisfies EvidenceItem[],
};

export type PrincipalPassport = typeof principalPassport;
