# Principal

Principal makes the controller of a smart contract explicit before it can move a Cleanverse Verified Asset. It binds one verified CVI principal, one immutable vault, one aUSDC action, a cap, expiry, and a deterministic onchain decision.

## Current Monad testnet evidence

- A Cleanverse A-Pass is active for the configured principal.
- Principal factory: [`0x2683…4291`](https://testnet.monadscan.com/address/0x2683f26DDc6c2aF920Ee844150000a59FBBd4291)
- Factory-created vault: [`0xDd26…3cA1`](https://testnet.monadscan.com/address/0xDd2655899cAE1D86213A0F744aa808446A563cA1)
- The factory has the Validator `REGISTER_ROLE` onchain.
- The vault is not registered with the Cleanverse Validator yet. `registerV2` currently reverts during estimation despite a nonzero, unregistered vault and confirmed factory role. No CVA transfer or passport issuance has been claimed or attempted.

## Run the product

```bash
pnpm install
pnpm dev
```

The judge path loads without secrets and shows the reviewed testnet evidence. A local `.env.local` is only needed for the optional live CVI refresh route. Never put Cleanverse credentials or private keys in browser code.

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

The contract suite covers factory provenance, one-vault creation, principal eligibility, recipient eligibility, controller change, expiry, revocation, cap failures, and Validator failure. The web tests cover encryption and safe Cleanverse browser responses.

## Architecture

Onchain state holds factory provenance, vault ownership, code binding, the passport mandate, and transfer enforcement. Cleanverse CVI and CVA remain the source of identity and asset eligibility. Server-only code calls the Cleanverse API. The browser receives only safe status summaries and reviewed public evidence.

Principal does not claim to prove legal ownership, custody, licensing, or regulatory approval.
