const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function readSource(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("internal tool navigation stays in the current browser tab", () => {
  for (const relativePath of [
    "components/HeaderNav.tsx",
    "components/Navigator.tsx"
  ]) {
    assert.doesNotMatch(readSource(relativePath), /target="_blank"/);
  }
});

test("LLM descriptions are shortened at a word boundary", () => {
  const { truncateAtWord } = require("../lib/text.js");
  const input =
    "Preview React components with dependencies and Tailwind support.";

  assert.equal(truncateAtWord(input, 36), "Preview React components with");
  assert.equal(truncateAtWord("Short description.", 140), "Short description.");
  assert.ok(truncateAtWord(input, 36).length <= 36);
});

test("retired Clerk integration is absent from manifests", () => {
  assert.doesNotMatch(readSource("package.json"), /@clerk\//);
  assert.doesNotMatch(readSource("yarn.lock"), /^"?@clerk\//m);
});
