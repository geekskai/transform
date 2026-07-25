export type ToolProcessingMode = "browser" | "server";

export type ToolProcessingDetails = {
  mode: ToolProcessingMode;
  badgeLabel: string;
  dataHandlingLabel: string;
  description: string;
};

const SERVER_BACKED_TOOL_PATHS = new Set([
  "/tools/flow-to-javascript",
  "/tools/flow-to-typescript",
  "/tools/flow-to-typescript-declaration",
  "/tools/html-to-pug",
  "/tools/json-schema-to-openapi-schema",
  "/tools/typescript-to-flow",
  "/tools/typescript-to-javascript",
  "/tools/typescript-to-json-schema",
  "/tools/typescript-to-typescript-declaration",
  "/tools/typescript-to-zod"
]);

const BROWSER_PROCESSING: ToolProcessingDetails = {
  mode: "browser",
  badgeLabel: "Browser processing",
  dataHandlingLabel: "Processed in your browser",
  description:
    "Transformation input is processed in your browser. Analytics and diagnostics may still receive interaction or technical data, so avoid sensitive content."
};

const SERVER_PROCESSING: ToolProcessingDetails = {
  mode: "server",
  badgeLabel: "Server-backed",
  dataHandlingLabel: "Sent for conversion",
  description:
    "Transformation input is sent to Folioify for server-backed processing and returned as output. It is not offered as cloud storage; avoid secrets, personal data, and proprietary source code."
};

export function getToolProcessingDetails(path: string): ToolProcessingDetails {
  return SERVER_BACKED_TOOL_PATHS.has(path)
    ? SERVER_PROCESSING
    : BROWSER_PROCESSING;
}
