const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { parse } = require("@babel/parser");

const root = path.resolve(__dirname, "..");
const read = relativePath =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const SAMPLE_JSX_FOR_SYNC = "const App = () => <h2>Starter</h2>;";
const { preparePreviewSource } = require(
  path.join(root, "lib/jsx-viewer/source-preparation.js")
);
const { classifySourceChange } = require(
  path.join(root, "lib/jsx-viewer/workspace-coordinator.js")
);

test("JSX preview preserves explicit default exports and is idempotent", () => {
  const source = `import React from "react";\nexport default function StatusCard() {\n  return <h2>Ready</h2>;\n}`;
  const first = preparePreviewSource(source);
  const second = preparePreviewSource(first.code);

  assert.equal(first.error, null);
  assert.equal(first.code, source);
  assert.equal(second.code, first.code);
  assert.equal((second.code.match(/export default/g) || []).length, 1);
  assert.equal((second.code.match(/from "react"/g) || []).length, 1);

  const namedDefault = `const StatusCard = () => <h2>Ready</h2>;\nexport { StatusCard as default };`;
  const namedDefaultResult = preparePreviewSource(namedDefault);
  assert.equal(
    (
      namedDefaultResult.code.match(/export\s+(?:default|\{[^}]*default)/g) ||
      []
    ).length,
    1
  );
});

test("JSX preview wraps bare JSX and derives real named components", () => {
  const bare = preparePreviewSource(`<main>Preview test</main>`);
  assert.equal(bare.error, null);
  assert.match(
    bare.code,
    /const App = \(\) => \(<main>Preview test<\/main>\);/
  );
  assert.match(bare.code, /export default App;/);

  for (const name of ["App", "Preview", "Component", "StatusCard"]) {
    const result = preparePreviewSource(
      `const ${name} = () => <h2>Preview test</h2>;`
    );
    assert.equal(result.error, null);
    assert.match(result.code, new RegExp(`export default ${name};`));
  }
});

test("JSX preview wraps the parsed bare expression instead of trailing syntax", () => {
  for (const source of [
    `<main>Preview test</main>;`,
    `/* preview */\n<main>Preview test</main>;`,
    `"use client";\n<main>Preview test</main>`
  ]) {
    const result = preparePreviewSource(source);

    assert.equal(result.error, null);
    assert.doesNotThrow(() =>
      parse(result.code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"]
      })
    );
    assert.match(result.code, /export default App;/);
  }
});

test("JSX preview ignores comments and strings that look like exports or declarations", () => {
  const source = `// export default App\nconst note = "function Preview() {}";\nconst StatusCard = () => <h2>Ready</h2>;`;
  const result = preparePreviewSource(source);

  assert.equal(result.error, null);
  assert.match(result.code, /export default StatusCard;/);
  assert.doesNotMatch(result.code, /export default App;/);
  assert.doesNotMatch(result.code, /export default Preview;/);
});

test("JSX preview prefers real conventional names and supports component classes and factories", () => {
  const preferred = preparePreviewSource(`
const StatusCard = () => <h2>Status</h2>;
const Preview = () => <h2>Preview</h2>;
`);
  const componentClass = preparePreviewSource(`
class StatusCard extends React.Component {
  render() { return <h2>Status</h2>; }
}
`);
  const componentFactory = preparePreviewSource(
    `const StatusCard = React.memo(() => <h2>Status</h2>);`
  );

  assert.match(preferred.code, /export default Preview;/);
  assert.match(componentClass.code, /export default StatusCard;/);
  assert.match(componentFactory.code, /export default StatusCard;/);
});

test("JSX preview accepts class-expression components and rejects async or generator functions", () => {
  const classExpression = preparePreviewSource(`
const StatusCard = class extends React.Component {
  render() { return <h2>Status</h2>; }
};
`);
  const asyncFunction = preparePreviewSource(
    `async function StatusCard() { return <h2>Status</h2>; }`
  );
  const generatorFunction = preparePreviewSource(
    `function* StatusCard() { yield <h2>Status</h2>; }`
  );

  assert.equal(classExpression.error, null);
  assert.match(classExpression.code, /export default StatusCard;/);
  assert.match(asyncFunction.error || "", /component/i);
  assert.match(generatorFunction.error || "", /component/i);
  assert.doesNotMatch(asyncFunction.code, /export default StatusCard;/);
  assert.doesNotMatch(generatorFunction.code, /export default StatusCard;/);
});

test("JSX preview reports syntax errors without inventing an export", () => {
  const result = preparePreviewSource(
    `const StatusCard = () => <h2>Missing close;`
  );

  assert.match(result.error || "", /syntax|unexpected|unterminated/i);
  assert.doesNotMatch(result.code, /export default (App|StatusCard);/);
});

test("JSX preview reports when no previewable component exists", () => {
  const result = preparePreviewSource(`const answer = 42;`);

  assert.match(result.error || "", /default export|component/i);
  assert.doesNotMatch(result.code, /export default App;/);
});

test("JSX viewer keeps canonical user source separate from the derived app file", () => {
  const viewer = read("components/jsx-viewer/SandpackJsxViewer.tsx");

  assert.match(viewer, /USER_SOURCE_FILE/);
  assert.match(viewer, /sandpack\.files\[USER_SOURCE_FILE\]/);
  assert.match(viewer, /activeFile: USER_SOURCE_FILE/);
  assert.match(viewer, /visibleFiles: \[USER_SOURCE_FILE\]/);
  assert.match(viewer, /\[APP_FILE\]: \{\s+code: previewPreparation\.code/);
  assert.match(viewer, /files=\{editorFilesRef\.current\}/);
  assert.doesNotMatch(viewer, /updateFileRef\.current\(APP_FILE/);
  assert.doesNotMatch(viewer, /onCodeChange\(activeCode\)/);
});

test("source synchronization never mistakes user text for a sandbox reset", () => {
  assert.equal(
    classifySourceChange({
      activeSource: SAMPLE_JSX_FOR_SYNC,
      lastObservedSource: "const Other = () => null;",
      pendingProgrammaticSource: null
    }),
    "user-edit"
  );
  assert.equal(
    classifySourceChange({
      activeSource: "const Other = () => null;",
      lastObservedSource: "const Other = () => null;",
      pendingProgrammaticSource: SAMPLE_JSX_FOR_SYNC
    }),
    "await-programmatic"
  );
  assert.equal(
    classifySourceChange({
      activeSource: SAMPLE_JSX_FOR_SYNC,
      lastObservedSource: "const Other = () => null;",
      pendingProgrammaticSource: SAMPLE_JSX_FOR_SYNC
    }),
    "programmatic-applied"
  );
});

test("JSX viewer dynamic loader exposes an error message and retry action", () => {
  const page = read("pages/tools/jsx-viewer.tsx");

  assert.match(page, /Unable to load the JSX workspace/);
  assert.match(page, /Try again/);
  assert.match(page, /retry/);
  assert.match(page, /WORKSPACE_LOAD_TIMEOUT_MS/);
  assert.match(page, /Promise\.race/);
});

test("JSX viewer page copy and FAQ describe the implemented detection rules", () => {
  const content = read("lib/tool-page-content.ts");
  const structuredData = read("lib/seo.ts");

  assert.match(content, /keeps pasted JSX\/TSX as the editable user source/);
  assert.match(content, /parses actual top-level declarations/);
  assert.match(content, /Comments and strings are not treated as declarations/);
  assert.match(structuredData, /getToolPageFAQs\(meta\.path\)/);
});
