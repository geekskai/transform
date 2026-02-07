/**
 * Stub for @types/glob (deprecated stub with no .d.ts in node_modules).
 */
declare module "glob" {
  function glob(
    pattern: string,
    options?: Record<string, unknown>,
    cb?: (err: Error | null, matches?: string[]) => void
  ): void;
  namespace glob {
    function sync(pattern: string, options?: Record<string, unknown>): string[];
  }
  export = glob;
}
