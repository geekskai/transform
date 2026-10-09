/**
 * Explicit quality-reviewed tool inventory.
 *
 * A tool is added only after it has useful examples, accurate processing
 * disclosures, route-specific guidance, and a working canonical. Sitemap,
 * llms.txt, and page metadata all read this same inventory.
 */
export const INDEXABLE_TOOL_PATHS = [
  "/tools/svg-to-jsx",
  "/tools/svg-to-react-native",
  "/tools/html-to-jsx",
  "/tools/html-to-pug",
  "/tools/html-viewer",
  "/tools/json-to-proptypes",
  "/tools/json-to-flow",
  "/tools/json-to-graphql",
  "/tools/json-to-typescript",
  "/tools/json-to-mobx-state-tree",
  "/tools/json-to-sarcastic",
  "/tools/json-to-io-ts",
  "/tools/json-to-rust-serde",
  "/tools/json-to-mongoose",
  "/tools/json-to-big-query",
  "/tools/json-to-mysql",
  "/tools/json-to-scala-case-class",
  "/tools/json-to-go",
  "/tools/json-to-go-bson",
  "/tools/json-to-yaml",
  "/tools/json-to-jsdoc",
  "/tools/json-to-kotlin",
  "/tools/json-to-java",
  "/tools/json-to-json-schema",
  "/tools/json-to-toml",
  "/tools/json-to-zod",
  "/tools/json-schema-to-typescript",
  "/tools/json-schema-to-openapi-schema",
  "/tools/json-schema-to-protobuf",
  "/tools/json-schema-to-zod",
  "/tools/css-to-js",
  "/tools/object-styles-to-template-literal",
  "/tools/css-to-tailwind",
  "/tools/js-object-to-json",
  "/tools/js-object-to-typescript",
  "/tools/js-object-to-zod",
  "/tools/graphql-to-typescript",
  "/tools/graphql-to-flow",
  "/tools/graphql-to-java",
  "/tools/graphql-to-resolvers-signature",
  "/tools/graphql-to-introspection-json",
  "/tools/graphql-to-schema-ast",
  "/tools/graphql-to-fragment-matcher",
  "/tools/graphql-to-components",
  "/tools/graphql-to-typescript-mongodb",
  "/tools/jsonld-to-nquads",
  "/tools/jsonld-to-expanded",
  "/tools/jsonld-to-compacted",
  "/tools/jsonld-to-flattened",
  "/tools/jsonld-to-framed",
  "/tools/jsonld-to-normalized",
  "/tools/typescript-to-flow",
  "/tools/typescript-to-typescript-declaration",
  "/tools/typescript-to-json-schema",
  "/tools/typescript-to-javascript",
  "/tools/typescript-to-zod",
  "/tools/flow-to-typescript",
  "/tools/flow-to-typescript-declaration",
  "/tools/flow-to-javascript",
  "/tools/jsx-viewer",
  "/tools/xml-to-html",
  "/tools/xml-to-json",
  "/tools/yaml-to-json",
  "/tools/yaml-to-toml",
  "/tools/markdown-to-html",
  "/tools/markdown-to-jsx",
  "/tools/check-toml",
  "/tools/toml-formatter",
  "/tools/toml-to-json",
  "/tools/toml-to-yaml",
  "/tools/cadence-to-go"
] as const;

const INDEXABLE_TOOL_PATH_SET = new Set<string>(INDEXABLE_TOOL_PATHS);

export function isToolPageIndexable(path: string): boolean {
  return INDEXABLE_TOOL_PATH_SET.has(path);
}

export function filterIndexableToolRoutes<T extends { path?: string }>(
  routes: T[]
): T[] {
  return routes.filter(
    route => Boolean(route.path) && isToolPageIndexable(route.path as string)
  );
}
