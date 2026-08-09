# Principal

## Problem

Cleanverse CVI verifies wallets and CVA protects transfers, but a smart contract can still move institutional assets without making its accountable controller and exact deployed code easy to verify.

## Solution

Principal is a Monad contract-identity primitive. It binds one CVI-verified principal to one immutable vault, one CVA asset, one transfer capability, an amount cap, expiry, nonce, and code hash. Every protected transfer asks the onchain registry for a deterministic decision. A controller change, expired mandate, revoked passport, failed principal check, failed recipient check, or cap breach blocks movement.

## Cleanverse integration

- CVI: the configured principal has a real active A-Pass on Monad.
- CCP Validator: Principal’s deployed factory received `REGISTER_ROLE` through the encrypted Cleanverse `validator/grant` flow.
- CVA: Principal is configured for Cleanverse Monad aUSDC and its pool registration uses the documented CCP Validator path.

## Deployed chain and verified state

- Chain: Monad testnet, chain ID 10143.
- Factory: `0x2683f26DDc6c2aF920Ee844150000a59FBBd4291`.
- Factory-created vault: `0xDd2655899cAE1D86213A0F744aa808446A563cA1`.
- Factory role: confirmed `REGISTER_ROLE` onchain.
- Vault registration: currently blocked. `registerV2` reverts during gas estimation even though the vault is nonzero, unregistered, and called from the role-holding factory. No CVA transfer, token balance, or successful passport issuance is claimed in this summary.

## Why it matters

Principal makes a compliant contract’s authority inspectable and revocable at the contract layer. It gives institutions and protocol engineers a narrow, testable way to connect Cleanverse identity to the exact software that acts on verified assets.
