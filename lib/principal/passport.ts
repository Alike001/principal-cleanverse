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
  state: "Cumulative testnet passport" as const,
  statusDetail: "On Aug. 9, 2026, Passport #1 set a 1.00 aUSDC cumulative allowance. A real 0.60 aUSDC transfer consumed part of it, leaving 0.40 aUSDC available.",
  principal: "CVI verified in recorded proof",
  registry: "0xab04…7b5B",
  registryAddress: "0xab048434357b70ec7b7773ea3ef595a774cb7b5b",
  vault: "0x1115…9335",
  vaultAddress: "0x1115a4C26e6A4ED66C234b5290C3D427Cb1c9335",
  codeHash: "0x1b60…7108f2",
  asset: "aUSDC · 0xaC08…1f20D",
  authority: "aUSDC transfer calls, cumulatively bounded",
  cap: "1.00 aUSDC total · 0.40 available",
  expiry: "2026-08-16 19:38 UTC",
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
      reference: "Factory 0xab04…7b5B · Vault 0x1115…9335",
      href: "https://testnet.monadscan.com/address/0xab048434357b70ec7b7773ea3ef595a774cb7b5b",
    },
    {
      title: "Cumulative Passport issued",
      detail: "Passport #1 bound the verified principal, immutable vault code, Monad aUSDC, a 1.00 aUSDC total allowance, and a seven-day expiry.",
      state: "verified" as const,
      reference: "Passport tx 0x746a…ddbc",
      href: "https://testnet.monadscan.com/tx/0x746a348b135474c11c7068e4dfc036e65090ada20c6b35d8cf4d9bab336fddbc",
    },
    {
      title: "Pool and vault CVI verified",
      detail: "The Validator accepted the factory-mediated RuleV2 registration, then registered CVI for the vault and configured aUSDC.",
      state: "verified" as const,
      reference: "Pool tx 0x214b…5112 · CVI tx 0x0737…54cf",
      href: "https://testnet.monadscan.com/tx/0x07372de9e9b45167fdea4e95d0a026232c47d3d8b8cea9a9269b414b33f554cf",
    },
    {
      title: "Cumulative transfer verified",
      detail: "The vault received 1.00 aUSDC. Passport #1 permitted a 0.60 aUSDC return, atomically recording spend and leaving 0.40 aUSDC available.",
      state: "verified" as const,
      reference: "Funding tx 0x3d20…6b8d · Transfer tx 0xf8e2…0d0e",
      href: "https://testnet.monadscan.com/tx/0xf8e203e9cf228554a236cc2c874ecb268400699268ef22e7d4637d197a8c0d0e",
    },
  ] satisfies EvidenceItem[],
};

export type PrincipalPassport = typeof principalPassport;
