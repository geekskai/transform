import type { ToolPageContent } from "./tool-page-content";
import { getToolProcessingDetails } from "./tool-processing";

type ToolDescriptor = {
  label: string;
  source: string;
  target: string;
  kind: "checker" | "viewer" | "converter";
};

type SourceProfile = {
  example: string;
  subject: string;
  parseError: string;
  caveat: string;
};

type TargetProfile = {
  example: string;
  purpose: string;
  review: string;
  error: string;
};

const CONTENT_REVIEW_DATE = "2026-10-09";

const SOURCE_PROFILES: Record<string, SourceProfile> = {
  svg: {
    example: `<svg viewBox="0 0 24 24" aria-label="Check">
  <path d="M5 12l4 4L19 6" />
</svg>`,
    subject: "an accessible check-mark icon with a viewBox and path",
    parseError:
      "Malformed SVG tags or invalid attributes stop the markup parser.",
    caveat:
      "Review viewBox, fill, stroke, and accessible naming after conversion."
  },
  html: {
    example: `<section class="card">
  <h2>Build status</h2>
  <p>All checks passed.</p>
</section>`,
    subject: "a small status card with a heading and paragraph",
    parseError:
      "Unclosed elements and malformed attributes can change the parsed DOM.",
    caveat:
      "Scripts, external assets, and framework-specific behavior need separate review."
  },
  json: {
    example: `{
  "id": "prod_42",
  "name": "Developer Toolkit",
  "active": true,
  "tags": ["conversion", "schema"]
}`,
    subject: "a product record with scalar fields and a string array",
    parseError:
      "Trailing commas, comments, or unquoted keys are not valid JSON.",
    caveat:
      "One sample cannot reveal optional fields, nullability, or every array variant."
  },
  "json-schema": {
    example: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id"],
  "properties": { "id": { "type": "string" } }
}`,
    subject: "an object schema with one required string property",
    parseError:
      "Invalid JSON or unsupported schema keywords can prevent conversion.",
    caveat:
      "Confirm draft compatibility and review references, unions, and custom keywords."
  },
  css: {
    example: `.card {
  display: grid;
  gap: 1rem;
  border-radius: 0.75rem;
}`,
    subject: "a card rule using grid, spacing, and rounded corners",
    parseError:
      "Incomplete declarations or missing braces can prevent CSS parsing.",
    caveat:
      "Pseudo states, media queries, and custom properties may require manual mapping."
  },
  "js-object": {
    example: `{
  userId: 42,
  displayName: 'Kai',
  roles: ['admin', 'editor'],
}`,
    subject: "a JavaScript object literal with unquoted keys and an array",
    parseError:
      "Functions, calls, spreads, and other executable expressions are rejected.",
    caveat:
      "Only literal data can be inferred safely; runtime values are not executed."
  },
  graphql: {
    example: `type Product {
  id: ID!
  name: String!
  tags: [String!]!
}

type Query { product(id: ID!): Product }`,
    subject: "a Product type and a query field in GraphQL SDL",
    parseError:
      "Invalid SDL, unresolved types, or malformed operations fail parsing.",
    caveat:
      "Custom scalars, directives, and project-specific codegen settings need review."
  },
  jsonld: {
    example: `{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Folioify"
}`,
    subject: "a schema.org SoftwareApplication document",
    parseError:
      "Invalid JSON-LD contexts, terms, or node identifiers can fail processing.",
    caveat:
      "A transformed document is not proof of Google rich-result eligibility."
  },
  typescript: {
    example: `export interface Product {
  id: string;
  name?: string;
  tags: string[];
}`,
    subject: "a TypeScript interface with optional and array properties",
    parseError:
      "Unsupported syntax or unresolved project types can block generation.",
    caveat:
      "Compiler options, imports, generics, and runtime semantics may need manual work."
  },
  flow: {
    example: `type Product = {
  id: string,
  name?: string,
  tags: Array<string>,
};`,
    subject: "a Flow object type with optional and array properties",
    parseError:
      "Flow-specific syntax outside the converter's supported subset can fail.",
    caveat:
      "Exact objects, variance, and utility types do not map one-to-one to TypeScript."
  },
  yaml: {
    example: `service:
  name: folioify
  enabled: true
  ports:
    - 3000
    - 3001`,
    subject: "a nested service configuration with booleans and a list",
    parseError:
      "Incorrect indentation, tabs, or malformed scalars can change YAML parsing.",
    caveat:
      "Anchors, aliases, tags, and implicit scalar typing deserve manual review."
  },
  markdown: {
    example: `# Release notes

- Added schema conversion
- Improved error messages

Read the **migration guide** before upgrading.`,
    subject: "release notes with a heading, list, and emphasized text",
    parseError:
      "Unclosed inline markup or malformed extensions can produce unexpected output.",
    caveat: "Raw HTML and Markdown extensions vary between renderers."
  },
  toml: {
    example: `[server]
host = "localhost"
port = 3000
enabled = true`,
    subject: "a TOML server table with string, number, and boolean values",
    parseError:
      "Duplicate keys, invalid dates, or malformed tables fail TOML parsing.",
    caveat: "Comments and formatting may not survive format conversion."
  },
  cadence: {
    example: `pub struct Profile {
  pub let name: String
  init(name: String) { self.name = name }
}`,
    subject: "a Cadence resource-style data structure with a string field",
    parseError:
      "Unsupported Cadence declarations or incomplete syntax can stop generation.",
    caveat:
      "Generated Go code needs review against the Cadence and Flow SDK versions in use."
  },
  "object-styles": {
    example: `const styles = {
  card: { backgroundColor: "white", borderRadius: "12px" }
};`,
    subject: "a JavaScript style object for a card",
    parseError:
      "Computed values and unsupported JavaScript expressions cannot be flattened safely.",
    caveat: "Nested selectors and responsive rules may require manual CSS."
  }
};

const TARGET_PROFILES: Record<string, TargetProfile> = {
  jsx: {
    example: `export function StatusCard() {
  return <section className="card">All checks passed.</section>;
}`,
    purpose: "a React-compatible JSX component draft",
    review:
      "Check className conversion, accessibility, and framework-specific props.",
    error:
      "HTML-only attributes or unsupported Markdown nodes may need manual JSX edits."
  },
  "react-native": {
    example: `import Svg, { Path } from "react-native-svg";

export const CheckIcon = () => (
  <Svg viewBox="0 0 24 24"><Path d="M5 12l4 4L19 6" /></Svg>
);`,
    purpose: "a react-native-svg component",
    review:
      "Confirm react-native-svg is installed and map web-only attributes manually.",
    error:
      "DOM attributes that React Native does not support require replacement."
  },
  pug: {
    example: `section.card
  h2 Build status
  p All checks passed.`,
    purpose: "an indented Pug template",
    review: "Review whitespace-sensitive nesting and any embedded expressions.",
    error:
      "Ambiguous or malformed HTML nesting can create incorrect Pug indentation."
  },
  proptypes: {
    example: `Product.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
};`,
    purpose: "React PropTypes for the observed JSON fields",
    review:
      "Decide which fields are actually required from real application behavior.",
    error:
      "Null values and mixed arrays cannot produce precise PropTypes from one sample."
  },
  flow: {
    example: `type Product = {
  id: string,
  name: string,
  active: boolean,
  tags: Array<string>,
};`,
    purpose: "Flow type definitions",
    review:
      "Review exactness, variance, nullable values, and optional properties.",
    error:
      "Target-project Flow syntax and utility types may need manual adjustment."
  },
  graphql: {
    example: `type Product {
  id: String!
  name: String!
  active: Boolean!
  tags: [String!]!
}`,
    purpose: "a GraphQL object type draft",
    review:
      "Choose IDs, nullability, and scalar types from the real API contract.",
    error:
      "A sample payload cannot determine GraphQL field nullability reliably."
  },
  typescript: {
    example: `export interface Product {
  id: string;
  name: string;
  active: boolean;
  tags: string[];
}`,
    purpose: "TypeScript declarations for the observed structure",
    review:
      "Check names, unions, nullable fields, and optional properties in the target project.",
    error:
      "Mixed arrays and incomplete examples can lead to broad inferred types."
  },
  "mobx-state-tree": {
    example: `const Product = types.model("Product", {
  id: types.identifier,
  name: types.string,
  active: types.boolean,
  tags: types.array(types.string),
});`,
    purpose: "a MobX-State-Tree model draft",
    review:
      "Add actions, views, identifiers, and optional defaults required by the app.",
    error:
      "Nulls and heterogeneous arrays require explicit MST model decisions."
  },
  sarcastic: {
    example: `const Product = S.object({
  id: S.string,
  name: S.string,
  active: S.boolean,
  tags: S.array(S.string),
});`,
    purpose: "a Sarcastic runtime type draft",
    review:
      "Verify generated validators against the Sarcastic version used by the project.",
    error:
      "Unsupported or ambiguous values require manual runtime type definitions."
  },
  "io-ts": {
    example: `const Product = t.type({
  id: t.string,
  name: t.string,
  active: t.boolean,
  tags: t.array(t.string),
});`,
    purpose: "an io-ts runtime codec",
    review:
      "Add partial fields, unions, branded types, and decoder error handling manually.",
    error:
      "A single sample cannot distinguish required from optional properties."
  },
  "rust-serde": {
    example: `#[derive(Serialize, Deserialize)]
struct Product {
    id: String,
    name: String,
    active: bool,
    tags: Vec<String>,
}`,
    purpose: "Rust structs with Serde derives",
    review:
      "Review ownership, numeric widths, Option fields, and serde rename attributes.",
    error: "Nulls or mixed arrays need explicit Rust enum or Option modeling."
  },
  mongoose: {
    example: `const ProductSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  active: Boolean,
  tags: [String],
});`,
    purpose: "a Mongoose schema draft",
    review:
      "Add indexes, validation rules, defaults, timestamps, and references manually.",
    error: "JSON values cannot reveal database constraints or relationships."
  },
  "big-query": {
    example: `[
  { "name": "id", "type": "STRING", "mode": "REQUIRED" },
  { "name": "active", "type": "BOOLEAN", "mode": "REQUIRED" },
  { "name": "tags", "type": "STRING", "mode": "REPEATED" }
]`,
    purpose: "a BigQuery table schema draft",
    review:
      "Choose modes, nested RECORD fields, partitioning, and clustering from real queries.",
    error:
      "Null-only fields and mixed arrays do not provide enough information for stable types."
  },
  mysql: {
    example: `CREATE TABLE products (
  id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN NOT NULL,
  tags JSON NOT NULL
);`,
    purpose: "a MySQL CREATE TABLE starting point",
    review:
      "Select lengths, keys, indexes, normalization, charset, and nullability manually.",
    error:
      "Sample JSON cannot determine relational constraints or storage strategy."
  },
  "scala-case-class": {
    example: `case class Product(
  id: String,
  name: String,
  active: Boolean,
  tags: Seq[String]
)`,
    purpose: "a Scala case class",
    review:
      "Review Option fields, numeric types, collection choices, and codec requirements.",
    error: "Nulls and mixed arrays may require explicit Scala ADTs."
  },
  go: {
    example: `type Product struct {
    ID     string   \`json:"id"\`
    Name   string   \`json:"name"\`
    Active bool     \`json:"active"\`
    Tags   []string \`json:"tags"\`
}`,
    purpose: "a Go struct with serialization tags",
    review:
      "Review exported names, pointer fields, numeric widths, and package conventions.",
    error:
      "Nulls and mixed arrays can require pointers, interfaces, or custom types."
  },
  "go-bson": {
    example: `type Product struct {
    ID     string   \`bson:"id" json:"id"\`
    Name   string   \`bson:"name" json:"name"\`
    Active bool     \`bson:"active" json:"active"\`
    Tags   []string \`bson:"tags" json:"tags"\`
}`,
    purpose: "a Go struct with BSON and JSON tags",
    review:
      "Check MongoDB identifiers, omitempty rules, pointer fields, and custom BSON types.",
    error: "JSON examples do not reveal ObjectID or date fields reliably."
  },
  yaml: {
    example: `id: prod_42
name: Developer Toolkit
active: true
tags:
  - conversion
  - schema`,
    purpose: "readable YAML data",
    review:
      "Check scalar quoting, aliases, comments, and target parser behavior.",
    error:
      "Keys or values that look like dates and booleans may need explicit quoting."
  },
  jsdoc: {
    example: `/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {boolean} active
 * @property {string[]} tags
 */`,
    purpose: "a JSDoc typedef",
    review:
      "Add optional markers, descriptions, unions, and project-specific naming.",
    error: "Incomplete samples cannot identify optional or nullable properties."
  },
  kotlin: {
    example: `data class Product(
  val id: String,
  val name: String,
  val active: Boolean,
  val tags: List<String>
)`,
    purpose: "a Kotlin data class",
    review:
      "Review nullable types, defaults, serializer annotations, and numeric widths.",
    error: "Nulls or mixed arrays need explicit Kotlin type decisions."
  },
  java: {
    example: `public class Product {
  private String id;
  private String name;
  private boolean active;
  private List<String> tags;
}`,
    purpose: "a Java model class draft",
    review:
      "Add constructors, accessors, nullability, serialization annotations, and packages.",
    error:
      "JSON or GraphQL input cannot determine framework annotations automatically."
  },
  "json-schema": {
    example: `{
  "type": "object",
  "required": ["id", "name"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" }
  }
}`,
    purpose: "a JSON Schema object definition",
    review:
      "Choose the schema draft and add formats, constraints, descriptions, and references.",
    error: "Source types and samples may not encode every runtime constraint."
  },
  toml: {
    example: `id = "prod_42"
name = "Developer Toolkit"
active = true
tags = ["conversion", "schema"]`,
    purpose: "TOML key-value data",
    review:
      "Check table layout, date handling, comments, and application-specific conventions.",
    error:
      "Nested arrays or null-like values may not have a direct TOML representation."
  },
  zod: {
    example: `export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  tags: z.array(z.string()),
});`,
    purpose: "a Zod runtime validation schema",
    review:
      "Add optional, nullable, coercion, refinement, and transform rules manually.",
    error:
      "Static types and one sample cannot reveal every runtime validation rule."
  },
  protobuf: {
    example: `message Product {
  string id = 1;
  string name = 2;
  repeated string tags = 3;
}`,
    purpose: "a Protocol Buffers message draft",
    review:
      "Preserve field numbers and choose enums, oneofs, and package options deliberately.",
    error:
      "JSON Schema unions and validation keywords may not map directly to Protobuf."
  },
  "openapi-schema": {
    example: `type: object
required: [id]
properties:
  id:
    type: string`,
    purpose: "an OpenAPI-compatible schema object",
    review:
      "Review OpenAPI version compatibility, nullable behavior, examples, and references.",
    error:
      "Some JSON Schema keywords are unsupported or behave differently in OpenAPI."
  },
  js: {
    example: `const styles = {
  display: "grid",
  gap: "1rem",
  borderRadius: "0.75rem"
};`,
    purpose: "a JavaScript style object",
    review:
      "Review units, vendor prefixes, custom properties, and unsupported selectors.",
    error: "Nested rules and at-rules do not fit a flat inline-style object."
  },
  tailwind: {
    example: `<div className="grid gap-4 rounded-xl">...</div>`,
    purpose: "a Tailwind utility-class draft",
    review:
      "Check theme tokens, arbitrary values, responsive variants, and state variants.",
    error:
      "Not every CSS declaration has an exact utility in the configured Tailwind theme."
  },
  json: {
    example: `{
  "service": {
    "name": "folioify",
    "enabled": true,
    "ports": [3000, 3001]
  }
}`,
    purpose: "strict JSON data",
    review:
      "Review type coercion, comments removed during conversion, and key ordering.",
    error:
      "Source values without a JSON equivalent require manual representation."
  },
  "resolvers-signature": {
    example: `export type QueryResolvers = {
  product: (_parent: unknown, args: { id: string }, context: Context) => Product;
};`,
    purpose: "typed resolver signatures",
    review:
      "Match context, parent, scalar, and generated-type settings to the server project.",
    error:
      "Missing schema types or incompatible codegen settings prevent complete signatures."
  },
  "introspection-json": {
    example: `{
  "__schema": {
    "queryType": { "name": "Query" },
    "types": []
  }
}`,
    purpose: "GraphQL introspection JSON",
    review:
      "Validate the document with the client, documentation, or tooling that will consume it.",
    error:
      "Invalid or incomplete SDL cannot produce a valid introspection result."
  },
  "schema-ast": {
    example: `type Product {
  id: ID!
  name: String!
}

type Query {
  product(id: ID!): Product
}`,
    purpose: "normalized GraphQL SDL",
    review:
      "Review directive order, comments, descriptions, and formatting before replacing source files.",
    error:
      "Schema validation errors must be fixed before a normalized AST can be printed."
  },
  "fragment-matcher": {
    example: `{
  "possibleTypes": {
    "SearchResult": ["Product", "Article"]
  }
}`,
    purpose: "fragment matcher possibleTypes data",
    review:
      "Regenerate when unions or interfaces change in the GraphQL schema.",
    error:
      "Schemas without valid unions or interfaces may produce empty matcher data."
  },
  components: {
    example: `export function ProductQuery() {
  return useQuery(PRODUCT_QUERY);
}`,
    purpose: "client component and operation bindings",
    review:
      "Choose the target GraphQL client and align imports, hooks, and operation documents.",
    error:
      "Schema-only input may require operations before useful components can be generated."
  },
  "typescript-mongodb": {
    example: `export interface ProductDbObject {
  _id: ObjectId;
  name: string;
  tags: string[];
}`,
    purpose: "TypeScript MongoDB model types",
    review:
      "Review ObjectId handling, collection naming, nullable fields, and database directives.",
    error:
      "GraphQL schema types alone do not define every MongoDB storage choice."
  },
  nquads: {
    example: `<https://folioify.com/app> <http://schema.org/name> "Folioify" .`,
    purpose: "RDF statements in N-Quads form",
    review:
      "Check base IRIs, blank nodes, graph names, and normalization requirements.",
    error: "Remote or invalid contexts can prevent JSON-LD expansion to RDF."
  },
  expanded: {
    example: `[{ "https://schema.org/name": [{ "@value": "Folioify" }] }]`,
    purpose: "expanded JSON-LD with full IRIs",
    review:
      "Inspect expanded properties before comparing or normalizing linked data.",
    error:
      "Undefined terms or inaccessible contexts can change expansion results."
  },
  compacted: {
    example: `{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Folioify"
}`,
    purpose: "compacted JSON-LD using the selected context",
    review:
      "Confirm the compacting context preserves the terms expected by consumers.",
    error: "Context collisions can rename or drop the intended compact terms."
  },
  flattened: {
    example: `{
  "@graph": [{ "@type": "SoftwareApplication", "name": "Folioify" }]
}`,
    purpose: "flattened JSON-LD node data",
    review:
      "Check generated node identifiers and graph structure before storage or comparison.",
    error: "Invalid node references or contexts can prevent flattening."
  },
  framed: {
    example: `{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Folioify"
}`,
    purpose: "JSON-LD arranged to match a frame",
    review:
      "Verify the frame includes the nodes and properties required by the application.",
    error:
      "A mismatched or invalid frame can return sparse or unexpected output."
  },
  normalized: {
    example: `<https://folioify.com/app> <http://schema.org/name> "Folioify" .`,
    purpose: "deterministic RDF dataset output",
    review:
      "Confirm the normalization algorithm required by the signing or comparison workflow.",
    error:
      "Invalid linked-data input or contexts can prevent RDF dataset normalization."
  },
  "typescript-declaration": {
    example: `export interface Product {
  id: string;
  name?: string;
  tags: string[];
}`,
    purpose: "a TypeScript declaration-file draft",
    review:
      "Review module boundaries, exports, ambient declarations, and dependency types.",
    error:
      "Runtime-only constructs and unresolved imports may not produce complete declarations."
  },
  javascript: {
    example: `export function label(product) {
  return product.name ?? product.id;
}`,
    purpose: "JavaScript with static type annotations removed",
    review:
      "Run the target project's formatter, linter, tests, and bundler after conversion.",
    error:
      "Type-system-only features may need runtime replacements or manual cleanup."
  },
  html: {
    example: `<h1>Release notes</h1>
<ul>
  <li>Added schema conversion</li>
  <li>Improved error messages</li>
</ul>`,
    purpose: "HTML markup rendered from the source document",
    review:
      "Sanitize untrusted output and check links, raw HTML, and renderer extensions.",
    error:
      "Unsupported source extensions may render differently from the target application."
  },
  "template-literal": {
    example:
      "const cardStyles = `background-color: white; border-radius: 12px;`;",
    purpose: "a CSS template literal",
    review:
      "Check units, nested selectors, interpolation, and the target CSS-in-JS library's syntax.",
    error:
      "Computed JavaScript values and unsupported nested rules require manual interpolation."
  },
  "live-preview": {
    example: `Rendered result: a card headed “Build status” followed by “All checks passed.”`,
    purpose: "a sandboxed visual preview of the HTML snippet",
    review:
      "Test responsive layout, external assets, forms, and scripts in the target environment.",
    error:
      "Blocked scripts, CSP rules, or missing external assets can change the preview."
  }
};

function getProfileKeys(path: string): {
  sourceKey: string;
  targetKey: string;
} {
  const slug = path.replace(/^\/tools\//, "");

  if (slug === "html-viewer") {
    return { sourceKey: "html", targetKey: "live-preview" };
  }
  if (slug === "toml-formatter") {
    return { sourceKey: "toml", targetKey: "toml" };
  }
  if (slug === "object-styles-to-template-literal") {
    return { sourceKey: "object-styles", targetKey: "template-literal" };
  }

  const [sourceKey, targetKey] = slug.split("-to-");
  return { sourceKey, targetKey };
}

export function hasGeneratedContentProfile(path: string): boolean {
  const { sourceKey, targetKey } = getProfileKeys(path);
  return Boolean(SOURCE_PROFILES[sourceKey] && TARGET_PROFILES[targetKey]);
}

export function buildProfiledToolContent(
  path: string,
  tool: ToolDescriptor
): ToolPageContent | undefined {
  const { sourceKey, targetKey } = getProfileKeys(path);
  const source = SOURCE_PROFILES[sourceKey];
  const target = TARGET_PROFILES[targetKey];
  if (!source || !target) return undefined;

  const processing = getToolProcessingDetails(path);
  const processingNote =
    processing.mode === "browser"
      ? "The transformation runs in your browser; analytics may still receive technical interaction data."
      : "The transformation input is sent to Folioify for processing and returned as output; do not submit secrets or proprietary code.";
  const action =
    tool.kind === "viewer"
      ? `render ${tool.source} as ${target.purpose}`
      : `convert ${tool.source} into ${target.purpose}`;
  const useCaseVerb = tool.kind === "viewer" ? "Preview" : "Convert";

  return {
    metaTitle: `${tool.label} Online | Free Developer Tool | Folioify`,
    metaDescription: `Use ${tool.label} to ${action}. See a real input/output example, common errors, processing details, and output limitations.`,
    keywords: [
      tool.label,
      `${tool.label} online`,
      `${tool.source} converter`,
      `${tool.target} generator`,
      "developer tool"
    ],
    lastModified: CONTENT_REVIEW_DATE,
    summary: `${tool.label} turns ${source.subject} into ${target.purpose}. ${processingNote}`,
    whatIs: `${tool.label} is a focused developer utility that helps you ${action}. It is useful when you need a reviewable result without setting up a local conversion project.`,
    capabilities: [
      `Parse ${tool.source} input such as ${source.subject}.`,
      `Generate ${target.purpose} in the output editor.`,
      `Show whether processing is browser-based or server-backed before you use the tool.`,
      `Keep the generated result available for review and copying.`
    ],
    howItWorks: [
      `Paste valid ${tool.source} input into the source editor.`,
      `The tool parses the input and generates ${target.purpose}.`,
      `Review the result before use. ${target.review}`
    ],
    useCases: [
      `${useCaseVerb} ${source.subject} while evaluating a ${tool.target} workflow.`,
      `Create ${target.purpose} for a code review or technical prototype.`,
      `Compare the generated ${tool.target} structure with an existing project model.`,
      `Document how a representative ${tool.source} sample maps to ${tool.target}.`
    ],
    inputExample: source.example,
    outputExample: target.example,
    options: [
      `Input coverage: include representative ${tool.source} structures and edge cases.`,
      `Output review: ${target.review}`,
      `Data handling: ${processing.description}`
    ],
    commonErrors: [source.parseError, target.error],
    limitations: [
      source.caveat,
      target.review,
      "Generated output is a starting point and should be compiled, validated, or tested in the target project."
    ],
    workspaceInstruction: `Paste ${tool.source} below. Review the generated ${tool.target} and the documented limitations before copying it.`,
    dataSourceNote: `${processingNote} The examples describe representative output; project-specific results depend on the input and converter library.`,
    faqs: [
      {
        question: `What does ${tool.label} generate?`,
        answer: `It generates ${target.purpose} from ${tool.source} input. The example on this page shows the expected structure.`
      },
      {
        question: `How is ${tool.source} input processed?`,
        answer: processing.description
      },
      {
        question: `What should I check before using the ${tool.target} output?`,
        answer: target.review
      }
    ]
  };
}
