export const CURATED_TOOL_PATHS = [
  "/tools/check-toml",
  "/tools/css-to-js",
  "/tools/flow-to-typescript",
  "/tools/graphql-to-introspection-json",
  "/tools/html-to-jsx",
  "/tools/html-to-pug",
  "/tools/js-object-to-json",
  "/tools/js-object-to-typescript",
  "/tools/js-object-to-zod",
  "/tools/json-to-big-query",
  "/tools/json-to-flow",
  "/tools/json-to-go",
  "/tools/json-to-typescript",
  "/tools/jsx-viewer",
  "/tools/markdown-to-jsx",
  "/tools/svg-to-jsx",
  "/tools/svg-to-react-native",
  "/tools/toml-formatter",
  "/tools/typescript-to-javascript",
  "/tools/xml-to-html",
  "/tools/xml-to-json"
] as const;

const CURATED_TOOL_PATH_SET = new Set<string>(CURATED_TOOL_PATHS);

export function isToolPageIndexable(path: string): boolean {
  return CURATED_TOOL_PATH_SET.has(path);
}

export function shouldNoindexToolPage(
  path: string,
  explicitlyNoindex = false
): boolean {
  return explicitlyNoindex || !isToolPageIndexable(path);
}

export function filterIndexableToolRoutes<T extends { path?: string }>(
  routes: T[]
): T[] {
  return routes.filter(
    route =>
      Boolean(route.path) &&
      route.path !== "/" &&
      isToolPageIndexable(route.path as string)
  );
}
