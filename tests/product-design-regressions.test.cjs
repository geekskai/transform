const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function readSource(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("tool examples contain long code without widening the mobile page", () => {
  const source = readSource("components/ToolPageLayout.tsx");

  assert.match(source, /grid min-w-0 max-w-7xl/);
  assert.equal((source.match(/min-w-0 rounded-2xl/g) || []).length, 2);
  assert.equal((source.match(/max-w-full overflow-auto/g) || []).length, 2);
});

test("JSX preview queues the latest source revision until Sandpack is ready", () => {
  const source = readSource("components/jsx-viewer/SandpackJsxViewer.tsx");

  assert.match(source, /pendingPreviewRef/);
  assert.match(source, /updateFileRef\.current\(APP_FILE, nextCode, false\)/);
  assert.match(
    source,
    /updateFileRef\.current\(APP_FILE, pendingPreview\.code, true\)/
  );
  assert.match(source, /role="status"/);
});
