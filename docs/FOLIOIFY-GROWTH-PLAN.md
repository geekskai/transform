# Folioify Growth Plan

Status: Days 1–14 implemented locally; deployment and measurement accumulation pending  
Decision date: 2026-08-12  
Horizon: 90 days

## Outcome

Turn Folioify from a broad directory of standalone converters into a private developer workbench with one clear product wedge: working with real JSON data. Free Tools continue to provide complete useful results. Product Revenue comes from scale, continuity, and automation in the JSON Workbench. Ad-supported Revenue is optional and secondary.

## Evidence baseline

### Confirmed

- The repository contains 70 registered tool routes, while 19 tool pages are explicitly curated for indexing.
- The live site exposes the current privacy disclosure, filtered sitemap, robots rules, curated JSX and TOML pages, and `noindex,nofollow` on a sampled generic tool page.
- The focused AdSense, processing-disclosure, monitoring-removal, and JS-object safety suite passed 11 of 11 tests on 2026-08-12.
- Before the Days 1–14 patch, the site had two published blog source files and no dedicated About route.
- Before the Days 1–14 patch, live `/ads.txt` returned 404 on 2026-08-12.
- Before the Days 1–14 patch, the repository README described every transformation as browser-only even though some tools use server routes.
- Public English and Chinese discussions consistently value fast, local, no-login tools but show stronger unmet demand around real JSON workflows: malformed input, large files, JSONL, search, Diff, path extraction, batch operations, and repeated transformations.

### Likely, not confirmed

- Thin site identity, inherited or repetitive page patterns, and insufficient original value are more likely AdSense blockers than the already-deployed crawl controls.
- A deep JSON workflow is more defensible and monetizable than adding more single-purpose converter pages.

### Unknowns to measure

- Current tool completions and tool-family conversion rates after the new event instrumentation is deployed.
- Conversion willingness for a one-time individual license.
- Browser performance limits for large files across supported devices.

The exact AdSense rejection and 28-day GSC/Clarity baseline were captured on 2026-08-12 in `docs/growth/DAYS-1-14-BASELINE.md`.

## Product strategy

### Positioning

**Private JSON Workbench for developers working with real API data.**

The product promise is: paste or open JSON, understand and transform it without sending sensitive payloads to Folioify, and continue through related tasks without jumping between disconnected websites.

### Initial customer

Frontend, backend, full-stack, QA, and API-integration developers who repeatedly inspect real payloads and care about privacy, speed, and copy-ready output. The first release does not target enterprise procurement, collaborative schema governance, or continuous API monitoring.

### Core job

Turn messy or unfamiliar JSON into understood, validated, compared, queried, and usable code or schema without uploading the data.

### Product boundary

- Folioify owns local payload inspection and transformation.
- Geekskai's planned API Contract Monitor owns continuous contract snapshots, historical contract Diff, and alerts.
- Folioify does not add team workspaces, cloud projects, source-repository access, or API monitoring in this cycle.
- Existing non-JSON tools remain available. They receive maintenance and accurate indexing controls, not new product investment during the 90-day cycle.

## Experience and information architecture

### Main experience

Create one canonical JSON Workbench that keeps input and task context while the user moves between:

1. Format, validate, minify, and repair.
2. Inspect a virtualized tree and search keys or values.
3. Compare two payloads with structural Diff.
4. Extract values with JSONPath and copy matched paths.
5. Generate TypeScript, Zod, and JSON Schema from the same input.
6. Export the final result.

Existing JSON tool URLs remain focused search entry pages. Their primary action opens the relevant operation inside the same Workbench rather than creating separate product silos.

### Product Design requirements

- Input and first useful result must remain visible without scrolling on a typical desktop viewport.
- Pasting valid or invalid JSON must produce immediate, understandable feedback.
- Operations must be searchable and keyboard accessible; frequent users should not navigate a card directory.
- Errors must include a one-based location, nearby context, and a recovery action.
- Processing mode must be visible and accurate for every operation.
- The product must not use fake privacy claims. Local processing should be verifiable through documentation and browser network inspection.
- Desktop is the primary large-data experience. Mobile must support reading, validation, and small edits without claiming large-file parity.
- Status and Diff must not rely on color alone; focus order, labels, live regions, and contrast must be verified.

## Free and paid value

### Free

- No account required.
- Complete single-input formatting, validation, minification, common repair, tree inspection, search, JSONPath extraction, Diff, and individual TypeScript, Zod, or JSON Schema generation.
- Local processing for JSON payloads.
- No advertising inside the active Workbench.
- Practical ordinary-file support, with the final supported size determined by cross-browser benchmarks rather than a marketing claim.

### Individual Pro

Recommended launch price: **$29 one-time**, with a 14-day refund window.

Pro earns payment through repeated-workflow value:

- Large-file engine at the highest size proven reliable by benchmarks.
- Batch file processing.
- Reusable Transformation Pipelines.
- Saved presets and Local History.
- Offline installation or PWA support.
- Multi-format export bundles.

Purchase requires an account so the entitlement can be restored on another device. Free use must not require registration. The first release does not include cloud-stored payloads, collaboration, seats, subscriptions, or unlimited server API use.

### Later, only after demand is proven

- CLI or editor integration for local automation.
- A metered API for server-backed transformations where real infrastructure cost exists.
- Fixed-price sponsorship on editorial content after Folioify has a stable, clearly defined developer audience.

## Acquisition system

### Search

Build a small original task cluster rather than bulk programmatic pages:

1. Repair malformed JSON safely.
2. Inspect and search a large JSON file without uploading it.
3. JSON versus JSONL and how to debug each.
4. Compare API responses with structural JSON Diff.
5. Extract nested values with JSONPath.
6. Generate TypeScript and Zod from production-shaped payloads.
7. Verify that an online JSON tool is not uploading sensitive data.

Each page needs a real scenario, input and output, error cases, limitations, processing disclosure, and a direct transition into the matching Workbench state. Mature pages may enter the sitemap; generic pages remain `noindex`.

### Community and media

- GitHub: release the Workbench as the main product story, publish architecture and privacy verification, and collect issues around real payloads.
- V2EX: request technical feedback with a concrete workflow demonstration; do not post a generic tool-directory advertisement.
- Bilibili: publish 30-second to 3-minute result-first demonstrations for JSON repair, large-file search, Diff, and JSON-to-TypeScript/Zod.
- Reddit and Hacker News: share only after large-file or continuous-workflow differentiation is demonstrable.
- X and Product Hunt are secondary launch amplifiers, not primary validation channels.
- Do not invest in paid acquisition until activation and purchase conversion are measured.

## Trust and AdSense hygiene

Complete these items even though AdSense is secondary:

- Add a credible About page with operator identity, project history, upstream attribution, and contact paths.
- Correct README and article claims that all transformations are browser-only.
- Add a valid `ads.txt` for the approved publisher account when appropriate.
- Decide and implement the required consent approach before personalized advertising in the EEA, UK, or Switzerland.
- Keep ads out of the Workbench and away from navigation, inputs, outputs, copy buttons, and downloads.
- Continue excluding immature and generated pages from indexing, the sitemap, and advertising.

Do not resubmit merely because these files exist. First verify every sitemap URL for unique intent and material value, then observe 28 days of Search Console indexing and non-brand search behavior. The exact AdSense rejection message must be captured before claiming that any remediation resolves it.

## Measurement

### Event model

Measure without recording payload contents, filenames, generated output, search values, or JSONPath expressions:

- Workbench viewed.
- Valid or invalid input recognized.
- Operation selected.
- Operation completed or failed.
- Result copied or exported.
- Second distinct operation completed in the same Workbench Session.
- Return visit.
- Pro capability requested.
- Pricing viewed, checkout started, entitlement activated, refunded.

### North-star metric

**Weekly returning developers who complete at least two JSON operations.**

This measures repeat workflow value rather than raw page views.

### Launch validation

Before launch, establish a 14-day baseline for current JSON-tool traffic and completion behavior. In the first 30 days after public launch, require:

- At least 500 activated Workbench users.
- At least 15% of activated users return within seven days.
- At least 10% request a Pro capability.
- At least five unrelated customers purchase Pro.
- At least 95% of successful checkouts produce a verified entitlement within ten minutes.
- Zero payload-content collection and zero incorrect paid entitlements.

If traffic is below 500, diagnose acquisition before changing price. If Pro intent is below 10%, diagnose product value. If intent is healthy but purchases are weak, test packaging and price. Do not respond by adding unrelated tools.

## 90-day sequence

### Days 1-14: baseline and trust

- Capture the exact AdSense rejection message and current Search Console and analytics baselines.
- Add privacy-preserving product events.
- Repair ownership, attribution, processing claims, `ads.txt`, and consent strategy.
- Freeze new unrelated tool creation.
- Benchmark JSON parsing, tree rendering, search, Diff, and generation across file sizes and supported browsers.

Acceptance: evidence dashboard exists; all public processing claims match behavior; every sitemap URL passes the content and trust checklist; file-size promises are backed by measurements.

### Days 15-42: free Workbench

- Build the canonical JSON Workbench and preserve task state across operations.
- Integrate format, validate, repair, tree, search, Diff, JSONPath, TypeScript, Zod, and JSON Schema.
- Route existing JSON entry pages into the matching Workbench state.
- Verify keyboard, error, mobile inspection, privacy, performance, and no-regression behavior.

Acceptance: a developer can paste one realistic payload and complete at least three related operations without re-entering data or leaving the Workbench.

### Days 43-63: Pro and conversion

- Add benchmark-backed large-file processing, batch operations, Transformation Pipelines, presets, Local History, and offline support.
- Add account-based one-time purchase and entitlement restoration.
- Publish a transparent pricing page, refund terms, sustainability explanation, and Free-versus-Pro comparison.
- Trigger upgrade prompts only when the user requests a Pro capability.

Acceptance: Free remains complete for ordinary single tasks; payment, refund, restore, and offline/local-data boundaries pass automated and browser verification.

### Days 64-90: launch and learn

- Publish the seven-page original search cluster.
- Release through GitHub, V2EX, Bilibili, then Reddit or Hacker News when differentiation is proven.
- Review activation, repeat use, Pro intent, purchase, refund, performance, and support feedback weekly.
- At day 90, continue, adjust, or stop based on the launch-validation branches rather than page-view vanity metrics.

Acceptance: the launch metrics identify whether the constraint is acquisition, activation, repeat value, packaging, price, or reliability.

## Explicitly not doing

- Expanding from 71 tools to a larger directory.
- Bulk-generating indexable pages.
- Making AdSense approval the 90-day success criterion.
- Charging for basic single-input formatting or validation.
- Launching JSON and JSX paid workspaces simultaneously.
- Adding teams, seats, cloud payload storage, repository access, or API monitoring.
- Buying traffic before organic activation and conversion are understood.
- Claiming that local implementation or passing tests proves live behavior or policy approval.

## Sources

- [Google Publisher Policies: screens without publisher content or with low-value content](https://support.google.com/adsense/answer/10502938)
- [Google AdSense: reasons a site may not be approved](https://support.google.com/adsense/answer/81904)
- [V2EX feedback on developer-tool discovery and JSON workflows](https://www.v2ex.com/t/1173207)
- [V2EX discussion of large JSON, batch, privacy, and compatibility needs](https://www.v2ex.com/t/951253)
- [Reddit discussion of ad-heavy, login-gated developer tools](https://www.reddit.com/r/developersIndia/comments/1pry7cs/i_built_a_huge_free_toolkit_200_adfree_online/)
- [Hacker News discussion of local, interruption-free developer tools](https://news.ycombinator.com/item?id=46490812)
