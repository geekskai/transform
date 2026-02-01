/**
 * 动态 robots.txt（GEO §17：允许主流搜索引擎与 AI 爬虫）
 * 通过 next.config.js rewrites: /robots.txt -> /api/robots
 * @see docs/SEO-METADATA-DESIGN.md §4.8
 */

import { NextApiRequest, NextApiResponse } from "next";
import { SITE_CONFIG } from "../../lib/seo";

const BASE = (SITE_CONFIG.baseUrl || "").replace(/\/$/, "");

function buildRobotsTxt(): string {
  const lines: string[] = [
    "User-agent: *",
    "Allow: /",
    "",
    "# AI / LLM crawlers (GEO §17)",
    "User-agent: GPTBot",
    "Allow: /",
    "",
    "User-agent: Google-Extended",
    "Allow: /",
    "",
    "User-agent: Claude-Web",
    "Allow: /",
    "",
    "User-agent: PerplexityBot",
    "Allow: /",
    "",
    `Sitemap: ${BASE}/sitemap.xml`
  ];
  return lines.join("\n");
}

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse
): void {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
  res.send(buildRobotsTxt());
}
