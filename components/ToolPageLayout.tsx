/**
 * SEO-friendly layout wrapper for tool pages.
 * Based on geekskai.com reference design - adapted to light theme.
 * Provides: breadcrumb, hero section, Core Info card, feature badges.
 * @see docs/SEO-METADATA-DESIGN.md
 */
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { activeRouteData, routes } from "@utils/routes";

// Icons for feature badges (inline SVG for performance)
const LightningIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ToolIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export default function ToolPageLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const route = activeRouteData(router.pathname || "");

  if (!route) {
    return <>{children}</>;
  }

  const searchTerm = route.searchTerm || route.label;
  const description = route.desc || "";
  // const lastModified = route.lastModified;
  const relatedTools = routes
    .filter(
      tool => tool.category === route.category && tool.path !== route.path
    )
    .slice(0, 6);

  return (
    <>
      {/* Breadcrumb Navigation */}
      <nav
        className="flex w-full mx-auto max-w-7xl flex-wrap items-center gap-1 px-4 py-3 text-xs text-gray-500 sm:gap-2 sm:px-6 sm:py-4 sm:text-sm lg:px-8"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="text-gray-600 no-underline hover:text-brand-600"
        >
          <span aria-hidden="true">🏠</span> Home
        </Link>
        <span aria-hidden="true" className="text-gray-400">
          &gt;
        </span>
        <span>Tools</span>
        <span aria-hidden="true" className="text-gray-400">
          &gt;
        </span>
        <span className="font-medium text-gray-900" aria-current="page">
          {searchTerm}
        </span>
      </nav>
      <article
        className="min-h-screen flex-col flex gap-1 md:gap-2 lg:gap-4"
        role="main"
      >
        {/* Hero */}
        <header className="bg-gradient-to-b from-brand-50 to-gray-50 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-400 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/25 sm:mb-4 sm:px-4 sm:py-2 sm:text-sm">
              <ToolIcon />
              Free {searchTerm} Tool
            </span>

            <h1 className="mb-3 bg-gradient-to-r from-brand-700 via-brand-500 to-brand-700 bg-clip-text text-2xl font-bold leading-tight text-transparent sm:text-3xl md:mb-4 md:text-4xl lg:text-5xl">
              {searchTerm} Tool (2026) ✨
            </h1>

            <p className="mx-auto mb-5 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base md:mb-6 md:text-lg">
              {description}
            </p>
          </div>
        </header>

        {/* Feature Highlights */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 sm:px-4 sm:py-2 sm:text-sm">
              <span className="h-4 w-4 text-brand-500">
                <LightningIcon />
              </span>
              <span className="font-semibold text-brand-700">Fast</span>
              <span>- convert in seconds</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 sm:px-4 sm:py-2 sm:text-sm">
              <span className="h-4 w-4 text-brand-500">
                <ShieldIcon />
              </span>
              <span className="font-semibold text-brand-700">Private</span>
              <span>- local processing</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 sm:px-4 sm:py-2 sm:text-sm">
              <span className="h-4 w-4 text-brand-500">
                <CheckIcon />
              </span>
              <span className="font-semibold text-brand-700">No Signup</span>
              <span>- free forever</span>
            </div>
          </div>
        </section>
        {/* Tool Workspace */}
        <section
          id="tool-workspace"
          className="px-4 sm:px-6 lg:px-8"
          aria-label={`${searchTerm} tool workspace`}
        >
          <div className="mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">
              {searchTerm} Tool 🧰
            </h2>
            <p className="mb-3 text-sm text-gray-600 sm:mb-4 sm:text-base">
              Paste your input below and the output will update automatically.
            </p>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              {children}
            </div>
          </div>
        </section>
        {/* TL;DR */}
        <div className="mx-auto max-w-7xl rounded-2xl border border-brand-200 bg-white p-4 text-left shadow-lg shadow-brand-500/10 sm:p-6 md:p-8">
          <h2 className="mb-2 text-lg font-semibold text-gray-900 sm:mb-3 sm:text-xl">
            TL;DR ⚡
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
            The <strong>{searchTerm}</strong> tool is a
            <strong> free, browser-based converter</strong> that runs locally in
            your device for privacy. It is designed for developers and creators
            who need <strong>fast, accurate transformations</strong> without
            signups or uploads. Use it to convert formats instantly, verify
            output in real time, and export clean results in seconds. This page
            explains what the tool does, what it cannot do, and how to use it
            effectively, with a visible update timestamp for freshness.
          </p>
        </div>

        {/* Core Information (Fact Chunk) */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">
              Core Information 📌
            </h2>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Pricing
                </p>
                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                  <strong>Free</strong> — no registration required.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Data Handling
                </p>
                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                  <strong>Client-side only</strong> — runs in your browser.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Output
                </p>
                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                  <strong>Instant conversion</strong> with clean results.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Target Users
                </p>
                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                  <strong>Developers</strong>, designers, and creators.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Is / What Can Do */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 sm:gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
              <h2 className="mb-2 text-lg font-semibold text-gray-900 sm:mb-3 sm:text-xl">
                What is {searchTerm}? 🧭
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                <strong>{searchTerm}</strong> is a focused online converter
                designed to transform inputs into accurate outputs with minimal
                steps. It runs entirely in your browser, which means no file
                uploads and no server-side processing.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
              <h2 className="mb-2 text-lg font-semibold text-gray-900 sm:mb-3 sm:text-xl">
                What can it do? ✅
              </h2>
              <ul className="space-y-2 text-sm text-gray-600 sm:text-base">
                <li>
                  <strong>Convert</strong> inputs into clean, structured output.
                </li>
                <li>
                  <strong>Preview</strong> results instantly before copying.
                </li>
                <li>
                  <strong>Export</strong> outputs in a developer-friendly
                  format.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 md:p-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">
              How {searchTerm} works (Step-by-Step) 🪄
            </h2>
            <ol className="space-y-3 text-sm text-gray-600 sm:text-base">
              <li>
                <strong>Step 1:</strong> Paste your input in the editor below.
              </li>
              <li>
                <strong>Step 2:</strong> Adjust any options if available.
              </li>
              <li>
                <strong>Step 3:</strong> Copy the output once it updates.
              </li>
            </ol>
          </div>
        </section>

        {/* Free vs Paid / Official vs Third-Party */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 sm:gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
              <h2 className="mb-2 text-lg font-semibold text-gray-900 sm:mb-3 sm:text-xl">
                Free vs Paid 💸
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                This tool is <strong>100% free</strong> with no usage limits or
                account required. You can use it for quick conversions without
                subscriptions or payments.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
              <h2 className="mb-2 text-lg font-semibold text-gray-900 sm:mb-3 sm:text-xl">
                Official vs Third-Party 🧪
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                Folioify provides this as a <strong>third-party utility</strong>
                . It does not replace official tools, but offers a fast,
                accessible alternative for everyday workflows.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 md:p-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">
              Use Cases 💡
            </h2>
            <ul className="grid gap-3 text-sm text-gray-600 sm:text-base md:grid-cols-2">
              <li>
                <strong>Development:</strong> Convert formats while coding or
                debugging.
              </li>
              <li>
                <strong>Documentation:</strong> Generate clean output for docs
                or examples.
              </li>
              <li>
                <strong>Prototyping:</strong> Validate data and structures
                quickly.
              </li>
              <li>
                <strong>Learning:</strong> Explore how conversions are
                structured.
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 md:p-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">
              Frequently Asked Questions ❓
            </h2>
            <div className="space-y-4 text-sm text-gray-600 sm:text-base">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Is {searchTerm} free to use?
                </h3>
                <p className="mt-1 leading-relaxed">
                  Yes. This tool is completely free with no signup or payment
                  required. You can use it as often as you need.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Does my data leave the browser?
                </h3>
                <p className="mt-1 leading-relaxed">
                  No. Processing happens locally in your browser. Your input is
                  not uploaded or stored on our servers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  What formats does it support?
                </h3>
                <p className="mt-1 leading-relaxed">
                  The tool supports the input and output formats described
                  above. If a format is not listed, it may not be supported yet.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Is the output production-ready?
                </h3>
                <p className="mt-1 leading-relaxed">
                  Output is designed to be clean and accurate, but always review
                  results before using in production.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Can I use {searchTerm} offline?
                </h3>
                <p className="mt-1 leading-relaxed">
                  Once the page is loaded, many conversions work without an
                  active connection, depending on the tool.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Are there usage limits?
                </h3>
                <p className="mt-1 leading-relaxed">
                  No usage limits are enforced. The tool is available for
                  unlimited conversions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Is this an official tool?
                </h3>
                <p className="mt-1 leading-relaxed">
                  This is a third-party utility by Folioify, built for speed and
                  accessibility. It is not affiliated with any official standard
                  body.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  How often is the tool updated?
                </h3>
                <p className="mt-1 leading-relaxed">
                  We maintain tools on a regular cadence. See the last updated
                  date below for freshness.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Sources & Disclaimer */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 md:p-8">
            <h2 className="mb-2 text-lg font-semibold text-gray-900 sm:mb-3 sm:text-xl">
              Data Sources & Disclaimer 📎
            </h2>
            <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
              This tool is provided for educational and productivity purposes.
              Output accuracy depends on input quality.{" "}
              {route.packageName && route.packageUrl ? (
                <>
                  It uses{" "}
                  <a
                    href={route.packageUrl}
                    className="text-brand-600 underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {route.packageName}
                  </a>{" "}
                  as a processing library.
                </>
              ) : (
                "It relies on well-known open-source libraries where applicable."
              )}
            </p>
          </div>
        </section>

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <section className="pb-4 md:pb-6 px-4 md:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 md:p-8">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">
                📌 Related Tools
              </h2>
              <div className="grid gap-3 text-sm text-gray-600 grid-cols-2 md:gap-4 sm:text-base md:grid-cols-4">
                {relatedTools.map(tool => (
                  <Link
                    key={tool.path}
                    href={tool.path}
                    className="rounded-lg border border-gray-100 bg-brand-100 px-3 py-2 text-gray-700 no-underline transition-colors hover:border-brand-200 hover:text-brand-700"
                  >
                    🔗 {tool.searchTerm}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
