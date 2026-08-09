# Principal

Principal makes the controller of a smart contract explicit before it can move a Cleanverse Verified Asset. Its public inspector reads any deployed Principal registry and passport ID on Monad, then reruns the deterministic authority decision against the vault bound by that passport.

Live demo: [cleanverse-two.vercel.app](https://cleanverse-two.vercel.app)

## Recorded Monad testnet proof

- On Aug. 9, 2026, Cleanverse A-Pass and CVA checks permitted the recorded Principal flow. The web app labels this as historical proof. Its live read-only preflight is the source of truth for the current decision.
- Principal factory: [`0xcf14…4c8B`](https://testnet.monadscan.com/address/0xcf145f0730989137cce3b94863490e6ac0f84c8b)
- Factory-created vault: [`0x0355…2837`](https://testnet.monadscan.com/address/0x0355E4c81d0bD4212A1c0402E0438DCd7ED52837)
- The factory has the Validator `REGISTER_ROLE` onchain.
- The Validator recognizes the vault pool and the vault's CVI for Monad aUSDC. [Pool registration](https://testnet.monadscan.com/tx/0x82e52d5f56a8d7103b48c04e77b03a592b552d464edb7057a596aaa0a31f02af) and [vault CVI registration](https://testnet.monadscan.com/tx/0x73b5406864fd228c20bb516098d3a255136fffa411fed5fe4f7963f0e422cc94) both confirmed.
- [Passport #1](https://testnet.monadscan.com/tx/0xaf20a17858ea78299a3aae5631f7bd59831172d91e7b777b23e0bed6c36ed467) permitted a 0.05 aUSDC vault transfer. [The vault returned the exact amount](https://testnet.monadscan.com/tx/0x43cdf188d90c0a2e8ce01ad566b2e5a9efa3c820bd676f5fa99d19ed551a349f) to the verified principal.

## Run the product

Prerequisites are Node.js 20.9 or newer and pnpm 10. Foundry is only required for the contract suite.

```bash
git clone https://github.com/Alike001/principal-cleanverse.git
cd principal-cleanverse
git submodule update --init --recursive
pnpm install
pnpm dev
```

Open `http://localhost:3000`. The landing page, workspace, evidence links, and live read-only passport check work without a wallet, private key, or Cleanverse credentials. Enter a Principal registry address and passport ID to load the current onchain tuple, then check a recipient and amount. The server reloads the passport before each decision and calls Monad with `eth_call`, so it never signs or broadcasts a transaction.

Copy `.env.example` to `.env.local` only if you need the optional server-side Cleanverse CVI refresh. That route requires `CLEANVERSE_API_ID`, `CLEANVERSE_API_KEY`, and `DEMO_PRINCIPAL_ADDRESS`. Keep those values on the server. The live passport evaluator does not need Cleanverse credentials.

## Verify

```bash
pnpm test
pnpm typecheck
pnpm build

cd contracts
forge fmt --check src test script
forge build
forge test -vvv
```

The contract suite covers factory provenance, one-vault creation, principal eligibility, recipient eligibility, controller change, expiry, revocation, per-transfer cap failures, repeated permitted calls, zero amounts, and Validator failure. The web tests cover encryption, strict response validation, timeout redaction, safe Cleanverse browser responses, and deterministic passport evaluation.

## Architecture

Onchain state holds factory provenance, vault ownership, code binding, the passport mandate, and transfer enforcement. Cleanverse CVI and CVA remain the source of identity and asset eligibility. Server-only code reads Monad and calls the optional Cleanverse API. The browser receives only validated onchain Passport data, safe status summaries, and reviewed public evidence.

Passport #2 allows up to `0.10 aUSDC` in each transfer call until Aug. 16, 2026 at 17:04 UTC or until it is revoked. It is not a cumulative spending budget. Passport #1 remains the public receipt for the completed 0.05 aUSDC transfer proof.

Principal does not claim to prove legal ownership, custody, licensing, or regulatory approval.
