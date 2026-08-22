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

const {
  XML_MAX_BYTES,
  XSLT_MAX_BYTES,
  assertInputSize,
  buildSafeHtmlPreviewDocument,
  convertXmlToCompactJson,
  validateLocalXsltSource
} = loadTypeScriptModule("../lib/xml-tools.ts");

test("XML to JSON preserves the existing compact mapping", () => {
  const output = JSON.parse(
    convertXmlToCompactJson(`<?xml version="1.0"?>
<catalog xmlns:media="urn:media">
  <item id="1">Alpha</item>
  <item id="2"><![CDATA[Beta < Gamma]]></item>
  <media:title>Namespaced</media:title>
</catalog>`)
  );

  assert.equal(output._declaration._attributes.version, "1.0");
  assert.deepEqual(output.catalog.item, [
    { _attributes: { id: "1" }, _text: "Alpha" },
    { _attributes: { id: "2" }, _cdata: "Beta < Gamma" }
  ]);
  assert.equal(output.catalog._attributes["xmlns:media"], "urn:media");
  assert.equal(output.catalog["media:title"]._text, "Namespaced");
});

test("XML conversion reports a concise one-based parse location", () => {
  assert.throws(
    () => convertXmlToCompactJson("<root><item></root>"),
    error => {
      assert.match(error.message, /^Invalid XML:/);
      assert.match(error.message, /line 1, column \d+/i);
      assert.doesNotMatch(error.message, /Line: 0/);
      return true;
    }
  );
});

test("XML and XSLT input limits use UTF-8 bytes", () => {
  assert.equal(XML_MAX_BYTES, 2 * 1024 * 1024);
  assert.equal(XSLT_MAX_BYTES, 256 * 1024);
  assert.doesNotThrow(() => assertInputSize("é", 2, "XML"));
  assert.throws(
    () => assertInputSize("éé", 3, "XML"),
    /XML is too large.*3 bytes/i
  );
});

test("local XSLT validation blocks network-capable and unsupported features", () => {
  assert.doesNotThrow(() =>
    validateLocalXsltSource(
      '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"></xsl:stylesheet>'
    )
  );

  for (const source of [
    '<!DOCTYPE xsl:stylesheet><xsl:stylesheet version="1.0"/>',
    '<xsl:stylesheet version="1.0"><xsl:include href="remote.xsl"/></xsl:stylesheet>',
    '<xsl:stylesheet version="1.0"><xsl:import href="remote.xsl"/></xsl:stylesheet>',
    "<xsl:value-of select=\"document('https://example.com/data.xml')\"/>",
    '<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"/>'
  ]) {
    assert.throws(() => validateLocalXsltSource(source));
  }
});

test("HTML preview applies a locked-down CSP before transformed markup", () => {
  const preview = buildSafeHtmlPreviewDocument(
    '<img src="https://example.com/tracker.png"><script>parent.alert(1)</script>'
  );

  assert.match(preview, /default-src 'none'/);
  assert.match(preview, /form-action 'none'/);
  assert.match(preview, /base-uri 'none'/);
  assert.ok(
    preview.indexOf("Content-Security-Policy") < preview.indexOf("<script>")
  );
});

test("XML routes expose separate drafts, explicit run, and sandboxed preview", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../pages/tools/xml-to-html.tsx"),
    "utf8"
  );

  assert.match(source, /useData\("xml"\)/);
  assert.match(source, /useData\("xslt"\)/);
  assert.match(source, /Run transformation/);
  assert.match(source, /await transformXmlWithXslt/);
  assert.match(source, /sandbox=""/);
  assert.doesNotMatch(source, /allow-scripts|allow-same-origin/);
  assert.match(source, /trackProductEvent\("tool_conversion_started"\)/);
  assert.match(source, /trackProductEvent\("tool_conversion_completed"\)/);
  assert.match(source, /trackProductEvent\("tool_conversion_failed"\)/);
});

test("XSLT fallback is lazy and remains browser-only", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../lib/xml-tools.ts"),
    "utf8"
  );

  assert.match(source, /await import\("xslt-polyfill"\)/);
  assert.match(source, /typeof XSLTProcessor/);
  assert.doesNotMatch(source, /^import .*xslt-polyfill/m);
});
