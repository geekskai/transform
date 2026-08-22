import { xml2json } from "xml-js";

export const XML_MAX_BYTES = 2 * 1024 * 1024;
export const XSLT_MAX_BYTES = 256 * 1024;

export type XsltTransformResult = {
  html: string;
};

export class XmlToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "XmlToolError";
  }
}

function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${bytes / (1024 * 1024)} MB`;
  }

  if (bytes < 1024) {
    return `${bytes} bytes`;
  }

  return `${bytes / 1024} KB`;
}

export function assertInputSize(
  value: string,
  maxBytes: number,
  label: string
): void {
  const actualBytes = utf8ByteLength(value);

  if (actualBytes > maxBytes) {
    throw new XmlToolError(
      `${label} is too large. The limit is ${formatBytes(
        maxBytes
      )}; this input is ${actualBytes.toLocaleString("en-US")} bytes.`
    );
  }
}

function normalizeXmlJsError(error: unknown): XmlToolError {
  const message = error instanceof Error ? error.message : String(error);
  const summary =
    message.split(/\r?\n/, 1)[0] || "Unable to parse the document.";
  const line = message.match(/Line:\s*(\d+)/i);
  const column = message.match(/Column:\s*(\d+)/i);
  const location =
    line && column
      ? ` (line ${Number(line[1]) + 1}, column ${Number(column[1]) + 1})`
      : "";

  return new XmlToolError(`Invalid XML: ${summary}${location}.`);
}

export function convertXmlToCompactJson(source: string): string {
  if (!source.trim()) return "";

  assertInputSize(source, XML_MAX_BYTES, "XML");

  try {
    return JSON.stringify(
      JSON.parse(
        xml2json(source, {
          compact: true
        })
      )
    );
  } catch (error) {
    throw normalizeXmlJsError(error);
  }
}

export function validateLocalXmlSource(source: string): void {
  if (/<!DOCTYPE\b/i.test(source)) {
    throw new XmlToolError(
      "DOCTYPE declarations are not supported in this browser-only tool."
    );
  }
}

export function validateLocalXsltSource(source: string): void {
  validateLocalXmlSource(source);

  if (/<\s*xsl:(?:include|import)\b/i.test(source)) {
    throw new XmlToolError(
      "External XSLT includes and imports are not supported. Paste one self-contained stylesheet."
    );
  }

  if (/\bdocument\s*\(/i.test(source)) {
    throw new XmlToolError(
      "The XSLT document() function is disabled because this tool does not load external resources."
    );
  }

  const version = source.match(
    /<\s*xsl:(?:stylesheet|transform)\b[^>]*\bversion\s*=\s*["']([^"']+)["']/i
  );

  if (version && version[1] !== "1.0") {
    throw new XmlToolError(
      `XSLT ${version[1]} is not supported. This tool runs browser-based XSLT 1.0.`
    );
  }
}

function parseBrowserXml(source: string, label: string): Document {
  const parsed = new DOMParser().parseFromString(source, "application/xml");
  const parserError = parsed.querySelector("parsererror");

  if (parserError) {
    const detail = (parserError.textContent || "Unable to parse the document.")
      .replace(/\s+/g, " ")
      .trim();
    throw new XmlToolError(`Invalid ${label}: ${detail}`);
  }

  return parsed;
}

async function ensureXsltProcessor(): Promise<void> {
  if (typeof XSLTProcessor !== "undefined") return;

  const browserWindow = window as Window & { xsltPolyfillQuiet?: boolean };
  browserWindow.xsltPolyfillQuiet = true;

  await import("xslt-polyfill");

  if (typeof XSLTProcessor === "undefined") {
    throw new XmlToolError(
      "XSLT 1.0 could not be initialized in this browser. Try reloading the page or using a current browser."
    );
  }
}

export async function transformXmlWithXslt(
  xmlSource: string,
  xsltSource: string
): Promise<XsltTransformResult> {
  if (!xmlSource.trim()) {
    throw new XmlToolError(
      "Enter an XML document before running the transform."
    );
  }
  if (!xsltSource.trim()) {
    throw new XmlToolError(
      "Enter an XSLT stylesheet before running the transform."
    );
  }

  assertInputSize(xmlSource, XML_MAX_BYTES, "XML");
  assertInputSize(xsltSource, XSLT_MAX_BYTES, "XSLT");
  validateLocalXmlSource(xmlSource);
  validateLocalXsltSource(xsltSource);

  await ensureXsltProcessor();

  const xmlDocument = parseBrowserXml(xmlSource, "XML");
  const xsltDocument = parseBrowserXml(xsltSource, "XSLT");
  const processor = new XSLTProcessor();

  try {
    processor.importStylesheet(xsltDocument);
    const resultDocument = processor.transformToDocument(xmlDocument);
    const html = new XMLSerializer().serializeToString(resultDocument);

    if (!html.trim()) {
      throw new XmlToolError("The XSLT transformation produced no output.");
    }

    return { html };
  } catch (error) {
    if (error instanceof XmlToolError) throw error;

    const message = error instanceof Error ? error.message : String(error);
    throw new XmlToolError(`XSLT transformation failed: ${message}`);
  }
}

export function buildSafeHtmlPreviewDocument(html: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'; connect-src 'none'; media-src 'none'; object-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data: blob:"
    />
    <meta name="referrer" content="no-referrer" />
    <style>html, body { margin: 0; min-height: 100%; }</style>
  </head>
  <body>${html}</body>
</html>`;
}
