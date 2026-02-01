/**
 * 动态 sitemap.xml（基于 utils/routes 生成所有工具页 + 首页）
 * 通过 next.config.js rewrites: /sitemap.xml -> /api/sitemap
 * @see docs/SEO-METADATA-DESIGN.md
 */

import { NextApiRequest, NextApiResponse } from "next";
import { SITE_CONFIG } from "../../lib/seo";
import { routes } from "@utils/routes";

const BASE = (SITE_CONFIG.baseUrl || "").replace(/\/$/, "");

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemapXml(): string {
  const urls: string[] = [BASE + "/"];
  routes.forEach(r => {
    if (r.path && r.path !== "/") urls.push(BASE + r.path);
  });

  const urlEntries = urls
    .map(
      loc =>
        `  <url>\n    <loc>${escapeXml(
          loc
        )}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${
          loc === BASE + "/" ? "1.0" : "0.8"
        }</priority>\n  </url>`
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    "</urlset>"
  ].join("\n");
}

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse
): void {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
  res.send(buildSitemapXml());
}
