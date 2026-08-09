# Principal

## Problem

Cleanverse CVI verifies wallets and CVA protects transfers, but a smart contract can still move institutional assets without making its accountable controller and exact deployed code easy to verify.

## Solution

Principal is a Monad contract-identity primitive. It binds one CVI-verified principal to one immutable vault, one CVA asset, one transfer capability, an amount cap, expiry, nonce, and code hash. Every protected transfer asks the onchain registry for a deterministic decision. A controller change, expired mandate, revoked passport, failed principal check, failed recipient check, or cap breach blocks movement.

## Cleanverse integration

- CVI: the configured principal has a real active A-Pass on Monad.
- CCP Validator: Principal’s deployed factory received `REGISTER_ROLE` through the encrypted Cleanverse `validator/grant` flow.
- CVA: Principal's factory-created vault is registered as a Validator pool and has received the required CVI for Cleanverse Monad aUSDC through the documented CCP path.

## Deployed chain and verified state

- Chain: Monad testnet, chain ID 10143.
- Factory: `0xc58d8746762cfB34066D2ADED4a4A6dD76D62719`.
- Factory-created vault: `0xa92026e106562314667479786a914A1D81e09e9D`.
- Factory role: confirmed `REGISTER_ROLE` onchain.
- Validator pool: registered on Monad. Vault CVI for aUSDC: registered on Monad. No CVA transfer, token balance, or successful passport issuance is claimed in this summary.

## Why it matters

Principal makes a compliant contract’s authority inspectable and revocable at the contract layer. It gives institutions and protocol engineers a narrow, testable way to connect Cleanverse identity to the exact software that acts on verified assets.
