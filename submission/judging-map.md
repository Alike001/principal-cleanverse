# Principal Judging-Criteria Map

Source: the official Cleanverse Build: Trusted Assets rubric saved in `research/domain-knowledge.md`. The published scoring is Concept and Problem Definition 20 points, Depth of CVI and CVA Integration 30 points, Build Quality 25 points, UX and Demo 15 points, and Scalability Potential 10 points.

## Criterion mapping

| Criterion | Feature that demonstrates it | What a judge can verify | Current strength | Honest weakness |
| --- | --- | --- | --- | --- |
| Concept and Problem Definition, 20 | The Contract Passport binds one accountable CVI principal to factory provenance, immutable vault bytecode, one CVA capability, a per-transfer cap, expiry, and nonce. It addresses the gap between verifying a wallet and trusting the contract acting for it. | Open the [live workspace](https://cleanverse-two.vercel.app/workspace). Passport #2 shows the controller relationship, vault, code hash, asset, cap, expiry, and nonce before the judge runs a check. | Strong. The problem and mechanism form one clear pair. | The pain is validated by the sponsor's contract architecture and public market research, but there is no institution interview, signed pilot, or usage data. Do not claim market adoption. |
| Depth of CVI and CVA Integration, 30 | A real CVI principal controls the factory. That factory holds `REGISTER_ROLE`, created the vault, registered its RuleV2 pool, and registered CVI for the vault and aUSDC. Passport #1 then permitted live CVA movement, while Passport #2 keeps the mandate inspectable. | Open the pool-registration receipt, vault-CVI receipt, Passport #2 receipt, and Passport #1 deposit and permitted-return receipts from the public evidence timeline. Removing CVI, CCP, or CVA breaks the core flow. | Strongest criterion. Cleanverse supplies identity, registrar authority, pool policy, contract eligibility, asset eligibility, and settlement. | The shipped proof uses one CVA and one permissive RuleV2 policy. It proves lifecycle depth, not policy breadth. |
| Build Quality, 25 | The role-holding factory proves deployment provenance. The immutable vault and passport bind controller, runtime code hash, asset, action, cap, expiry, and nonce. Evaluation is deterministic, returns named reason codes, fails closed, and has RPC failover. Secrets stay server-side. | Run `0.05` and `0.11` through the public preflight, inspect the public receipts, and run the repository checks. Thirty-five web tests and twenty Foundry tests pass, including 512 fuzz runs. | Strong. The core mechanism is deployed on Monad, tested, and independently inspectable. | There is no independent audit or event indexer. An ineligible recipient is proven by live read-only evaluation and local contract tests, but no deliberately failing CVA transfer was broadcast on testnet. |
| UX and Demo, 15 | The landing page explains the problem, the workspace reruns the deployed decision, the evidence timeline links to receipts, and the docs explain the product. No wallet, Cleanverse key, or setup is required for the judge path. | Visit [cleanverse-two.vercel.app](https://cleanverse-two.vercel.app), open the workspace, check `0.05`, change it to `0.11`, and follow an evidence link. | Strong and judge-ready. The public deployment returns both live decisions and works without local secrets. | The final recorded demo and submission screenshots are still unfinished. The optional direct Cleanverse refresh can be unavailable when sponsor UAT is down, so the core demo must use the onchain preflight and public receipts. |
| Scalability Potential, 10 | The passport mechanism separates factory provenance, vault enforcement, Cleanverse Validator policy, and CVA transfer rules. The same pattern could bind authority for other contract-held CVA workflows. | Show the reusable boundary between registry, vault, Validator, and CVA, then point to the narrow deployed implementation as proof of feasibility. | Credible architecture, limited shipped breadth. | Weakest criterion. The product currently ships one principal, one immutable vault, one CVA, and one action. It does not ship a multi-vault registry, SDK, indexer, multi-chain deployment, or institutional pilot. Present vaults, escrows, routers, and smart accounts as extension paths, not completed features. |

## Additional published considerations

These event considerations do not have separate point allocations, but Principal has explicit evidence for each one.

| Consideration | Principal evidence | Honest limit |
| --- | --- | --- |
| Meaningful Cleanverse use | CVI identifies the principal, CCP governs the registered vault pool, and CVA enforces identity-aware aUSDC transfer rules. | The proof uses one CVA and one permissive pool rule. |
| Real financial infrastructure problem | Institutions can verify a wallet, but still need narrow, inspectable authority for the exact contract acting over verified assets. | The pain is supported by protocol structure and market research, not a signed institutional pilot. |
| Pilotability | A vault integrator can inspect the public app, contract fields, decision enum, source, tests, and receipts without receiving Cleanverse credentials. | No institution or merchant has committed to a pilot. |
| Improved trust and compliance | The same current state produces the same named result. Failed checks block authority rather than silently degrading. | Principal does not determine legal ownership, custody, licensing, or regulatory approval. |
| Technical feasibility | The full flow is deployed on Monad, aUSDC moved through the vault, and the public app reruns the onchain decision. | There is no independent audit or production monitoring service. |

## Priority gaps before submission

1. Record the final demo from the public deployment and save fallback screenshots of `PERMITTED`, `AMOUNT_CAP_EXCEEDED`, registration proof, and the successful CVA transfer.
2. Keep the scalability claim architectural and specific. Do not imply that multi-vault, SDK, indexer, or multi-chain support already ships.
3. Avoid unsupported adoption or legal claims. The strongest case is the sponsor gap, deep Cleanverse lifecycle integration, deterministic enforcement, and public onchain evidence.

## Four-sentence pitch

Institutions can verify a wallet with Cleanverse, but they still cannot see at a glance which exact smart contract may act for that verified controller or where its authority ends. Principal is a Contract Passport for Cleanverse-verified smart-contract operations on Monad. It binds the controller's CVI, factory provenance, immutable vault bytecode, CVA asset, permitted action, per-transfer cap, expiry, and nonce, then reruns the CCP and contract checks as a deterministic permit-or-block result before aUSDC moves. This makes delegated onchain operations inspectable and revocable, which is the control layer institutions need before verified assets can safely flow through vaults, routers, escrows, and smart accounts.
