const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const vendorName = ["sen", "try"].join("");
const sdkName = `@${vendorName}/nextjs`;

test("the retired monitoring SDK has no runtime or build integration", () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf8")
  );

  assert.equal(packageJson.dependencies?.[sdkName], undefined);

  for (const relativePath of [
    ".env.example",
    "instrumentation-client.ts",
    "instrumentation.ts",
    `${vendorName}.edge.config.ts`,
    `${vendorName}.server.config.ts`
  ]) {
    assert.equal(fs.existsSync(path.join(root, relativePath)), false);
  }

  for (const relativePath of [
    "lib/site-transparency.ts",
    "next.config.js",
    "pages/privacy.tsx"
  ]) {
    const contents = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.doesNotMatch(contents, new RegExp(vendorName, "i"));
  }
});
