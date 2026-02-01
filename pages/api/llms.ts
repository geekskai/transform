/**
 * 动态 llms.txt（LLM 可读站点说明，便于 AI 抓取与理解）
 * 规范：https://llmstxt.org/ — H1 + blockquote 摘要 + 文件列表（[name](url): 说明）
 * 通过 next.config.js rewrites: /llms.txt -> /api/llms
 */

import { NextApiRequest, NextApiResponse } from "next";
import { SITE_CONFIG } from "../../lib/seo";
import { routes } from "@utils/routes";

const BASE = (SITE_CONFIG.baseUrl || "").replace(/\/$/, "");

function buildLlmsTxt(): string {
  const lines: string[] = [
    `# ${SITE_CONFIG.name}`,
    "",
    `> A polyglot web converter that's going to save you a lot of time. Free to use, no signup. By ${SITE_CONFIG.brand}.`,
    "",
    "This site provides in-browser tools to convert between formats (JSON, TypeScript, GraphQL, HTML, SVG, YAML, etc.). Each tool runs locally; no data is sent to servers.",
    "",
    "## Tools",
    ""
  ];

  routes.forEach(r => {
    if (!r.path || r.path === "/") return;
    const url = BASE + r.path;
    const name = r.searchTerm || r.label || r.path;
    const note = r.desc ? r.desc.replace(/\n/g, " ").slice(0, 120) : "";
    lines.push(`- [${name}](${url})${note ? `: ${note}` : ""}`);
  });

  lines.push("");
  lines.push("## Optional");
  lines.push("");
  lines.push(
    `- [Sitemap](${BASE}/sitemap.xml): List of all tool pages for indexing`
  );
  lines.push(`- [Home](${BASE}/): Landing page`);

  return lines.join("\n");
}

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse
): void {
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
  res.send(buildLlmsTxt());
}
