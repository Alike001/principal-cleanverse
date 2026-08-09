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
  state: "Pool registration blocked" as const,
  statusDetail: "Validator registration has not completed, so Principal cannot issue a passport or attempt a CVA transfer.",
  principal: "Active A-Pass wallet",
  registry: "0x2683…4291",
  registryAddress: "0x2683f26DDc6c2aF920Ee844150000a59FBBd4291",
  vault: "0xDd26…3cA1",
  vaultAddress: "0xDd2655899cAE1D86213A0F744aa808446A563cA1",
  codeHash: "0x796c…e59bc",
  asset: "aUSDC · 0xaC08…1f20D",
  authority: "One aUSDC transfer capability, pending",
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
      reference: "Factory 0x2683…4291 · Vault 0xDd26…3cA1",
      href: "https://testnet.monadscan.com/address/0x2683f26DDc6c2aF920Ee844150000a59FBBd4291",
    },
    {
      title: "Registrar authority confirmed",
      detail: "The factory holds the Validator REGISTER_ROLE required for pool registration.",
      state: "verified" as const,
      reference: "Onchain role check: true",
    },
    {
      title: "Pool registration blocked",
      detail: "Validator registerV2 reverts before broadcast, although the pool is nonzero, unregistered, and called by the role-holding factory.",
      state: "blocked" as const,
      reference: "No CVA transfer was attempted",
    },
  ] satisfies EvidenceItem[],
};

export type PrincipalPassport = typeof principalPassport;
