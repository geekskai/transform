const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

function loadTypeScriptModule(relativePath) {
  const filename = path.resolve(__dirname, relativePath);
  const source = fs.readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020
    },
    fileName: filename
  }).outputText;
  const loadedModule = new Module(filename, module);

  loadedModule.filename = filename;
  loadedModule.paths = Module._nodeModulePaths(path.dirname(filename));
  loadedModule._compile(compiled, filename);

  return loadedModule.exports;
}

const { convertJsObjectToZod } = loadTypeScriptModule(
  "../lib/js-object-to-zod.ts"
);

test("converts a JavaScript object literal into a named Zod schema", () => {
  const result = convertJsObjectToZod(
    `{
      user: { id: 1, name: 'Kai' },
      active: true,
      tags: ['a', 'b'],
    }`,
    "UserSchema"
  );

  assert.equal(
    result,
    `import { z } from "zod";

export const UserSchema = z.object({
  user: z.object({ id: z.number(), name: z.string() }),
  active: z.boolean(),
  tags: z.array(z.string()),
});
`
  );
});

test("rejects executable expressions without running them", () => {
  globalThis.__jsObjectToZodExecuted = false;

  assert.throws(
    () =>
      convertJsObjectToZod(
        `(() => {
          globalThis.__jsObjectToZodExecuted = true;
          return { id: 1 };
        })()`,
        "schema"
      ),
    /object literal/
  );
  assert.equal(globalThis.__jsObjectToZodExecuted, false);

  delete globalThis.__jsObjectToZodExecuted;
});

test("rejects statements appended outside the wrapped object expression", () => {
  assert.throws(
    () =>
      convertJsObjectToZod(
        `{ id: 1 }); globalThis.compromised = true; const ignored = ({ id: 2 }`,
        "schema"
      ),
    /object literal/
  );
});

test("rejects values that cannot be represented as JSON", () => {
  assert.throws(
    () => convertJsObjectToZod(`{ id: 1n }`, "schema"),
    /JSON-compatible/
  );
  assert.throws(
    () => convertJsObjectToZod(`{ value: 1e999 }`, "schema"),
    /JSON-compatible/
  );
});
