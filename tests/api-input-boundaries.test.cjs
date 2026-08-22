const assert = require("node:assert/strict");
const test = require("node:test");

test("server converters accept only POST requests with source text", () => {
  const { validatePostTextInput } = require("../lib/api-input.js");

  assert.deepEqual(validatePostTextInput("GET", "source", "Source code"), {
    message: "Method not allowed",
    ok: false,
    status: 405
  });
  assert.deepEqual(validatePostTextInput("POST", "  ", "Source code"), {
    message: "Source code is required",
    ok: false,
    status: 400
  });
  assert.deepEqual(validatePostTextInput("POST", "source", "Source code"), {
    ok: true,
    value: "source"
  });
});

test("TypeScript converters reject malformed source without type checking", () => {
  const { hasTypescriptSyntaxErrors } = require("../lib/ts-syntax.js");

  assert.equal(
    hasTypescriptSyntaxErrors("export interface User { name: string; }"),
    false
  );
  assert.equal(hasTypescriptSyntaxErrors("const answer: = 42;"), true);
});
