# Principal 90-Second Judging Demo

Use the public deployment at https://cleanverse-two.vercel.app. Every core claim below is either rerun live or linked to a public Monad receipt. The demo does not broadcast a transaction or mutate CVI state.

## Criterion-led script

| Time | Show | Say | Scored criterion | Proof the judge can verify |
| --- | --- | --- | --- | --- |
| 0 to 8 seconds | Open the landing page with the authority graph visible. | "Cleanverse verifies people and assets, but an institution still needs to know which exact contract is acting for a verified controller and where that authority ends." | Concept and Problem Definition, 20 | The problem and product relationship are visible immediately, with no setup. |
| 8 to 18 seconds | Open the workspace. Point to Passport #2, the verified principal relationship, factory-created vault, runtime code hash, aUSDC capability, cap, and expiry. | "Principal gives that contract a passport. It binds one CVI principal to this exact vault code, one Cleanverse asset action, a 0.10 aUSDC per-transfer cap, expiry, and nonce." | Concept and Problem Definition, 20. Depth of CVI and CVA Integration, 30. | The public Contract Passport shows the deployed identifiers and links to the underlying evidence. |
| 18 to 34 seconds | Keep the prefilled recipient and `0.05`, then select `Check authority`. Change only the amount to `0.11` and check again. | "This is the deployed contract deciding live. It permits 0.05 and blocks 0.11 as `AMOUNT_CAP_EXCEEDED`. Both are read-only Monad calls, so the judge needs no wallet, signature, or Cleanverse key." | Build Quality, 25. UX and Demo, 15. | Active Passport #2 returns `PERMITTED` for 0.05 and `AMOUNT_CAP_EXCEEDED` for 0.11 through two repeatable public `eth_call` requests. |
| 34 to 48 seconds | Scroll to the evidence timeline. Open the pool and vault-CVI receipt. | "The role-holding factory created the vault, registered its RuleV2 pool with the CCP Validator, and registered CVI for the vault and aUSDC. These are separate compliance layers, and both are confirmed on Monad." | Depth of CVI and CVA Integration, 30. | Pool registration `0x82e5...02af` and vault CVI registration `0x73b5...cc94` both have successful receipts. |
| 48 to 62 seconds | Open the Passport #1 permitted-return receipt and point to the successful aUSDC movement. | "The proof goes beyond a preflight. A real 0.05 aUSDC deposit entered the vault, Passport #1 returned `PERMITTED`, and the vault returned the exact amount to the verified principal." | Depth of CVI and CVA Integration, 30. Build Quality, 25. | Permitted return `0x43cd...349f` is public. The receipt and emitted transfer prove CVA movement through Principal. |
| 62 to 76 seconds | Show the repository verification section or pre-run terminal output with both suites passing. | "The same enforcement is tested against bad recipients, zero amounts, cap breaches, repeated calls, expiry, revocation, controller changes, code changes, and Validator failure. Thirty-five web tests and twenty contract tests pass, including 512 fuzz runs." | Build Quality, 25. | The public source contains the tests and commands. The output is repeatable from the repository. |
| 76 to 90 seconds | Return to the full Contract Passport, then the authority graph. | "Principal currently proves one complete vault flow. The same passport boundary can extend to escrows, routers, and smart accounts while Cleanverse remains the identity, policy, and verified-asset layer." | Scalability Potential, 10. | The shipped implementation proves one narrow flow. The extra contract types are clearly presented as extension paths. |

## Recording notes

- Keep the live landing page, workspace, two Monad receipts, and repository test output open in separate tabs before recording.
- Use only factory `0xcf145f0730989137cce3b94863490e6ac0f84c8b`, vault `0x0355E4c81d0bD4212A1c0402E0438DCd7ED52837`, active Passport #2, and the corrected recipient-check evidence.
- Do not refresh the optional Cleanverse UAT status during the recording. The scored integration is better shown through the onchain preflight and successful public receipts.
- Do not broadcast another CVA transfer. The completed Passport #1 receipt proves movement without adding network risk.
- Run the public `0.05` and `0.11` checks immediately before recording. Save screenshots of both result states, the pool and CVI receipts, and the permitted transfer as offline fallback evidence.
