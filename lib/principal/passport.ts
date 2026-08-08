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
  passportId: "principal-monad-01",
  state: "Pool registration blocked" as const,
  statusDetail: "Validator registration has not completed, so no CVA transfer can be attempted.",
  principal: "Active A-Pass wallet",
  registry: "0xaa89…80d6",
  registryAddress: "0xaa8916744CFc7A04ECA14EFE9c5125aF741680d6",
  vault: "0x1628…03d1",
  vaultAddress: "0x1628fD2936AD655D5260FF5F8c1C0700558803d1",
  codeHash: "Awaiting RPC refresh",
  asset: "aUSDC · 0xaC08…1f20D",
  authority: "One aUSDC transfer capability",
  cap: "1.00 aUSDC",
  expiry: "Aug 16, 2026, 23:59 UTC",
  nonce: "1",
  evidence: [
    {
      title: "A-Pass activated",
      detail: "The configured principal has an active Cleanverse CVI on Monad.",
      state: "verified" as const,
      reference: "Cleanverse record 1902",
    },
    {
      title: "Principal contracts deployed",
      detail: "The registry and immutable vault were deployed to Monad testnet.",
      state: "verified" as const,
      reference: "Registry 0xaa89…80d6 · Vault 0x1628…03d1",
      href: "https://testnet.monadscan.com/address/0xaa8916744CFc7A04ECA14EFE9c5125aF741680d6",
    },
    {
      title: "Registrar authority confirmed",
      detail: "The registry holds the Validator REGISTER_ROLE required for pool registration.",
      state: "verified" as const,
      reference: "Transaction 0x7f33…7fd3",
      href: "https://testnet.monadscan.com/tx/0x7f3374762f3071f394d38ff2582618a80ad2b1bca819574dd6596caec7eb7fd3",
    },
    {
      title: "Pool registration blocked",
      detail: "Validator registerV2 reverts before broadcast. Cleanverse support is reviewing its required pool relationship.",
      state: "blocked" as const,
      reference: "No CVA transfer was attempted",
    },
  ] satisfies EvidenceItem[],
};

export type PrincipalPassport = typeof principalPassport;
