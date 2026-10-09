export function isToolPageIndexable(
  path: string,
  explicitlyNoindex = false
): boolean {
  return path.startsWith("/tools/") && !explicitlyNoindex;
}

export function shouldNoindexToolPage(
  _path: string,
  explicitlyNoindex = false
): boolean {
  return explicitlyNoindex;
}

export function filterIndexableToolRoutes<
  T extends { path?: string; noindex?: boolean }
>(routes: T[]): T[] {
  return routes.filter(
    route =>
      Boolean(route.path) &&
      route.path !== "/" &&
      isToolPageIndexable(route.path as string, route.noindex)
  );
}
