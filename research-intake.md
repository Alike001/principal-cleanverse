# Research Task Spec — Codex, follow this exactly

This is not a form for the user to fill in — YOU (Codex) do the research and write the output. The user will give you raw resources (hackathon docs, links, GitHub repos). Your job is to turn those into `/research/domain-knowledge.md`, following the structure below. Do not skip a section. Do not fill sections with guesses from training data — actually fetch and read the material.

## 1. Judging criteria and track rules
- Find and save the hackathon's published judging criteria (insight/impact, data quality, utility, scalability, verifiability, ecosystem fit, design/UX, etc. — whatever they actually publish).
- Explicitly note whether design/UX is listed as a scored dimension — this determines how much polish Phase 3 needs later.
- Note any track-specific requirements or restrictions.

## 2. Chain/protocol domain knowledge
- Pull every doc/repo/template link the user gave you. Read the actual content (use Context7/Firecrawl MCP), don't infer from the link text or filename.
- Note any starter templates or SDKs — these should be reused, not reinvented, unless the user says otherwise.
- If a YouTube link is provided and it's long, get a transcript rather than skipping it.
- Explicitly note anything the sponsor/protocol's current tools genuinely cannot do yet — gaps, missing features, friction points developers hit. This feeds directly into ideation later (building the missing piece is often stronger than a generic new app on top).

## 3. What's trending, and where real problems surface
- Web-search current trending narratives in this ecosystem (do not rely on training data — this changes month to month).
- Note which protocols/teams are actively funding or building in this space right now.
- Check Reddit communities (r/hackathon, r/sideproject, and any industry-specific subreddits relevant to this protocol) for real problems people are openly asking to be solved — this is free, direct signal on genuine pain points, not hypothetical ones.
- Check X for developer advocates, sponsor engineers, or founders in this ecosystem — they often signal emerging gaps or hints at what judges want, sometimes without realizing it.
- Check Product Hunt for what's getting attention in adjacent spaces — note what audience still looks underserved or what's missing from popular launches.
- Check Google Trends for genuinely growing topics, and note if any intersect usefully with this protocol's tools (a real trend + a useful product beats a generic wrapper).
- If the idea could use real data for a stronger demo, check data.gov, city open-data portals, or Kaggle for a relevant public dataset — real data makes a demo more credible than synthetic/fake data.

## 4. Past winners (this hackathon or similar ones on this chain)
- Find 3-5 winning projects. For each: name, GitHub repo link, what it did, why it likely won.
- For each, ask "why did this win?" — not "how do I copy it?" The goal is understanding what judges rewarded, not replicating the surface.
- Also note what each one got wrong or could have improved — the user does not want these copied blindly.
- Note the split between infrastructure/tooling winners vs. consumer-app winners — both are valid directions.
- Also web-search more broadly beyond these 5 for any other public repos of projects built specifically for THIS protocol/hackathon series (not just the same chain in general) — the more examples of "what does a submission for this exact protocol look like," the better.

## 5. Reference builders — deep scan for alignment with THIS protocol
Don't just check these profiles for general patterns — actually scan each one's repos for past hackathon projects, and flag any that solve a similar problem to, or use similar tooling as, the specific protocol/ecosystem this build is for:
- https://github.com/winsznx
- https://github.com/Timidan
- https://github.com/Blockchain-Oracle
- https://github.com/mrnetwork0001
- https://github.com/Enoch208

For each aligned project you find, note: what it built, which specific features/mechanics could be adapted (not copied wholesale) to fit this hackathon's protocol, and what's missing that we could add to make it more complete or better-fitted to this specific protocol's tools.

**Important guardrail**: the goal is extracting patterns, mechanics, and feature ideas to adapt into an original build for this specific hackathon — not reusing someone else's project as our own. Most hackathons require original work created during the event; submitting something too close to an existing project (even with new features bolted on) risks disqualification. Flag this explicitly if any "aligned" project is close enough that adapting it would need to be a substantial reinterpretation, not a fork with additions.

## 6. Existing production tools in this ecosystem
- Find 2-3 popular, open-source tools already live in this ecosystem.
- Clone them locally and actually read the code/structure — this is the "what does professional look like here" benchmark, not just a link list.

## Output
Write everything to `/research/domain-knowledge.md`, organized under these same 6 headers. Then summarize what you found back to the user in plain, non-technical language, so they can catch anything you missed before ideation starts.
