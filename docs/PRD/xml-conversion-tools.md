# XML Conversion Tools

## Goal

Validate whether API and integration developers who land from organic search complete useful XML transformation work in Folioify. The first release improves XML to JSON and adds XML plus XSLT 1.0 to HTML; it does not create a broad XML tool directory.

## First Release

- `/tools/xml-to-json` keeps the existing compact `xml-js` mapping and adds explicit limits, errors, examples, and indexable content.
- `/tools/xml-to-html` accepts one XML document and one self-contained XSLT 1.0 stylesheet, runs only after an explicit action, and returns copyable HTML plus an isolated preview.
- XML is limited to 2 MB. XSLT is limited to 256 KB.
- Both transformations run in the browser. Analytics may still receive interaction and technical data as described in the privacy notice.

## XML to HTML Boundary

- Support browser-based XSLT 1.0 only, using the native processor when available and a lazily loaded local WebAssembly fallback otherwise.
- Reject DOCTYPE, `xsl:include`, `xsl:import`, and `document()`.
- Do not add a server transformer, remote stylesheet loader, or XSLT 2.0/3.0 fallback.
- Treat generated source as the result. The preview is an untrusted visual aid with no scripts, same-origin access, forms, navigation privileges, or external network resources.

## Success Gate

Evaluate each route independently after at least 100 organic-search landings:

- Started transformation / landing sessions: at least 20%.
- Completed / started: at least 70%.
- Failed / started: at most 10%.
- Copied result / completed: at least 25%.

Fewer than 100 organic landings after eight weeks is inconclusive and does not authorize more XML pages.

## Follow-up Rule

- Only XML to JSON passes: build JSON to XML next.
- Only XML to HTML passes: build XML Formatter and Syntax Checker, then evaluate XPath.
- Both pass: follow the route with the higher copied-result-per-landing rate; if the difference is at most five percentage points, choose JSON to XML.
- Neither passes: stop XML expansion and diagnose indexing, query intent, and landing experience.
