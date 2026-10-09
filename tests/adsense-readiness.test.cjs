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
const { INDEXABLE_TOOL_PATHS, filterIndexableToolRoutes, isToolPageIndexable } =
  loadTypeScriptModule("../lib/tool-indexing.ts");
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

test("quality-reviewed tool pages use one explicit index inventory", () => {
  assert.equal(isToolPageIndexable("/tools/svg-to-jsx"), true);
  assert.equal(isToolPageIndexable("/tools/js-object-to-zod"), true);
  assert.equal(isToolPageIndexable("/tools/json-to-yaml"), true);
  assert.equal(isToolPageIndexable("/about"), false);
  assert.equal(isToolPageIndexable("/tools/internal-preview"), false);
  assert.equal(INDEXABLE_TOOL_PATHS.length, 71);
  assert.equal(new Set(INDEXABLE_TOOL_PATHS).size, 71);
  assert.deepEqual(
    filterIndexableToolRoutes([
      { path: "/" },
      { path: "/tools/svg-to-jsx" },
      { path: "/tools/json-to-yaml" },
      { path: "/tools/internal-preview" }
    ]),
    [{ path: "/tools/svg-to-jsx" }, { path: "/tools/json-to-yaml" }]
  );
});

test("all current tool routes have useful, non-placeholder SEO content", () => {
  const routeSource = fs.readFileSync(
    path.resolve(__dirname, "../utils/routes.tsx"),
    "utf8"
  );
  const routePaths = Array.from(
    routeSource.matchAll(/path: "(\/tools\/[^"]+)"/g),
    match => match[1]
  );

  assert.deepEqual([...INDEXABLE_TOOL_PATHS].sort(), [...routePaths].sort());

  const contentFingerprints = new Set();
  for (const routePath of routePaths) {
    const content = getToolPageContent(routePath);
    assert.ok(content, `${routePath} must have page content`);
    assert.ok(
      content.inputExample?.trim(),
      `${routePath} needs an input example`
    );
    assert.ok(
      content.outputExample?.trim(),
      `${routePath} needs an output example`
    );
    assert.ok(content.commonErrors?.length >= 2, `${routePath} needs errors`);
    assert.ok(content.limitations?.length >= 2, `${routePath} needs limits`);
    assert.ok(content.useCases.length >= 3, `${routePath} needs use cases`);

    const renderedContent = JSON.stringify(content);
    assert.doesNotMatch(renderedContent, /input goes here/i);
    assert.doesNotMatch(renderedContent, /move copied examples/i);
    assert.doesNotMatch(
      renderedContent,
      /no usage limit|unlimited conversion/i
    );
    assert.doesNotMatch(renderedContent, /utility for (render|convert)/i);
    assert.doesNotMatch(renderedContent, /review the result for (test|check)/i);
    contentFingerprints.add(renderedContent);
  }

  assert.equal(contentFingerprints.size, routePaths.length);
});

test("server-backed page content never claims transformation happens in browser", () => {
  const serverPaths = [
    "/tools/flow-to-javascript",
    "/tools/flow-to-typescript",
    "/tools/flow-to-typescript-declaration",
    "/tools/html-to-pug",
    "/tools/json-schema-to-openapi-schema",
    "/tools/typescript-to-flow",
    "/tools/typescript-to-javascript",
    "/tools/typescript-to-json-schema",
    "/tools/typescript-to-typescript-declaration",
    "/tools/typescript-to-zod"
  ];

  for (const routePath of serverPaths) {
    const content = JSON.stringify(getToolPageContent(routePath));
    assert.doesNotMatch(
      content,
      /transformation (runs|happens) in your browser/i
    );
    assert.equal(getToolProcessingDetails(routePath).mode, "server");
  }
});

test("heavy converters are loaded only after user interaction", () => {
  const conversionPanel = fs.readFileSync(
    path.resolve(__dirname, "../components/ConversionPanel.tsx"),
    "utf8"
  );
  const toml = fs.readFileSync(
    path.resolve(__dirname, "../pages/tools/toml-formatter.tsx"),
    "utf8"
  );
  const cadence = fs.readFileSync(
    path.resolve(__dirname, "../pages/tools/cadence-to-go.tsx"),
    "utf8"
  );
  const flow = fs.readFileSync(
    path.resolve(__dirname, "../pages/tools/json-to-flow.tsx"),
    "utf8"
  );

  assert.match(conversionPanel, /deferTransformUntilUserInput/);
  assert.match(toml, /import\("prettier\/standalone"\)/);
  assert.match(toml, /import\("prettier-plugin-toml"\)/);
  assert.doesNotMatch(toml, /^import .*prettier/m);
  assert.match(cadence, /import\("@lemonneko\/easi-gen"\)/);
  assert.doesNotMatch(cadence, /^import .*@lemonneko\/easi-gen/m);
  assert.match(flow, /import\("json-ts"\)/);
  assert.doesNotMatch(flow, /^import .*json-ts/m);
});

test("Phase 2 pages expose useful examples, behavior, links, and honest freshness", () => {
  const jsxViewer = getToolPageContent("/tools/jsx-viewer");
  const tomlChecker = getToolPageContent("/tools/check-toml");
  const xmlToHtml = getToolPageContent("/tools/xml-to-html");
  const xmlToJson = getToolPageContent("/tools/xml-to-json");

  assert.equal(jsxViewer.lastModified, "2026-09-14");
  assert.match(jsxViewer.inputExample, /useState/);
  assert.match(jsxViewer.outputExample, /Status: Ready/);
  assert.match(jsxViewer.behaviorNotes.join(" "), /dependencies/i);
  assert.match(jsxViewer.capabilities.join(" "), /Open local \.jsx/);
  assert.match(jsxViewer.workspaceInstruction, /drag it into the workspace/i);
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

  assert.equal(xmlToHtml.lastModified, "2026-08-22");
  assert.match(xmlToHtml.inputExample, /<note>/);
  assert.match(xmlToHtml.outputExample, /<main>/);
  assert.match(xmlToHtml.workspaceInstruction, /Run transformation/);
  assert.match(xmlToHtml.dataSourceNote, /browser XSLT 1\.0 engine/);
  assert.match(xmlToHtml.dataSourceNote, /WebAssembly fallback/);
  assert.deepEqual(xmlToHtml.relatedPaths, [
    "/tools/xml-to-json",
    "/tools/html-viewer"
  ]);

  assert.equal(xmlToJson.lastModified, "2026-08-22");
  assert.match(xmlToJson.inputExample, /CDATA/);
  assert.match(xmlToJson.outputExample, /_attributes/);
  assert.match(xmlToJson.behaviorNotes.join(" "), /compact xml-js/i);
  assert.deepEqual(xmlToJson.relatedPaths, [
    "/tools/xml-to-html",
    "/tools/json-to-typescript"
  ]);

  assert.equal(
    getRouteLastModified("/tools/jsx-viewer", "2026-05-10"),
    "2026-09-14"
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
