import { NextApiRequest, NextApiResponse } from "next";
import { getAllPosts } from "../../lib/blog";
import { getCategorySlug, SITE_CONFIG } from "../../lib/seo";
import { categorizedRoutes, routes } from "@utils/routes";

const BASE = (SITE_CONFIG.baseUrl || "").replace(/\/$/, "");

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: string;
};

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getLatestDate(dates: Array<string | undefined>): string | undefined {
  return dates.filter(Boolean).sort().pop();
}

function buildSitemapXml(): string {
  const posts = getAllPosts(["slug", "date", "lastmod"]) as Array<{
    slug: string;
    date?: string;
    lastmod?: string;
  }>;

  const latestToolDate = getLatestDate(routes.map(route => route.lastModified));
  const latestPostDate = getLatestDate(
    posts.map(post => post.lastmod || post.date)
  );
  const homeLastmod = getLatestDate([latestToolDate, latestPostDate]);

  const entries: SitemapEntry[] = [
    {
      loc: BASE + "/",
      lastmod: homeLastmod,
      changefreq: "weekly",
      priority: "1.0"
    },
    {
      loc: BASE + "/blog",
      lastmod: latestPostDate,
      changefreq: "weekly",
      priority: "0.7"
    },
    ...categorizedRoutes.map(category => {
      const categoryTools = routes.filter(
        route => route.category === category.category
      );

      return {
        loc: `${BASE}/tools/${getCategorySlug(category.category)}`,
        lastmod: getLatestDate(categoryTools.map(tool => tool.lastModified)),
        changefreq: "weekly" as const,
        priority: "0.7"
      };
    }),
    ...routes
      .filter(route => route.path && route.path !== "/")
      .map(route => ({
        loc: BASE + route.path,
        lastmod: route.lastModified,
        changefreq: "weekly" as const,
        priority: "0.8"
      })),
    ...posts.map(post => ({
      loc: `${BASE}/blog/${post.slug}`,
      lastmod: post.lastmod || post.date,
      changefreq: "monthly" as const,
      priority: "0.6"
    }))
  ];

  const urlEntries = entries
    .map(entry =>
      [
        "  <url>",
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        entry.lastmod
          ? `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`
          : "",
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        "  </url>"
      ]
        .filter(Boolean)
        .join("\n")
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
