# Cleanverse Build: Trusted Assets Hackathon domain knowledge

Research date: 2026-08-07

Evidence labels used below:

- Verified fact: stated by an official source or confirmed in source code.
- Inference: a conclusion drawn from multiple facts, clearly marked.
- Open question: a point that still needs sponsor documentation, sandbox access, or organizer confirmation.

## 1. Judging criteria and track rules

### Current event identity and schedule

Verified facts from the [official hackathon page](https://cleanverse.com/hackathon):

- The current event is Cleanverse Build: Trusted Assets Hackathon, supported by Monad Foundation.
- Registration runs from July 21 through August 7 at 23:59 UTC.
- The hacking period is August 8 at 00:00 UTC through August 9 at 23:59 UTC.
- Results are scheduled for August 14 UTC.
- The prize pool is $16,000 USDC. Each track awards $5,000, $2,000, and $1,000 to its top three projects.
- The official page says code, demo videos, and live deployments are reviewed directly.
- At the time of this research, 2026-08-07 01:25 UTC, registration had about 22 hours and 34 minutes remaining.

The page contains stale material from the earlier Verified Finance event. Its browser title still says Verified Finance and a modal mentions a June result date. The current page body, current dates, new RWA and DeFi tracks, and August schedule are internally consistent, so those are treated as authoritative. The stale elements should not be used for planning.

### Published scoring

The current 100-point rubric is:

| Criterion | Points | Build implication |
| --- | ---: | --- |
| Concept and Problem Definition | 20 | The user and pain must be obvious, specific, and real. |
| Depth of CVI and CVA Integration | 30 | Cleanverse must carry the mechanism, not appear as a login badge. |
| Build Quality | 25 | Working code, reliability, tests, and a real deployment matter heavily. |
| UX and Demo | 15 | A clear user flow and presentation are scored. |
| Scalability Potential | 10 | The project needs a credible path beyond one scripted case. |

Verified answer for Phase 3: design and UX are a scored dimension worth 15 points. Visual and interaction quality should receive deliberate attention after the product direction is selected. Build depth and Cleanverse integration together are worth 55 points, so polish cannot replace technical substance.

Additional published considerations are meaningful use of Cleanverse primitives, a real financial infrastructure problem, pilotability with institutions or merchants, improved trust, compliance or interoperability, clear user value, and technical feasibility after the event.

### Tracks and restrictions

RWA track requirements:

- Build tokenization, secondary-market, or settlement infrastructure with compliance embedded from issuance.
- Use CVI and CVA in core logic from the issuance stage.
- Relevant mechanics named by the sponsor include accredited-investor whitelisting, transfer restrictions, and Travel Rule compliant settlement.

DeFi track requirements:

- Build DeFi primitives premised on verified identity.
- Use CVI as an entry condition or a risk parameter.
- Sponsor examples include gated lending pools, gated AMMs, identity-based undercollateralized lending, permissioned staking, and CVA settlement for cross-chain flows.

Projects unrelated to RWA or DeFi, and projects designed to circumvent compliance requirements, are explicitly out of scope.

The event page says builders can use Arbitrum, Base, BNB Chain, Ethereum, HashKey, Monad, or Polygon. Monad is the supporting foundation, but the rules do not require Monad. Choosing it later would need a product or judging reason stronger than sponsor proximity alone.

### Application facts

The form requires a project icon, project name, team or company, contact email, track, team background, and project description. The icon can be PNG, JPG, or SVG, must be at most 2 MB, and has a recommended size of 512 by 512 pixels. The project description accepts 10 to 2,000 characters according to the current client validation. The integration plan is optional and accepts up to 2,000 characters.

The business plan or deck is genuinely optional. Accepted formats are PDF, PPT, PPTX, DOC, and DOCX, with a 10 MB limit. Skipping it does not violate an application requirement. It could still help if it provides evidence that cannot fit in the form, but the current rubric does not award deck points separately.

The application client uploads the icon first, optionally uploads a document, then sends the form to the Cleanverse application API. No application was submitted during this research phase.

## 2. Chain/protocol domain knowledge

### Cleanverse model

Verified facts from the [hackathon page](https://cleanverse.com/hackathon), [Cleanverse architecture page](https://cleanverse.com/how-it-works), and [Cleanverse terms](https://www.cleanverse.com/terms-of-service):

- CVI, Cleanverse Verified Identity, is a wallet-bound identity token based on bank-verified proof. Cleanverse says personally identifiable information remains local and the credential can be revoked.
- CVA, Cleanverse Verified Assets, represents verified stablecoins or assets with origin information, programmable compliance rules, and traceability.
- CCP, the Cleanverse Compliance Protocol, performs pre-transaction rule checks and supports Travel Rule data and audit-ready reports.
- Playground is presented as a compliance workbench for designing rules, validating flows, and generating reports.
- The API and SDK cover CVI, CVA, Gateway, Travel Rule, and reporting according to the event page.
- Gateway Network connects licensed on and off ramps to compliant onchain assets and fiat liquidity.
- Clean Payment Rails adds clean-money routing, escrow settlement, and merchant acceptance flows.
- Agent Skill Framework adds principal verification, counterparty validation, spending controls, and immutable audit trails for delegated agent actions.
- Cleanverse describes itself as infrastructure and states that independent licensed institutions perform any regulated financial activity. This matters because a project should not imply that Cleanverse itself provides custody, brokerage, lending, or asset issuance.

The public website also uses the older terms A-Pass and A-Token. A-Pass is a non-transferable identity credential and A-Token is a restricted, traceable asset. The current event uses CVI and CVA. These appear to be the current names for the same product categories, but the exact contract and API mapping must be confirmed from the documentation delivered after registration.

### Public API evidence actually found

The official [cleanverseorg/clevrpay repository](https://github.com/cleanverseorg/clevrpay) is the only public repository in the Cleanverse GitHub organization at research time. Its source documents an older payment and A-Pass integration surface:

- Sandbox base URL: `https://uatapi.cleanverse.com/api/skills`
- Production base URL: `https://api.cleanverse.com/api/skills`
- `get_magiclink`: start identity onboarding.
- `query_apass`: query an address for credential ID, expiry, tier, sub-tier, group, state, and KYC hash.
- `query_deposit_address`: retrieve a deposit address.
- `query_chain_config`: retrieve current supported chains, tokens, contracts, RPCs, and explorers. The repository explicitly calls this the live source of truth.
- `query_deposit_institutions`: retrieve approved deposit institutions.
- `register_data`: register a user address and asset mapping.
- `query_user`: retrieve deposit mapping, status, and blacklist reason.
- The common success code is `0000`. The documentation also lists `0001` for parameter errors and `0002` for general failure.
- The repository says `orgId` was removed from these endpoints on April 1, 2026.
- The only public contract ABI in this repository is AccessCore `withdraw(address aToken, uint256 amount, address recipient)`.

The static skill guide lists Ethereum USDC and USDT, Base USDC, Polygon USDC and USDT, BNB Chain USDC and USDT, Arbitrum USDC and USDT, and Monad USDC. The same guide warns that this list can drift and requires `query_chain_config` before making a support claim.

Current official CVI, CVA, CCP v3, RuleV2, validator, Playground, and Travel Rule request shapes were not publicly verifiable. Current applications mention methods such as `complianceVerify`, `registerV2`, `getRulesV2`, and `query_deposit_atoken_list`, but these are applicant claims. They are leads for later verification, not API documentation.

### Documentation and starter-kit status

The event page promises API v3 documentation, a sandbox, and a starter kit with sample contracts. The public docs host closed the TLS connection from this environment, and Context7 failed to resolve both Cleanverse and Monad because its service returned `TypeError: fetch failed`. A direct browser attempt also failed. Official documentation delivered by email after application therefore remains a blocking source for exact implementation work.

The public Cleanverse organization contains no visible hackathon starter kit or sample-contract repository. The ClevrPay repository is a three-commit agent skill and its own `PUBLISH_REVIEW.md` rates it ready for internal review or pre-release. That review explicitly recommends smoke tests for core endpoints and comprehensive payment-flow tests.

Sponsor-gap facts to carry into Phase 2:

- There is no public, typed SDK covering the current CVI, CVA, CCP, RuleV2, and report surface.
- The promised starter kit is not visible in the public GitHub organization.
- The only public official integration package is payment-focused, pre-release, and lightly tested.
- Public terminology and examples span CVI/CVA and A-Pass/A-Token, which creates integration ambiguity.
- The prior Cordon project built its own typed client and policy evaluator and recorded that `query_user` can return 404 for a verified address. This is a concrete developer-friction signal, though it must be rechecked against the current API.

These are verified public-tool gaps. Whether private resources delivered after registration already solve them is an open question.

### Monad facts relevant to implementation

Because Context7 was unavailable, these facts come from current [official Monad documentation](https://docs.monad.xyz/):

- Monad mainnet launched on November 24, 2025.
- Monad is fully compatible with EVM bytecode and the Ethereum JSON-RPC API.
- The docs state 10,000 transactions per second, 400 ms block frequency, and 800 ms finality.
- Mainnet chain ID is 143. Testnet chain ID is 10143. Devnet chain ID is 20143.
- Foundry, Hardhat, Remix, common wallet connectors, multiple indexers, and standard Ethereum RPC tooling are supported.
- Monad's revisions and testnet behavior change over time, so network configuration must come from current docs and deployed endpoints during the build.

This makes ordinary Solidity and EVM tooling reusable. Monad's speed only becomes chain-relevant if the selected mechanism actually benefits from fast, concurrent, or high-volume compliant execution.

## 3. What's trending, and where real problems surface

### Current market narrative

The broad market is moving from proving that tokenization works toward making tokenized assets useful, liquid, composable, and governable.

Verified evidence:

- Tokenized non-stablecoin RWAs crossed $25 billion in March 2026, nearly four times the prior year's value, while only 12 percent of RWA-backed stablecoin supply had entered DeFi, according to [CoinDesk using RWA.xyz data](https://www.coindesk.com/markets/2026/03/08/tokenized-assets-exceed-usd25-billion-after-nearly-quadrupling-in-a-year).
- The market reached a reported $28.9 billion in May 2026, its tenth consecutive monthly record, according to [CoinDesk Research](https://www.coindesk.com/research/stablecoins-and-tokenized-asset-report-may-2026).
- A June 2026 academic study, [Tokenized but Illiquid?](https://arxiv.org/abs/2606.01131), finds that issuance value and actual liquidity must be measured separately.
- A separate paper, [Tokenize Everything, But Can You Sell It?](https://arxiv.org/abs/2508.11651), identifies liquidity as a critical bottleneck after tokenization.
- Coinbase calls RWAs a third pillar of digital assets alongside stablecoins and crypto-native assets in its [2026 tokenization outlook](https://www.coinbase.com/en-in/institutional/research-insights/research/market-intelligence/major-trends-in-tokenization).

Inference: another generic issuance portal addresses the crowded, easier half of the problem. Stronger current value sits in distribution, usable collateral, safe lifecycle operations, cross-chain control, liquidity, and evidence that institutions can defend.

### Teams actively building and funding the space

- Centrifuge and Resolv announced a planned $100 million JAAA collateral strategy on Aave Horizon in February 2026. The asset is used as actively managed collateral, which shows live focus on RWA utility inside DeFi rather than issuance alone. See [Centrifuge's announcement](https://centrifuge.io/blog/resolv-aave-centrifuge-partnership).
- Centrifuge's July 2026 updates include institutional collateral for stablecoin issuers and continued multi-chain distribution. See the [Centrifuge blog](https://centrifuge.io/blog).
- Ondo, Clearstream, and 360X announced infrastructure for issuance, custody, trading, and collateralization in April 2026. See [Ondo's announcement](https://ondo.finance/blog/ondo-clearstream-360x-partner).
- Plume and Securitize are distributing Hamilton Lane products through a permissionless RWA network and targeting a $100 million fund. See [Plume's announcement](https://plume.org/blog/securitize-to-launch-on-plume).
- The [March 2026 US House testimony on tokenization](https://www.sec.gov/files/ctf-written-input-salman-banaei-kimber-labs-inc-plume-march-2026-hfsc-tokenization-written-testimony.pdf) lists tokenized gold, Treasuries, credit, funds, and energy among the largest assets, which supports a shift toward several real asset classes rather than only stablecoins.

The recurring funded theme is useful institutional collateral and distribution with controls, not token creation by itself.

### Direct pain signals from communities

Reddit was useful mainly in RWA and DeFi communities. Searches of r/hackathon and r/SideProject did not surface material Cleanverse-specific pain posts.

Repeated public concerns include:

- Users do not want to repeat identity verification across disconnected providers, and they worry about handing sensitive data to centralized KYC systems. See this [r/defi KYC discussion](https://www.reddit.com/r/defi/comments/1l8s8j4).
- Builders working on permissioned finance question whether proof systems enforce the actual eligibility decision or merely attest that a computation happened. See this [RWA eligibility enforcement discussion](https://www.reddit.com/r/defi/comments/1s5z5xo/update_we_actually_built_the_enforcement_layer/).
- Private-market builders report regulatory structuring, licensing, custody, and secondary liquidity as longer and harder than the token contract. See this [private-equity tokenization discussion](https://www.reddit.com/r/defi/comments/1p1xj4t/whats_actually_missing_from_rwa_tokenization_for/).
- Users distinguish price exposure from legally meaningful asset ownership and call out issuer, oracle, redemption, and legal-claim risk. See this [tokenized-stock discussion](https://www.reddit.com/r/defi/comments/1sq7aae/how_are_you_actually_buying_tokenized_stocks/).
- Community sentiment is split over identity-gated DeFi. Some see it as the route to institutional liquidity, while others see KYC as contrary to permissionless finance. A successful product needs a clearly defined institutional or regulated user instead of pretending the tension does not exist.

These pain points validate reusable identity, private credentials, enforceable policy, transparent asset rights, and real exit or recovery paths. They also warn against claiming that software alone solves legal custody or regulation.

### X, Product Hunt, and Google Trends checks

- Publicly indexed X searches did not reveal current technical guidance from Cleanverse engineers beyond event promotion and project-demo links. Cordon's official results entry links to an X demo, but no sponsor statement was found that changes the published rubric. The developer Telegram promised by the event is likely the better source after registration.
- Product Hunt search produced one low-traction generic RWA tokenization development service with six followers. It did not reveal a popular Cleanverse-like developer product. This is weak evidence, but it suggests adjacent launch attention is not centered on another tokenization-site generator.
- Google Trends Explore was checked for real-world assets, tokenization, and stablecoin, but the service returned an internal access error. No numerical Google Trends claim is made in this report.

### Current applicant crowding

The current Cleanverse projects API reports 60 DeFi applications and 58 RWA applications. A rough keyword scan was used only to detect crowding, and categories overlap.

- DeFi: 38 mention lending, borrowing, credit, loans, or collateral. Twenty-three mention AMMs, DEXs, swaps, liquidity, or market makers. Twenty-three mention agents or treasury. Fifty-six mention policy, compliance, audits, rules, monitoring, SDKs, or developer tooling.
- RWA: 49 mention issuance, tokenization, launchpads, or fractionalization. Twenty-four mention invoices, receivables, or factoring. Thirty mention lending, credit, loans, or collateral. Nine mention real estate or property.

Inference: generic lending, identity-gated lending, generic issuance, invoice financing, AMMs, agent treasuries, and compliance dashboards are crowded forms. A project in one of these forms would need a sharply different technical mechanism and a narrower, better-validated failure mode.

### Real public data options

- [SEC EDGAR data APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces) expose real-time company submissions and structured XBRL financial facts without an API key. They are credible for issuer or financial-reporting evidence, but they do not prove offchain asset custody or token-holder legal rights.
- RWA.xyz is the market data source cited across current reports and academic work. A stable, public developer API was not verified during this scan, so it should not become a live demo dependency without direct access confirmation and a cached dataset.
- The Kaggle Elliptic datasets contain real labeled licit and illicit Bitcoin transaction graphs. They are useful for offline research and testing, but their noncommercial or no-derivatives licensing and Bitcoin focus make them a poor default for a Cleanverse production feature.
- Several Kaggle supply-chain datasets advertise blockchain and compliance fields, but their records are simulated. They fail the project's real-data preference and should not be presented as real operational evidence.

## 4. Past winners (this hackathon or similar ones on this chain)

The prior event was Cleanverse Build: Verified Finance Hackathon. It used Agent and Payments tracks and a different 100-point rubric: Cleanverse relevance 30, technical implementation 15, commercial potential 10, compliance awareness 20, UX 15, and presentation 10. The [official result archive](https://cleanverse.com/hackathon-results) confirms the criteria. Ranking details were read from its public results API.

The official archive publishes demos but does not publish GitHub repository URLs for the winners. Focused GitHub and web searches did not locate a public source repository for the five projects below. This absence is recorded instead of substituting an unverified repository.

### 1. AgentPay Protocol, Agent track rank 1, 82.28

- Public repository: none located.
- Published demo: two Google Drive videos in the official result record.
- What it did: provided identity, payment, and evidence infrastructure for AI commerce. Merchants issued seller skills, buyers used agents for search and negotiation, and A-Pass plus A-Token supported authorization and settlement evidence.
- Why it likely won, inference: it showed a complete commercial flow and used Cleanverse at identity, authorization, settlement, receipt, and traceability points. Its relevance score was 25.67 out of 30, the strongest part of its result.
- What could improve: its large scope risks a less focused demo. Its technical, UX, and presentation scores left more room than its relevance score.

### 2. Agent Chekout, Agent track rank 2, 81.67

- Public repository: none located. The official archive spells the name “Agent Chekout,” while its description uses AgentCheckout.
- Published deployment: `https://agent.unitynodes.com/` in the official result record.
- What it did: gave merchants a gateway for AI-agent payments where the agent and principal were verified, A-Token carried clean funds, and CCP produced pre-settlement controls and evidence.
- Why it likely won, inference: the one-line merchant integration and obvious unknown-payer problem made the product easy to understand. It scored 12.67 out of 15 for technical implementation and 12 out of 15 for UX.
- What could improve: agent payment gateways were already a crowded category in that event. Its compliance and relevance scores trailed the winning project, so distinctiveness depended heavily on execution.

### 3. Reins, Agent track rank 3, 80.67

- Public repository: none located.
- Published demo and app: YouTube plus a public Vercel app and deck in the official record.
- What it did: acted like a corporate card for autonomous agents, with owner-defined per-payment limits, daily limits, approved counterparties, expiry, verified identity, and A-Token settlement.
- Why it likely won, inference: it reduced a broad agent-compliance topic to a familiar corporate-card story and made owner mandates central. It had the highest presentation score among the top three at 8.67 out of 10.
- What could improve: the UX score was 11 out of 15, and the core mandate pattern appeared in many other submissions. A production version would need strong key custody, revocation, and policy-parity evidence.

### 4. ClevrPay, Payments track rank 1, 80.83

- Public submission repository: none located. The later official [ClevrPay skill repository](https://github.com/cleanverseorg/clevrpay) is public, but it is a small pre-release skill and cannot be assumed to be the original submission source.
- Published demo: Google Drive video in the official record.
- What it did: turned Cleanverse identity, compliance, and asset infrastructure into a mobile payment experience for users and merchants.
- Why it likely won, inference: it translated infrastructure into a direct payment flow and aligned closely with Cleanverse's commercial narrative. It led its track in relevance, compliance, and UX.
- What could improve: its technical score was 12.13 out of 15 and presentation score 7.2 out of 10. The public skill's own review says payment-flow testing remains incomplete.

### 5. ComplianceRouter, Payments track rank 2, 79.67

- Public repository: none located.
- Published demo: [YouTube demo](https://youtu.be/KJx40_P_1Qw).
- What it did: selected a compliance envelope for a payment based on sender and recipient jurisdictions, then used A-Pass, CCP, and A-Token through a REST API and SDK.
- Why it likely won, inference: it was infrastructure rather than another checkout app, identified cross-corridor policy fragmentation, and tied the mechanism to reusable developer integration. It scored 16.67 out of 20 for compliance awareness.
- What could improve: jurisdiction rules change and require authoritative legal maintenance. A production product must separate configurable policy execution from claims that it determines legal requirements.

### What the prior event rewarded

The winners split between infrastructure and product surfaces. AgentPay and ComplianceRouter are infrastructure or middleware. Agent Chekout and ClevrPay are merchant or user-facing gateways. Reins is an end-user control product with a reusable mandate mechanism.

Inference across the scorecards: judges rewarded a complete, understandable financial flow, meaningful A-Pass and A-Token use, commercial clarity, and visible evidence. They did not reserve the podium for consumer apps. The current rubric raises technical build quality to 25 points and current Cleanverse depth to 30, making real implementation and test evidence even more important now.

### Other exact Cleanverse project evidence

[Cordon](https://github.com/winsznx/cordon), the fourth-place Agent project with 80 points, is the strongest public exact-protocol codebase found. It is an inbound compliance firewall with holding, operating, and quarantine wallets, a typed Cleanverse client, deterministic screening, onchain verdicts, an SDK, an MCP server, and an audit surface. Its README honestly labels real A-Token sweeping as in progress.

Originality warning: Cordon is close enough to Cleanverse policy, screening, SDK, and audit ideas that an adaptation would require a new user, failure mode, and technical mechanism. A fork with added features would be risky and contrary to the event's original-work expectation.

## 5. Reference builders, deep scan for alignment with THIS protocol

All five requested GitHub profiles were scanned. The aligned repositories below were cloned and their implementation, tests, and stated limits were read.

### winsznx

Aligned project: [Cordon](https://github.com/winsznx/cordon), an exact Cleanverse hackathon project.

- Built: an inbound firewall for agent wallets. Incoming value moves through holding, operating, and quarantine wallets. A keeper checks A-Pass and user status against tier, freshness, group, jurisdiction, and blacklist policy, then records a deterministic verdict on Monad.
- Mechanics worth learning from: segregated balances, fail-closed screening, explicit reason codes, typed protocol clients, SDK and MCP distribution, audit records with selective disclosure, and live versus incomplete feature labels.
- Missing or incomplete: the README marks real A-Token sweeping between the wallets as in progress. The project also had to create a client and policy layer absent from the public official SDK.
- Adaptation guardrail: this is an exact Cleanverse precedent. Use it to understand quality and sponsor gaps. Any future direction must be a substantial reinterpretation.

Other profile alignment: `writ` explores private RWA compliance and `tidyr` targets Monad, but neither provided a stronger exact Cleanverse precedent than Cordon.

### Timidan

Aligned project: [sentry-somnia](https://github.com/Timidan/sentry-somnia).

- Built: a policy gate where a declarative `POLICY.md` compiles to onchain enforcement. It supports same-transaction checks, delayed or vetoable actions, versioning, command-line and dashboard tools, TypeScript and Solidity parity tests, and formal Lean proofs.
- Mechanics worth adapting: human-readable policy compilation, deterministic reason codes, fail-closed behavior, preflight checks that match onchain enforcement, versioned policies, and counterexample-driven tests.
- Missing for Cleanverse: it does not use CVI, CVA, CCP, Travel Rule reports, or Cleanverse asset lifecycle rules. Its policy model would need to be rebuilt around verified identity and asset semantics.
- Adaptation guardrail: policy compilation is a reusable engineering pattern. Reusing the same product framing or codebase would be too close.

No exact Cleanverse project was found in the latest 100 repositories on this profile. `agentpay-trust-pass` is also aligned with delegated payment trust, but it is close to the prior event's crowded agent-payment category.

### Blockchain-Oracle

Aligned project: [mPilot](https://github.com/Blockchain-Oracle/mpilot).

- Built: an autonomous Mantle DeFi agent that plans, simulates, proposes, executes, and records actions. It uses session keys, health-factor checks, onchain reputation, several providers, a web app, MCP, an SDK, and an agent skill.
- Mechanics worth adapting: simulate before execution, explicit risk constraints, one core exposed through several developer surfaces, real onchain evidence, and an honest support matrix.
- Missing for Cleanverse: USDY is monitoring-focused because liquidity is thin, and mETH acquire is unit-tested but not wired into the full agent loop. It lacks Cleanverse identity, asset rules, and CCP parity.
- Adaptation guardrail: the reusable pattern is the tool registry and evidence loop, not the autonomous yield product.

No exact Cleanverse project was found on the profile. Other aligned repositories include `callarium`, a paid tool network on Monad, but its payment model is not a Cleanverse integration.

### mrnetwork0001

Aligned project: [Rheon](https://github.com/mrnetwork0001/Rheon).

- Built: pay-per-second streams, revenue splits, a lending pool, an API-health sentry that can pause streams, and a liquidation watcher.
- Mechanics worth adapting: continuous settlement, pause and resume controls, explicit stream state, revenue splits, and service-health responses that affect onchain operations.
- Missing or weak: the advertised 5 percent yield is not implemented as a clear depositor-yield distribution mechanism in the inspected pool contract. The pool earns borrow interest, but the depositor accounting story is unclear. The hot sentry has powerful pause authority, and tests focus more on lending basics than a complete production lifecycle.
- Adaptation guardrail: any streaming or sentry mechanic needs clearer economics, constrained authority, and full lifecycle tests.

No exact Cleanverse project was found on the profile. `Inktoll` and `VeilPay` provide aligned micropayment and confidential-payment patterns, but not Cleanverse integration.

### Enoch208

Aligned project: [nullis](https://github.com/Enoch208/nullis).

- Built: private policy execution using a Noir circuit and Soroban contract. It binds a proof to an exact action, verifies and executes atomically, prevents replay with domain-separated nullifiers, rotates roots, emits success and rejection receipts, and tests cross-language hash consistency and real onchain proof verification.
- Mechanics worth adapting: minimal disclosure, action binding, atomic verify and execute, replay protection, root rotation, rejected-attempt receipts, and shared test vectors across languages.
- Missing for Cleanverse: its reference issuer is explicitly not real KYC. It does not consume CVI or enforce CVA and CCP rules.
- Adaptation guardrail: using CVI as a real eligibility source could make the mechanism relevant, but the product would need a distinct Cleanverse user and flow. A renamed fork would not be original.

No exact Cleanverse project was found on the profile. `Vestra` and `Clasp` offer adjacent credit-identity and wallet-permission patterns.

## 6. Existing production tools in this ecosystem

A strict search found only one public repository in Cleanverse's own GitHub organization, and it is pre-release. The exact requirement for two or three popular, live, open-source Cleanverse tools cannot be met honestly from public evidence. To establish a professional benchmark, the official Cleanverse package was inspected alongside two live adjacent EVM tools used for compliant assets and RWA distribution.

All three repositories were cloned into temporary local directories and their code structure, primary contracts or scripts, tests, security material, and stated limitations were read.

### Cleanverse ClevrPay

Repository: [cleanverseorg/clevrpay](https://github.com/cleanverseorg/clevrpay)

Status: official and exact-ecosystem, but pre-release rather than a mature production benchmark.

Professional patterns:

- A single skill routes users through qualification, registration, deposit, transfer, and withdrawal flows.
- Live chain configuration is treated as authoritative instead of relying on static examples.
- The package separates a main skill, API reference, boundaries, use cases, a glossary, a quick map, and a helper script.
- Browser opening is opt-in, and operational limits are documented.

Gaps:

- Only one helper script is present.
- The publish review requests smoke tests and comprehensive payment-flow coverage.
- The repository documents older A-Pass and A-Token flows, not the complete current CVI, CVA, CCP, RuleV2, Playground, and report surface.

### ERC-3643 T-REX

Repository: [ERC-3643/ERC-3643](https://github.com/ERC-3643/ERC-3643)

Status: official implementation of the ERC-3643 permissioned-token standard, release 4.1.3, with a public audit link and a substantial Hardhat test suite.

Professional patterns confirmed in code:

- Identity, trusted issuers, required claim topics, global compliance, and the token are separate contracts.
- Token transfers require an eligible recipient and a passing compliance rule check.
- The token includes pause, wallet freeze, partial token freeze, forced transfer, mint, burn, recovery, and batch administration flows.
- Compliance rules are modular and invoked both before and after relevant token actions.
- Tests cover registries, factory and gateway deployment, transfers, recovery, agent roles, and compliance.

Lesson for Cleanverse: production regulated assets need lifecycle administration and recovery as well as a transfer gate. Modularity and test coverage around identity and policy boundaries are stronger benchmarks than a single all-purpose token contract.

### Centrifuge Protocol

Repository: [centrifuge/protocol-v3](https://github.com/centrifuge/protocol-v3)

Status: a public canonical dependency for external integrations. The repository says the protocol is live on six chains and has undergone 19 security reviews. Current [Centrifuge documentation](https://docs.centrifuge.io/) reports more than $2 billion tokenized, more than 21 audits across the broader platform, and deployments on seven chains. These counts use slightly different scopes and dates.

Professional patterns confirmed in code:

- A hub-and-spoke design separates central accounting and management from multi-chain distribution.
- It uses ERC-4626, ERC-7540, and ERC-7575 vault patterns, customizable share tokens, and transfer hooks for freely transferable, frozen, member-listed, or fully restricted states.
- Cross-chain messages use adapters and quorum controls. Integration tests exercise three-chain share movement and unpaid-message recovery.
- The protocol includes onchain accounting, NAV and valuation managers, queue managers, on and off ramps, guardians, circuit breakers, approval and slippage guards, refund escrow, and recovery adapters.
- The repository includes many audit reports, fuzz and invariant settings, Echidna and Medusa configuration, deterministic build settings, malicious-vault tests, and reentrancy attack tests.

Lesson for Cleanverse: professional RWA infrastructure treats accounting, permissions, asynchronous settlement, cross-chain failure, governance, recovery, and security testing as first-class systems. A winning hackathon product can stay narrow while still proving one of these lifecycle boundaries thoroughly.

### Production benchmark conclusion

The public Cleanverse surface is much thinner than the adjacent production standard. That gap is strategically important, but private post-registration resources may narrow it. Phase 2 should distinguish a genuine missing public layer from a feature that the sponsor already ships privately.
