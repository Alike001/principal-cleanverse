# Principal

Principal makes the controller of a smart contract explicit before it can move a Cleanverse Verified Asset. Its public inspector reads any deployed Principal registry and passport ID on Monad, then reruns the deterministic authority decision against the vault bound by that passport.

Live demo: [principal-cleanverse.vercel.app](https://principal-cleanverse.vercel.app)

## Live Monad testnet proof

- Principal factory: [`0xab04…7b5B`](https://testnet.monadscan.com/address/0xab048434357b70ec7b7773ea3ef595a774cb7b5b)
- Factory-created vault: [`0x1115…9335`](https://testnet.monadscan.com/address/0x1115a4C26e6A4ED66C234b5290C3D427Cb1c9335)
- The factory received the Validator `REGISTER_ROLE` in this [confirmed transaction](https://testnet.monadscan.com/tx/0x3006e3cda0a3bc4f5cae255d70330a262309503ca769da8de5d416171e32b632).
- The Validator recognizes the vault pool and its CVI for Monad aUSDC. [Pool registration](https://testnet.monadscan.com/tx/0x214baaf32a4a65fac995c493dfa073289495de88024a8e2ec8bafd57914a5112) and [vault CVI registration](https://testnet.monadscan.com/tx/0x07372de9e9b45167fdea4e95d0a026232c47d3d8b8cea9a9269b414b33f554cf) both confirmed.
- [Passport #1](https://testnet.monadscan.com/tx/0x746a348b135474c11c7068e4dfc036e65090ada20c6b35d8cf4d9bab336fddbc) set a 1.00 aUSDC total allowance. The vault received [1.00 aUSDC](https://testnet.monadscan.com/tx/0x3d20b402b144e2173c1438c2b6aa8c78fd3886f98b6077f1e077f657af7c6b8d), then [returned 0.60 aUSDC through the Passport](https://testnet.monadscan.com/tx/0xf8e203e9cf228554a236cc2c874ecb268400699268ef22e7d4637d197a8c0d0e). Direct onchain reads show 0.40 aUSDC remaining and return `ALLOWANCE_EXHAUSTED` for a 0.50 aUSDC request.

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

The contract suite covers factory provenance, one-vault creation, principal eligibility, recipient eligibility, controller change, expiry, revocation, cumulative allowance exhaustion, failed-CVA rollback, zero amounts, and Validator failure. The web tests cover encryption, strict response validation, timeout redaction, safe Cleanverse browser responses, legacy and cumulative Passport decoding, and deterministic passport evaluation.

## Architecture

Onchain state holds factory provenance, vault ownership, code binding, the passport mandate, and transfer enforcement. Cleanverse CVI and CVA remain the source of identity and asset eligibility. Server-only code reads Monad and calls the optional Cleanverse API. The browser receives only validated onchain Passport data, safe status summaries, and reviewed public evidence.

Passport #1 permits up to `1.00 aUSDC` in total until Aug. 16, 2026 at 19:38 UTC or until it is revoked. Every permitted transfer atomically records spend before CVA movement. The confirmed 0.60 aUSDC transfer left `0.40 aUSDC` available, and a 0.50 aUSDC preflight now fails as `ALLOWANCE_EXHAUSTED`.

Principal does not claim to prove legal ownership, custody, licensing, or regulatory approval.
