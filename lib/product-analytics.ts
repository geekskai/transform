import Clarity from "@microsoft/clarity";

export const PRODUCT_EVENTS = [
  "tool_conversion_started",
  "tool_conversion_completed",
  "tool_conversion_failed",
  "tool_result_copied",
  "tool_file_loaded"
] as const;

export type ProductEventName = (typeof PRODUCT_EVENTS)[number];

function getToolFamily(pathname: string): string {
  const slug = pathname.replace(/^\/tools\//, "");
  if (slug.includes("json") || slug === "js-object-to-zod") return "json";
  if (slug.includes("jsx") || slug.includes("react")) return "jsx";
  if (slug.includes("toml")) return "toml";
  return "other";
}

export function setProductAnalyticsContext(pathname: string): void {
  if (typeof window === "undefined" || !window.__clarityInitialized) return;

  const safePath = (pathname || "/").split(/[?#]/)[0];
  Clarity.setTag("page_path", safePath);
  Clarity.setTag(
    "tool_family",
    safePath.startsWith("/tools/") ? getToolFamily(safePath) : "none"
  );
}

export function trackProductEvent(eventName: ProductEventName): void {
  if (typeof window === "undefined" || !window.__clarityInitialized) return;
  Clarity.event(eventName);
}
