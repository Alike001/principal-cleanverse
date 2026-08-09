# Principal

Live demo: https://principal.vercel.app

## Problem

Cleanverse CVI verifies wallets and CVA protects transfers, but a smart contract can still move institutional assets without making its accountable controller and exact deployed code easy to verify.

## Solution

Principal is a Monad contract-identity primitive. It binds one CVI-verified principal to one immutable vault, one CVA asset, one transfer capability, a cumulative allowance, expiry, nonce, and code hash. Every protected transfer asks the onchain registry for a deterministic decision, then atomically consumes only the amount permitted by that Passport. A controller change, expired mandate, revoked passport, failed principal check, failed recipient check, zero amount, or exhausted allowance blocks movement.

## Cleanverse integration

- CVI: the configured principal has a real active A-Pass on Monad.
- CCP Validator: Principal’s deployed factory received `REGISTER_ROLE` through the encrypted Cleanverse `validator/grant` flow.
- CVA: Principal's factory-created vault is registered as a Validator pool, has its required CVI, received 1.00 aUSDC, and returned 0.60 aUSDC through the Passport #1 permission check.

## Deployed chain and verified state

- Chain: Monad testnet, chain ID 10143.
- Factory: `0xab048434357b70ec7b7773ea3ef595a774cb7b5b`.
- Factory-created vault: `0x1115a4C26e6A4ED66C234b5290C3D427Cb1c9335`.
- Factory role: confirmed `REGISTER_ROLE` onchain.
- Validator pool: registered on Monad. Vault CVI for aUSDC: registered on Monad. Active Passport #1: issued with a 1.00 aUSDC cumulative allowance through Aug. 16, 2026 at 19:38 UTC. CVA proof: 1.00 aUSDC entered the vault and Passport #1 permitted a 0.60 aUSDC return. Final vault balance: 0.40 aUSDC. A 0.50 aUSDC onchain preflight returns `ALLOWANCE_EXHAUSTED`.

## Why it matters

Principal makes a compliant contract’s authority inspectable and revocable at the contract layer. It gives institutions and protocol engineers a narrow, testable way to connect Cleanverse identity to the exact software that acts on verified assets.
