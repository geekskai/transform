const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = relativePath =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

test("trust surface includes ownership, upstream attribution, and ads.txt", () => {
  const about = read("pages/about.tsx");
  const footer = read("components/SiteFooter.tsx");
  const sitemap = read("pages/api/sitemap.ts");
  const adsTxt = read("public/ads.txt");

  assert.match(about, /operated by GeeksKai/i);
  assert.match(about, /ritz078\/transform/);
  assert.match(about, /MIT\s+License/i);
  assert.match(footer, /href: "\/about"/);
  assert.match(sitemap, /BASE \+ "\/about"/);
  assert.equal(
    adsTxt.trim(),
    "google.com, pub-2108246014001009, DIRECT, f08c47fec0942fa0"
  );
});

test("public processing claims do not say every tool is browser-only", () => {
  const readme = read("README.md");

  assert.doesNotMatch(readme, /All tools run in the browser/i);
  assert.match(readme, /browser-based or server-backed/i);
});

test("product analytics is allowlisted and excludes payload fields", () => {
  const analytics = read("lib/product-analytics.ts");
  const jsxViewer = read("components/jsx-viewer/SandpackJsxViewer.tsx");

  for (const eventName of [
    "tool_conversion_started",
    "tool_conversion_completed",
    "tool_conversion_failed",
    "tool_result_copied",
    "tool_file_loaded"
  ]) {
    assert.match(analytics, new RegExp(eventName));
  }

  assert.doesNotMatch(analytics, /inputValue|outputValue|fileName|fetchingUrl/);
  assert.match(analytics, /Clarity\.event/);
  assert.match(analytics, /Clarity\.setTag/);
  assert.match(jsxViewer, /trackProductEvent\("tool_conversion_started"\)/);
  assert.match(jsxViewer, /trackProductEvent\("tool_conversion_completed"\)/);
  assert.match(jsxViewer, /trackProductEvent\("tool_conversion_failed"\)/);
});

test("Clarity defaults to denied storage and offers an explicit choice", () => {
  const tracker = read("components/ClarityTracker.tsx");
  const preferences = read("components/PrivacyPreferences.tsx");

  assert.match(tracker, /consentV2/);
  assert.match(tracker, /ad_Storage: "denied"/);
  assert.match(tracker, /analytics_Storage/);
  assert.match(preferences, /Continue without analytics cookies/);
  assert.match(preferences, /Allow analytics cookies/);
});

test("growth scope freezes the current 70 tool routes", () => {
  const routes = read("utils/routes.tsx");
  const toolRouteCount = (routes.match(/path: "\/tools\//g) || []).length;

  assert.equal(toolRouteCount, 70);
});

test("Days 1-14 JSON benchmark and sitemap audit artifacts exist", () => {
  const benchmark = read("scripts/benchmark-json-workflows.mjs");
  const audit = read("scripts/audit-sitemap.mjs");

  assert.match(benchmark, /JSON\.parse/);
  assert.match(benchmark, /tree/i);
  assert.match(benchmark, /search/i);
  assert.match(benchmark, /diff/i);
  assert.match(benchmark, /generation/i);
  assert.match(audit, /sitemap\.xml/);
  assert.match(audit, /canonical/i);
  assert.match(audit, /<h1/i);
});
