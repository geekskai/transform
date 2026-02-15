import React from "react";
import Link from "next/link";
import { SITE_CONFIG } from "../lib/seo";

const popularTools = [
  { label: "SVG to JSX", href: "/tools/svg-to-jsx" },
  { label: "JSON to TypeScript", href: "/tools/json-to-typescript" },
  { label: "CSS to Tailwind", href: "/tools/css-to-tailwind" },
  { label: "Markdown to HTML", href: "/tools/markdown-to-html" }
];

const resources = [
  { label: "Sitemap", href: "/sitemap.xml" },
  { label: "LLMS", href: "/llms.txt" },
  { label: "Robots", href: "/robots.txt" },
  { label: "GitHub", href: "https://github.com/geekskai/transform" }
];

const socials = [
  { label: "GitHub", href: "https://github.com/geekskai" },
  { label: "Twitter", href: "https://twitter.com/geekskai" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" }
];

export default function SiteFooter() {
  return (
    <footer className="relative border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl py-10 px-4 sm:px-6">
        <div className="grid gap-2 md:gap-6 lg:gap-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img
                src="/static/favicon.svg"
                alt=""
                width={24}
                height={24}
                className="h-6 w-6"
                aria-hidden
              />
              <span className="text-base font-semibold text-gray-900">
                {SITE_CONFIG.name}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Empowering developers with fast, free, and privacy-first tools.
              Built for clean conversions and reliable results.
            </p>
            <p className="mt-3 inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              100% Free Forever ✅
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Popular Tools 🔥
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {popularTools.map(tool => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="transition-colors hover:text-brand-700"
                  >
                    {tool.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/#tools"
                  className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
                >
                  View all tools →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Resources 📚
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {resources.map(resource => (
                <li key={resource.href}>
                  <a
                    href={resource.href}
                    className="transition-colors hover:text-brand-700"
                    target={
                      resource.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      resource.href.startsWith("http")
                        ? "noreferrer"
                        : undefined
                    }
                  >
                    {resource.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Connect 🤝
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>
                <a
                  href="mailto:hello@folioify.com"
                  className="transition-colors hover:text-brand-700"
                >
                  hello@folioify.com
                </a>
              </li>
              {socials.map(social => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    className="transition-colors hover:text-brand-700"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights
            reserved.
          </span>
          <span className="inline-flex items-center gap-2">
            Status: All systems operational 🟢
          </span>
        </div>
      </div>
    </footer>
  );
}
