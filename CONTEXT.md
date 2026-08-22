# Folioify Tool Context

This context defines product-specific language used across Folioify's developer tools.

## JSX Viewer Language

**Code dependency**:
A package referenced by the user's JSX/TSX source through an external module import or require. It remains protected while the source still references it.
_Avoid_: Auto dependency, inferred package

**Manual dependency**:
A package explicitly added by the user through the dependency panel to supplement the packages detected from source code.
_Avoid_: Override dependency, temporary package

**User source**:
The JSX/TSX text entered or edited by the user and persisted by the viewer. It is the canonical source and must not be replaced by a generated sandbox file.
_Avoid_: App file, sandbox source

**Derived sandbox file**:
The Sandpack entry file generated from user source so the sandbox can compile and render it. It may add runtime scaffolding but must not become the canonical user source.
_Avoid_: User source, saved code

**Preview update**:
The lifecycle from a preview-affecting change until the corresponding sandbox either renders successfully or produces a compilation or runtime failure. A newer source, dependency, Tailwind, or restart change supersedes any unfinished update, and a previously rendered preview does not complete the latest update.
_Avoid_: File update, loading cycle

## XML Tools Language

**XML document**:
A complete XML input with one root element that a Folioify XML tool parses or transforms.
_Avoid_: XML file, payload

**XSLT stylesheet**:
A self-contained set of XSLT transformation rules applied to an XML document.
_Avoid_: HTML template, converter rules

**Transformation result**:
The output produced by applying an XSLT stylesheet to an XML document.
_Avoid_: Preview, rendered page

**Well-formed XML**:
XML whose syntax, nesting, quoting, and root structure satisfy the XML parsing rules.
_Avoid_: Valid XML, schema-valid XML

**Schema-valid XML**:
Well-formed XML that also conforms to an explicitly supplied schema such as XSD.
_Avoid_: Well-formed XML, syntax-valid XML
