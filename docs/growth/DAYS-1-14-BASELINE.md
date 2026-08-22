# Folioify Days 1–14 Baseline

Captured: 2026-08-12 (Asia/Shanghai)  
Measurement window: previous 28 days unless noted  
Scope: read-only external evidence plus local repository checks

## Decision summary

The site is technically reachable and its curated crawl controls are working, but AdSense rejected `folioify.com` for **Low value content**. Existing acquisition is not evenly distributed: the JSX Viewer generates nearly all organic clicks and sessions. The proposed JSON Workbench is therefore a product hypothesis that requires validation, not an existing product-market-fit claim.

For Days 1–14 we will measure real tool activation, completion, failure, copying, and file loading without collecting editor payloads. We will keep unrelated tool creation frozen at the current 70 registered tool routes. AdSense review will not be requested until the trust and content checklist passes and the new evidence has had time to accumulate.

## Confirmed external baseline

### Google AdSense

- Site: `folioify.com`
- Approval: **Needs attention**
- Exact issue: **Low value content**
- ads.txt status: **Not found**
- Last dashboard update: Jun 27, 2026, 11:34 PM CST
- The dashboard says the site is not ready to show ads and links to minimum-content, unique-content, user-experience, thin-content, and webmaster guidance.
- The “I confirm I have fixed the issues” checkbox and “Request review” action were not used.

### Google Search Console

- Window: Jul 13–Aug 9, 2026
- 732 clicks
- 12,058 impressions
- 6.1% CTR
- Average position: 29.8
- `/tools/jsx-viewer`: 717 clicks and 5,000 impressions
- `/tools/check-toml`: 1 click and 213 impressions
- Top query `jsx viewer`: 225 clicks and 1,110 impressions
- Devices: desktop 445 clicks / 9,859 impressions; mobile 278 / 2,137; tablet 9 / 62

### Microsoft Clarity

- 1,115 sessions; 230 bot sessions excluded
- 940 unique users
- 1.29 pages per session
- 44.61% average scroll depth
- 107 returning sessions (9.60%) and 1,008 new sessions (90.40%)
- 378 sessions with dead clicks (33.90%)
- `/tools/jsx-viewer`: 1,057 sessions
- Browser mix: Chrome 52.74%, Chrome Mobile 21.88%, Edge 12.38%, Mobile Safari 3.77%, Firefox 3.41%
- Performance: 72/100; LCP 1.9s, INP 490ms, CLS 0.21

## Measurement contract

The application sends only allowlisted Clarity events:

- `tool_conversion_started`
- `tool_conversion_completed`
- `tool_conversion_failed`
- `tool_result_copied`
- `tool_file_loaded`

Clarity tags contain only the route path without query parameters and a coarse tool family (`json`, `jsx`, `toml`, or `other`). Editor input, generated output, filenames, pasted URLs, credentials, and arbitrary custom properties are excluded. Conversion lifecycle events begin only after user interaction, so default examples rendered on page load do not count as activation.

## Consent strategy

- Clarity advertising storage is denied in all cases.
- Analytics storage defaults to denied.
- Visitors can explicitly allow analytics cookies or continue with limited cookieless analytics, and can reopen the choice from the footer.
- The AdSense page script is not currently loaded. Before ads are enabled for EEA, UK, or Switzerland traffic, Folioify must configure a Google-certified CMP compatible with the then-current Google requirements. Publishing `ads.txt` does not itself enable advertising.

## JSON product validation gate

JSON demand is supported by external qualitative research, but current Folioify analytics do not establish a JSON audience. Before building paid functionality, collect at least 28 days of the new events and compare:

1. JSON tool starts and successful completions.
2. Copy/export intent and repeat visits.
3. Failure rate by JSON route.
4. Search impressions and clicks for the existing JSON entry pages.
5. Interest in large-file, batch, pipeline, history, offline, and multi-export capabilities.

No file-size marketing promise is approved in Days 1–14. The benchmark harness is an engineering baseline; the future Workbench must be measured in the target UI on representative desktop and mobile hardware before publishing a support limit.

## Sitemap and trust acceptance checklist

Every URL listed in the local sitemap must return 200 and have:

- one non-empty, unique title;
- an H1;
- a self-referencing canonical URL;
- no `noindex` directive;
- substantive rendered text;
- working About, Privacy, contact, and upstream-attribution paths;
- accurate per-tool processing disclosure for tool detail pages.

Generic, uncurated tool routes remain `noindex,nofollow` and excluded from the sitemap. The current 70 registered tool routes are frozen: replacements or additions require a new growth decision and an update to the guard test.

## Known limits

- These figures are a single 28-day snapshot and can change.
- Clarity repeat-use measurement is weaker for visitors who decline analytics storage.
- The benchmark uses synthetic JSON and measures algorithms rather than a final virtualized tree UI.
- Chrome and Node are the first reproducible benchmark environments. Safari, Firefox, Edge, mobile hardware, memory pressure, and final UI responsiveness remain release-gate measurements for the Workbench.
