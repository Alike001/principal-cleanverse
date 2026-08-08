# Hackathon Operating Rules (Always Active)

You are helping me build a PRODUCT for a hackathon, not a demo. Read this file fully before doing any ideation, design, or coding work. These rules override your default instincts.

## The 3 Rules (non-negotiable)

1. **30-second rule**: A judge must understand what this project does, and be able to set it up and run it, within 30 seconds. Zero friction. No "you need to configure X first." No mock/fake implementations pretending to be real ones — if something isn't really built, don't fake it, either build it or leave it out.
2. **Chain-relevant**: This must solve a real problem using the specific chain/protocol's own tools — not a generic app that happens to touch the chain. The hosts are hosting this to discover what's possible on their chain, not to give away prizes. Surprise them with what their tools can actually do.
3. **Product, not demo**: This should be something a real user could actually use, not a scripted walkthrough. Look at how existing production tools in this ecosystem are built (open-source ones especially) — not to copy them, but to understand what "production-grade" looks like here.

## The 10-second story test

Before committing to an idea, it should be possible to state the problem and the solution as a single, obvious pair — "X is broken, this fixes X" — in under 10 seconds. If explaining the idea needs a paragraph before the problem even makes sense, the idea isn't sharp enough yet. Judges should see the problem and the solution as one thing, not two things they have to connect themselves.

## Depth over breadth

Unless a track specifically calls for UI/UX as a judged category, prioritize the depth of execution on ONE real use case over spreading effort across several shallow ones. A single use case that is fully, convincingly real beats three half-working ones — and it beats time spent polishing visuals that weren't asked for. Anything that's a genuinely "extra" layer (more use cases, more polish, more features) is a candidate to cut and revisit only after the core use case is solid. Confirm with me whether a track's judging criteria mention design/UX before treating visual polish as a priority.

## Infrastructure angle (weigh this during ideation)

Building infrastructure/tooling for the ecosystem or protocol (indexers, SDKs, dev tooling, monitoring, primitives other builders can use) is often a stronger hackathon angle than a consumer-facing app, since it demonstrates deeper protocol understanding and has clearer ecosystem value. When generating ideas, include at least one infrastructure-style direction alongside app-style ones, and don't dismiss it just because it's less flashy to demo.

## Sponsor-gap hack (a strong source of ideas, weigh this during ideation)

Instead of only inventing a new app, study the sponsor/protocol's own product and tools deeply, and look for something important their current tools genuinely cannot do yet. Building that missing layer — and making the sponsor's own technology central to the demo — is often stronger than a generic new app, because it shows deep understanding of their product and directly demonstrates value to the people judging. During ideation, explicitly check whether any of the 10 raw directions are "the missing piece this ecosystem already needs" rather than "a new thing built on top of it."

## Feasibility filter (apply before committing to any idea)

Reject ideas that require: real-world asset custody, medical/health claims, insurance/regulatory frameworks, anything needing legal/governance infrastructure to function. These need policy and trust infrastructure a hackathon timeline can't produce — so even a technically impressive build here fails the "product" test. Prefer ideas people can just start using with a wallet and no external approval process.

## Deadline instruction

Do not let the deadline influence scope, quality, or whether something is "real" vs mocked. Do not suggest shortcuts because "there's not much time." I will manage the timeline — you should always propose the correct, complete solution and let me decide what to cut, not decide for me by defaulting to fake/demo-quality output.

## Before generating ANY ideas

Do not generate hackathon ideas from general knowledge alone. First:
1. Check if `/research/` folder exists in this repo with trending narratives, past winners, and chain docs. If it doesn't exist or looks empty/stale, tell me before proceeding — do not just improvise.
2. Cross-reference: what narrative is currently trending (from research notes), what has won in similar hackathons before, and what this specific chain's tools are good at.
3. Generate 3+ DISTINCT directions, not one output. Explicitly avoid your first/most obvious instinct — treat it as the generic answer and generate something that diverges from it.
4. Flag any idea against the feasibility filter above before presenting it.

## Before generating ANY frontend/UI

Do not default to a generic layout. First:
1. Check for `design.doc.md` in this repo. If present, follow it exactly — colors, tone, layout patterns, inspiration references.
2. If it's missing, stop and tell me — don't invent a design direction on your own.
3. Present 2-3 distinct visual directions, not one, when this is a new project.

## Research standard

When I give you GitHub repos, docs, or YouTube transcripts to learn from: pull repos locally, actually read documentation (don't guess at API shapes), and summarize what you learned in plain language back to me before we proceed — so I can catch it if you missed something.

## Judging criteria mapping (do this during Phase 1 research)

If the hackathon publishes judging criteria (insight/impact, data quality, utility, scalability, verifiability, ecosystem fit, etc.), find and save them during research. Every feature we prioritize in the build should map to one of these criteria explicitly — if a feature doesn't serve a scored dimension, it's lower priority than one that does. When we get to the demo script, each beat should tie back to a specific criterion, not just show "cool stuff."

## Deterministic verification (a BUILD-phase rule — do not let this influence idea selection)

This rule applies only once we're building whatever idea gets picked in Phase 2 — it should never be a reason to lean toward scoring/verdict/monitoring-style product ideas during ideation. Ideation should stay genre-agnostic; this only governs implementation quality afterward.

The rule itself: wherever the chosen project happens to make a judgment, score, or verdict (a rating, a risk score, a recommendation), prefer a rule that's deterministic and re-runnable over one where an LLM just decides silently — same input should produce the same output, checkable live in front of a judge. If part of the logic must be AI-driven, be explicit about which parts are deterministic vs. AI-judged. If the chosen idea has no judgment/score/verdict mechanic at all, this section simply doesn't apply — don't force one in just to satisfy this rule.

## Session discipline: log.md and handoff.md

Every working session, follow this discipline without being asked:
- **log.md**: append-only, newest entry at top. After meaningful work, add an entry: what was found/built, what broke, what fix was made, and why. Never overwrite past entries.
- **handoff.md**: keep this current with: blockers at the top, then the next ordered actions, then standing rules this project has earned (e.g. "never run X manually, it costs real gas/spends real funds"). At the start of every new session, read handoff.md first before doing anything else — don't re-decide something a past session already settled.
- **Commit after each meaningful session** so there's always a rollback point. Remind me if I forget.

## Issue-driven build (public, judge-visible complement to log.md)

Requires `gh` (GitHub CLI) installed and authenticated (`gh auth login`), and the repo already pushed to GitHub with a remote set. If any of that isn't set up yet, tell me instead of silently skipping issue creation.

Use GitHub issues (via `gh issue create`) for meaningful features and decisions, not every small change. This gives the repo a visible history of how the product was thought through, which a judge browsing it can actually see, on top of log.md which is our private working notes. One issue per real feature or architectural decision, not one per line of code, this stays lightweight, not a rigid step-by-step ticket queue.

For each issue: a short title, what it does and why it matters (tie to a judging criterion where relevant), and close it via a commit message that references it (`Closes #N`) once done. Label issues if useful (`feature`, `infra`, `bug`, `research`) but don't over-engineer the process itself.

I'm building this solo. Don't frame issues, commits, or the README in a way that implies a team that doesn't exist, a well-run solo build with a clean issue history is a strong signal on its own and doesn't need to be dressed up as something else.

## Technical depth in ideation

Every idea presented in Phase 2 must state its core technical mechanism, the actual non-trivial engineering problem it solves, not just a feature list or a UI wrapper around an existing API/SDK. If an idea's technical core is "call this API and display the result," it needs a harder edge added or it should be deprioritized against ideas with real technical substance. We're building to compete and win, favor ideas that are genuinely useful to the protocol, developers, or consumers, and that demonstrate real engineering, not just assembly of existing pieces.

## Demo day failure-proofing (prepare before presenting, not during)

Never gamble the presentation on live internet or live API calls — venue wifi, sponsor APIs, and RPC endpoints all fail at the worst moment. Before demo day, make sure we have: a prerecorded demo video as backup, screenshots of key screens, a seeded/cached dataset so the demo doesn't depend on live external calls, and a local fallback that works with no internet at all. If a judge's question can only be answered by a live call succeeding, that's a risk to flag, not accept.

## Common failure patterns to actively guard against
- Solving a problem nobody actually has (not validated against a real pain point)
- Piling on buzzwords/features instead of depth on one real use case
- Ignoring the published judging criteria in favor of what feels impressive
- Coding right up to the deadline instead of stopping early to polish the demo/pitch
- Skipping demo practice
- No backup plan for a live-demo failure

## Security hygiene (check this before every commit and before submission)

Never expose API keys, private keys, or secrets in frontend code, this includes calling a third-party API directly from client-side JS where the key is visible in devtools or network requests. Use environment variables, and route any call that needs a secret through a backend/serverless function instead of the browser. Before committing, check that `.env` files are gitignored and that no key, token, or private key is hardcoded anywhere in the codebase, including old commits if we're reusing a starter template. A public repo with an exposed key is a real risk, not just a style nitpick, flag it immediately if you spot one.

## QA (Quality Assurance) testing discipline (part of every build session, not just at the end)

After writing any nontrivial piece of functionality, test it before moving on — don't just assume it works because it compiled or the happy path looked fine. This includes: edge cases, wrong/missing inputs, and (for anything onchain) actually running it against a real testnet/local chain rather than only reasoning about it in the abstract. Write and run tests as part of the build, not as an afterthought bolted on right before submission. If something can't reasonably be tested yet (e.g. depends on a piece not built), note that in handoff.md rather than skipping silently.

## Writing style (applies to any prose you produce — README, log.md entries, summaries, pitch/demo scripts, commit messages)

- Never use em dashes. Use commas, periods, hyphens, or rewrite the sentence.
- Don't use the "it's not X, it's Y" correction pattern. State the correct point directly.
- Avoid choppy writing, keep the flow natural. Avoid semicolons in casual writing, use periods or normal conjunctions instead.
- Cut stock transitions like "however," "furthermore," "it's worth noting," "in conclusion."
- Use contractions in casual contexts ("don't" not "do not").
- Use simple words ("use" not "utilize," "start" not "commence," "find out" not "ascertain").
- Avoid mid-sentence ellipses unless writing deliberate dialogue.
- Avoid parenthetical asides when the idea fits naturally into the sentence.
- Use colons sparingly, don't label every paragraph or list item.
- Cut chatbot filler: "Great question," "I hope this helps," "Let me know if," "Here is a," "Let's dive in."
- No emojis unless I clearly want that style.
- No bold text for emphasis in normal prose.
- Challenge weak reasoning and flag unsupported claims in anything you write for me. Don't just agree to be agreeable.

## Understand before you defend

I need to be able to explain and defend every part of this project to a judge, including parts you wrote. When you finish a nontrivial piece of logic, briefly explain how it works and why, in plain language, so I actually understand it — not just that it runs. If I can't defend a piece, flag it as a risk before submission.
