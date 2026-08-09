# Principal

Principal makes the controller of a smart contract explicit before it can move a Cleanverse Verified Asset. It binds one verified CVI principal, one immutable vault, one aUSDC action, a cap, expiry, and a deterministic onchain decision.

## Current Monad testnet evidence

- A Cleanverse A-Pass is active for the configured principal.
- Principal factory: [`0xc58d…2719`](https://testnet.monadscan.com/address/0xc58d8746762cfB34066D2ADED4a4A6dD76D62719)
- Factory-created vault: [`0xa920…e9D`](https://testnet.monadscan.com/address/0xa92026e106562314667479786a914A1D81e09e9D)
- The factory has the Validator `REGISTER_ROLE` onchain.
- The Validator recognizes the vault pool and the vault's CVI for Monad aUSDC. [Pool registration](https://testnet.monadscan.com/tx/0x92982cd77beb8c390a489ab02d9ad5e93af4671d5fc4d57bde289b3962132853) and [vault CVI registration](https://testnet.monadscan.com/tx/0x68150855070ca880929ac26e430a449ea60a0a331eaa1e3d62c1d70530948f89) both confirmed.
- No CVA transfer or passport issuance has been claimed or attempted.

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
