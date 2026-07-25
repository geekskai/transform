const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

function compileTypeScript(source, filename) {
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020
    },
    fileName: filename
  }).outputText;
}

Module._extensions[".ts"] = function loadTypeScript(module, filename) {
  module._compile(
    compileTypeScript(fs.readFileSync(filename, "utf8"), filename),
    filename
  );
};

function loadTypeScriptModule(relativePath) {
  const filename = path.resolve(__dirname, relativePath);
  const source = fs.readFileSync(filename, "utf8");
  const compiled = compileTypeScript(source, filename);
  const loadedModule = new Module(filename, module);

  loadedModule.filename = filename;
  loadedModule.paths = Module._nodeModulePaths(path.dirname(filename));
  loadedModule._compile(compiled, filename);

  return loadedModule.exports;
}

const { PRIVACY_CONTACT_EMAIL, PRIVACY_DISCLOSURES } = loadTypeScriptModule(
  "../lib/site-transparency.ts"
);
const { getToolProcessingDetails } = loadTypeScriptModule(
  "../lib/tool-processing.ts"
);
const {
  CURATED_TOOL_PATHS,
  filterIndexableToolRoutes,
  isToolPageIndexable,
  shouldNoindexToolPage
} = loadTypeScriptModule("../lib/tool-indexing.ts");
const { getRouteLastModified, getToolPageContent } = loadTypeScriptModule(
  "../lib/tool-page-content.ts"
);
const { validateTomlSource } = loadTypeScriptModule(
  "../lib/toml-validation.ts"
);

test("privacy disclosures cover the site's current data practices", () => {
  assert.equal(PRIVACY_CONTACT_EMAIL, "geeks.kai@gmail.com");
  assert.match(PRIVACY_DISCLOSURES.analytics, /Microsoft Clarity/i);
  assert.match(PRIVACY_DISCLOSURES.serverProcessing, /server-backed/i);
  assert.match(PRIVACY_DISCLOSURES.serverProcessing, /temporary file/i);
  assert.match(PRIVACY_DISCLOSURES.serverProcessing, /error details/i);
  assert.match(PRIVACY_DISCLOSURES.advertising, /Google AdSense/i);
  assert.match(PRIVACY_DISCLOSURES.cookies, /cookies/i);
});

test("tool processing disclosure distinguishes server-backed transformations", () => {
  const serverBacked = getToolProcessingDetails(
    "/tools/typescript-to-javascript"
  );
  const browserOnly = getToolProcessingDetails("/tools/svg-to-jsx");

  assert.equal(serverBacked.mode, "server");
  assert.match(serverBacked.description, /sent to Folioify/i);
  assert.doesNotMatch(serverBacked.description, /never leaves/i);

  assert.equal(browserOnly.mode, "browser");
  assert.match(browserOnly.description, /processed in your browser/i);
});

test("new curated pages keep a newer route publication date", () => {
  assert.equal(
    getRouteLastModified("/tools/js-object-to-zod", "2026-07-25"),
    "2026-07-25"
  );
});

test("only manually curated tool pages are eligible for indexing", () => {
  const contentSource = fs.readFileSync(
    path.resolve(__dirname, "../lib/tool-page-content.ts"),
    "utf8"
  );
  const handAuthoredPaths = Array.from(
    contentSource.matchAll(/^  "(\/tools\/[^"]+)": \{/gm),
    match => match[1]
  ).sort();

  assert.deepEqual([...CURATED_TOOL_PATHS].sort(), handAuthoredPaths);
  assert.equal(CURATED_TOOL_PATHS.every(isToolPageIndexable), true);
  assert.equal(isToolPageIndexable("/tools/svg-to-jsx"), true);
  assert.equal(isToolPageIndexable("/tools/js-object-to-zod"), true);
  assert.equal(isToolPageIndexable("/tools/json-to-yaml"), false);
  assert.equal(shouldNoindexToolPage("/tools/svg-to-jsx"), false);
  assert.equal(shouldNoindexToolPage("/tools/svg-to-jsx", true), true);
  assert.equal(shouldNoindexToolPage("/tools/json-to-yaml"), true);
  assert.deepEqual(
    filterIndexableToolRoutes([
      { path: "/" },
      { path: "/tools/svg-to-jsx" },
      { path: "/tools/json-to-yaml" }
    ]),
    [{ path: "/tools/svg-to-jsx" }]
  );
});

test("Phase 2 pages expose useful examples, behavior, links, and honest freshness", () => {
  const jsxViewer = getToolPageContent("/tools/jsx-viewer");
  const tomlChecker = getToolPageContent("/tools/check-toml");

  assert.equal(jsxViewer.lastModified, "2026-07-25");
  assert.match(jsxViewer.inputExample, /useState/);
  assert.match(jsxViewer.outputExample, /Status: Ready/);
  assert.match(jsxViewer.behaviorNotes.join(" "), /dependencies/i);
  assert.deepEqual(jsxViewer.relatedPaths, [
    "/tools/html-to-jsx",
    "/tools/svg-to-jsx",
    "/tools/markdown-to-jsx"
  ]);

  assert.equal(tomlChecker.lastModified, "2026-07-25");
  assert.match(tomlChecker.inputExample, /requires-python/);
  assert.equal(tomlChecker.outputExample, "✓ Valid TOML syntax");
  assert.match(tomlChecker.behaviorNotes.join(" "), /line and column/i);
  assert.deepEqual(tomlChecker.relatedPaths, [
    "/tools/toml-formatter",
    "/tools/toml-to-json",
    "/tools/toml-to-yaml"
  ]);

  assert.equal(
    getRouteLastModified("/tools/jsx-viewer", "2026-05-10"),
    "2026-07-25"
  );
  assert.equal(
    getRouteLastModified("/tools/json-to-typescript", "2026-02-01"),
    "2026-02-01"
  );
});

test("TOML validation reports a concise one-based error location and context", () => {
  assert.equal(validateTomlSource(""), "");
  assert.equal(
    validateTomlSource('[project]\nname = "folioify"'),
    "✓ Valid TOML syntax"
  );

  const invalidResult = validateTomlSource('[project\nname = "folioify"');

  assert.match(invalidResult, /^✕ Invalid TOML syntax/);
  assert.match(invalidResult, /Line 1, column 10/);
  assert.match(
    invalidResult,
    /Unexpected character, expected whitespace, \. or \]/
  );
  assert.match(invalidResult, /\[project\n {9}\^/);
  assert.doesNotMatch(invalidResult, /\bpos \d+/);

  const tabbedInvalidResult = validateTomlSource("value =\t@");
  assert.match(tabbedInvalidResult, /value =\t@\n {7}\t \^/);
});
