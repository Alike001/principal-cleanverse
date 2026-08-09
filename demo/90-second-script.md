# Principal 90-Second Judging Demo

This script uses the completed Monad deployment and does not mutate the principal's CVI or broadcast a new transaction. Every core claim points to a public transaction, contract state, or repeatable test.

## Demo script

| Time | Show | Say | Scored criterion | Verifiable proof |
| --- | --- | --- | --- | --- |
| 0 to 9 seconds | Open the landing page with the authority graph visible. | "Cleanverse verifies people and assets, but an institution still needs to know which exact contract is acting for a verified controller and where that authority ends." | Concept and Problem Definition, 20 | The problem and product relationship are visible before any setup. |
| 9 to 20 seconds | Select `Open workspace`. Point to the active principal, factory-created vault, Cleanverse Validator, and aUSDC nodes. | "Principal gives that contract a passport. This live flow connects one CVI principal, a role-holding factory, its exact vault, the CCP Validator, and Cleanverse aUSDC." | Depth of CVI and CVA Integration, 30 | The workspace shows the deployed factory and vault plus links to public registration evidence. |
| 20 to 38 seconds | Leave the verified recipient prefilled and select `Check authority` for `0.05`. Then change the amount to `0.11` and check again. | "The passport binds authority to this bytecode, this asset, a 0.10 aUSDC per-transfer cap, expiry, and nonce. The deployed contract permits 0.05 and blocks 0.11 as `AMOUNT_CAP_EXCEEDED`. Both are live read-only calls, with no wallet or transaction." | Concept and Problem Definition, 20. Build Quality, 25. UX and Demo, 15. | Two Monad `eth_call` requests rerun Passport #1. The first displays `PERMITTED`; the second displays `AMOUNT_CAP_EXCEEDED`. |
| 38 to 52 seconds | Scroll to the evidence timeline. Open the pool-registration and vault-CVI evidence. | "The factory has Cleanverse registrar authority. It registered the vault's RuleV2 pool, then registered CVI for that vault and aUSDC. Those are separate CCP and CVA compliance layers, and both are real Monad transactions." | Depth of CVI and CVA Integration, 30 | Pool registration: `0x82e5...02af`. Vault CVI registration: `0x73b5...cc94`. Both receipts have status 1. |
| 52 to 66 seconds | Open the permitted return transaction in Monadscan. Point to the successful receipt and token transfer. | "A 0.05 aUSDC deposit entered the vault. Passport #1 evaluated to `PERMITTED`, the vault returned the exact amount to the verified principal, and the final vault balance is zero." | Depth of CVI and CVA Integration, 30. Build Quality, 25. | Permitted transfer: `0x43cd...349f`. The receipt and emitted events are public. The final principal balance is 10 aUSDC and the vault balance is zero. |
| 66 to 80 seconds | Return to the workspace, then briefly show the successful test output or repository verification commands. | "The same enforcement is tested against bad recipients, zero amounts, per-transfer cap breaches, repeated calls, expiry, revocation, controller and code changes, and Validator failure. Cleanverse credentials stay on the server, while the judge path needs no wallet or secret." | Build Quality, 25. UX and Demo, 15. | Thirty-one web tests and twenty Foundry tests pass, including 512 fuzz runs. The commands are repeatable from the public repository. |
| 80 to 90 seconds | End on the full Contract Passport and authority graph. | "The same passport pattern can protect vaults, escrows, routers, and smart accounts while Cleanverse remains the identity and verified-asset enforcement layer." | Scalability Potential, 10 | This is a documented extension path. The submitted build proves one complete vault flow and does not claim those extra integrations are already shipped. |

## Demo operator notes

- Keep the workspace and transaction tabs open before recording so navigation does not consume the 90 seconds.
- Use the completed corrected deployment only: factory `0xcf145f0730989137cce3b94863490e6ac0f84c8b` and vault `0x0355E4c81d0bD4212A1c0402E0438DCd7ED52837`.
- Do not use the earlier deployments or the old recipient-check evidence.
- Do not freeze the principal or broadcast another transfer during the demo. The completed receipts provide stronger evidence without risking sponsor or RPC latency.
- Run the live `0.05` and `0.11` checks once immediately before recording. Keep screenshots of both result states as the local fallback.
- Record a local fallback with the same real receipts and screenshots in case Monadscan or the venue network is unavailable.
