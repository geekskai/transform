/**
 * 动态 llms.txt（LLM 可读站点说明，便于 AI 抓取与理解）
 * 规范：https://llmstxt.org/ — H1 + blockquote 摘要 + 文件列表（[name](url): 说明）
 * 通过 next.config.js rewrites: /llms.txt -> /api/llms
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { SITE_CONFIG } from "../../lib/seo";
import { getToolPageContent } from "../../lib/tool-page-content";
import { isToolPageIndexable } from "../../lib/tool-indexing";
import { truncateAtWord } from "../../lib/text";
import { routes } from "@utils/routes";

const BASE = (SITE_CONFIG.baseUrl || "").replace(/\/$/, "");

function buildLlmsTxt(): string {
  const lines: string[] = [
    `# ${SITE_CONFIG.name}`,
    "",
    `> Free online developer tools for converting SVG, JSON, TypeScript, HTML, GraphQL, YAML, and more. No signup; each tool identifies browser-based or server-backed processing. By ${SITE_CONFIG.brand}.`,
    "",
    "This site provides developer tools that use browser or server-backed processing. Each tool page explains how its input is handled.",
    "",
    "## Tools",
    ""
  ];

  routes.forEach(r => {
    if (!r.path || r.path === "/" || !isToolPageIndexable(r.path)) return;
    const url = BASE + r.path;
    const name = r.searchTerm || r.label || r.path;
    const pageContent = getToolPageContent(r.path);
    const note = truncateAtWord(
      (
        pageContent?.metaDescription ||
        pageContent?.summary ||
        r.desc ||
        ""
      ).replace(/\n/g, " "),
      140
    );
    lines.push(`- [${name}](${url})${note ? `: ${note}` : ""}`);
  });

  lines.push("");
  lines.push("## Optional");
  lines.push("");
  lines.push(
    `- [Sitemap](${BASE}/sitemap.xml): List of all tool pages for indexing`
  );
  lines.push(`- [Home](${BASE}/): Landing page`);
  lines.push(
    `- [About](${BASE}/about): Ownership, maintenance, and open-source attribution`
  );
  lines.push(
    `- [Privacy](${BASE}/privacy): Data handling and vendor disclosures`
  );

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
