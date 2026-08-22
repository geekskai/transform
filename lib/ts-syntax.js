const ts = require("typescript");

function hasTypescriptSyntaxErrors(source) {
  const sourceFile = ts.createSourceFile(
    "source.ts",
    source,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );

  return sourceFile.parseDiagnostics.length > 0;
}

module.exports = { hasTypescriptSyntaxErrors };
