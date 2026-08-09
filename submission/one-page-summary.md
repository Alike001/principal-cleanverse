# Principal

Live demo: https://cleanverse-two.vercel.app

## Problem

Cleanverse CVI verifies wallets and CVA protects transfers, but a smart contract can still move institutional assets without making its accountable controller and exact deployed code easy to verify.

## Solution

Principal is a Monad contract-identity primitive. It binds one CVI-verified principal to one immutable vault, one CVA asset, one transfer capability, a per-transfer amount cap, expiry, nonce, and code hash. Every protected transfer asks the onchain registry for a deterministic decision. A controller change, expired mandate, revoked passport, failed principal check, failed recipient check, zero amount, or per-transfer cap breach blocks movement.

## Cleanverse integration

- CVI: the configured principal has a real active A-Pass on Monad.
- CCP Validator: Principal’s deployed factory received `REGISTER_ROLE` through the encrypted Cleanverse `validator/grant` flow.
- CVA: Principal's factory-created vault is registered as a Validator pool, has its required CVI, received 0.05 aUSDC, and returned it through the Passport #1 permission check.

## Deployed chain and verified state

- Chain: Monad testnet, chain ID 10143.
- Factory: `0xcf145f0730989137cce3b94863490e6ac0f84c8b`.
- Factory-created vault: `0x0355E4c81d0bD4212A1c0402E0438DCd7ED52837`.
- Factory role: confirmed `REGISTER_ROLE` onchain.
- Validator pool: registered on Monad. Vault CVI for aUSDC: registered on Monad. Active Passport #2: issued with a 0.10 aUSDC per-transfer cap through Aug. 16, 2026 at 17:04 UTC. CVA proof: Passport #1 permitted 0.05 aUSDC to enter and return from the vault. Final vault balance: zero.

## Why it matters

Principal makes a compliant contract’s authority inspectable and revocable at the contract layer. It gives institutions and protocol engineers a narrow, testable way to connect Cleanverse identity to the exact software that acts on verified assets.
