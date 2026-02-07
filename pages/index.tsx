import * as React from "react";
import { useState, useMemo } from "react";
import Link from "next/link";
import Head from "next/head";
import { categorizedRoutes, routes } from "@utils/routes";
import { GeoSection } from "@components/GeoSection";
import { FAQ, FAQItem } from "@components/FAQ";
import { SITE_CONFIG } from "../lib/seo";

// Icons for value propositions
const FreeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-7 w-7"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const PrivacyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-7 w-7"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const SpeedIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-7 w-7"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

// Tool category icon
const ToolCategoryIcon = ({ category }: { category: string }) => {
  const icons: Record<string, React.ReactNode> = {
    SVG: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    HTML: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    JSON: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
      >
        <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" />
        <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1" />
      </svg>
    ),
    CSS: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
      >
        <path d="M4 2l1.5 18L12 22l6.5-2L20 2z" />
      </svg>
    ),
    GraphQL: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
      >
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
        <line x1="12" y1="22" x2="12" y2="15.5" />
        <polyline points="22 8.5 12 15.5 2 8.5" />
      </svg>
    )
  };
  return (
    <span className="flex h-5 w-5 items-center justify-center text-brand-600">
      {icons[category] || icons.JSON}
    </span>
  );
};

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const lastUpdated = "2026-02-07";

  // Get all categories
  const categories = useMemo(() => {
    return ["All", ...categorizedRoutes.map(c => c.category)];
  }, []);

  // Filter tools based on category and search
  const filteredRoutes = useMemo(() => {
    let filtered = routes;

    if (activeCategory !== "All") {
      filtered = filtered.filter(r => r.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.searchTerm?.toLowerCase().includes(query) ||
          r.label?.toLowerCase().includes(query) ||
          r.desc?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeCategory, searchQuery]);

  const faqItems: FAQItem[] = [
    {
      question: "Are these tools really free?",
      answer:
        "Yes, all tools on Folioify are 100% free to use. There are no hidden fees, subscriptions, or limits on usage."
    },
    {
      question: "Is my code safe?",
      answer:
        "Absolutely. Folioify runs entirely in your browser. Your code and data never leave your device and are never sent to our servers."
    },
    {
      question: "Do I need to create an account?",
      answer:
        "No registration is required. You can start using any tool immediately without signing up."
    },
    {
      question: "Can I use these tools offline?",
      answer:
        "Since the tools run in your browser, many of them can function without an active internet connection once the page is loaded."
    },
    {
      question: "How accurate are the conversions?",
      answer:
        "We use industry-standard open-source libraries (like SVGR, Prettier, json-to-ts) to ensure high-quality and reliable conversions."
    },
    {
      question: "Can I contribute a new tool?",
      answer:
        "Yes! Folioify is open to contributions. Check out our GitHub repository to submit ideas or pull requests."
    },
    {
      question: "Does it support dark mode?",
      answer:
        "Currently, we offer a clean, high-contrast light theme optimized for readability and code clarity."
    },
    {
      question: "What browsers are supported?",
      answer:
        "We support all modern browsers including Chrome, Firefox, Safari, and Edge."
    }
  ];

  return (
    <>
      <Head>
        <title>
          Free Online Developer Tools (2026) | Converters, Formatters &
          Generators - Folioify
        </title>
        <meta
          name="description"
          content="The ultimate collection of free online developer tools. Convert SVG to JSX, JSON to TypeScript, HTML to Pug, and more. Secure client-side execution, no data uploads."
        />
        <meta
          name="keywords"
          content="developer tools, online converter, SVG to JSX, JSON to TypeScript, code converter, free tools, Folioify, secure conversions"
        />
        <link rel="canonical" href={SITE_CONFIG.baseUrl} />
        <meta name="last-modified" content={lastUpdated} />
        <meta
          property="og:title"
          content="Free Online Developer Tools (2026) | Folioify"
        />
        <meta
          property="og:description"
          content="Secure, fast, and free developer tools running entirely in your browser."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_CONFIG.baseUrl} />
        <meta property="og:site_name" content={SITE_CONFIG.name} />
        <meta
          property="og:image"
          content={`${SITE_CONFIG.baseUrl}${SITE_CONFIG.defaultOgImage}`}
        />
        <meta property="og:locale" content={SITE_CONFIG.locale} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
        <meta name="twitter:creator" content={SITE_CONFIG.twitterHandle} />
        <meta
          name="twitter:title"
          content="Free Online Developer Tools (2026) | Folioify"
        />
        <meta
          name="twitter:description"
          content="Secure, fast, and free developer tools running entirely in your browser."
        />
        <meta
          name="twitter:image"
          content={`${SITE_CONFIG.baseUrl}${SITE_CONFIG.defaultOgImage}`}
        />
      </Head>

      <article className="min-h-screen">
        {/* GEO: Core Facts Chunk for AI Extraction */}
        <section className="sr-only" aria-hidden="false">
          <h2>Core Facts About Folioify</h2>
          <ul>
            <li>
              <strong>Pricing</strong>: 100% Free, no hidden fees
            </li>
            <li>
              <strong>Data Handling</strong>: Client-side only, no server
              uploads
            </li>
            <li>
              <strong>Sign Up</strong>: No registration required
            </li>
            <li>
              <strong>Coverage</strong>: {routes.length}+ developer tools across{" "}
              {categorizedRoutes.length} categories
            </li>
            <li>
              <strong>Target Users</strong>: Frontend developers, full-stack
              engineers, designers
            </li>
            <li>
              <strong>Technology</strong>: WebAssembly-powered transformations
            </li>
          </ul>
        </section>

        {/* GEO Header Section */}
        <header className="bg-gradient-to-b from-brand-50 to-gray-50 px-4 pb-8 pt-6 text-center sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 px-4 py-1.5 text-[13px] font-semibold text-white shadow-lg shadow-brand-500/35 md:mb-6">
            <span className="h-4 w-4">✨</span>
            Trusted by Developers Worldwide
          </span>

          <h1 className="mb-3 bg-gradient-to-br from-brand-600 via-brand-400 to-brand-500 bg-clip-text text-[32px] font-extrabold leading-tight text-transparent md:mb-4">
            Free Online Developer Tools (2026)
          </h1>
          <p className="mx-auto max-w-[600px] text-[15px] leading-relaxed text-gray-600 md:mb-8">
            Secure, fast, and free developer utilities running entirely in your
            browser.
            <br />
            No servers, no uploads, just code.
          </p>

          {/* TL;DR Section - using Premium Card */}
          <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-brand-200 bg-white p-4 shadow-sm shadow-brand-500/5 md:mt-8 md:p-6 lg:p-8">
            <div className="mb-4 text-center text-base font-bold text-gray-900 md:mb-6">
              TL;DR: Why Folioify?
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6 lg:gap-8">
              <div className="text-center">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Processing
                </div>
                <div className="text-sm leading-relaxed text-gray-600">
                  <strong className="font-semibold text-brand-600">
                    Client-Side Only
                  </strong>
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Cost
                </div>
                <div className="text-sm leading-relaxed text-gray-600">
                  <strong className="font-semibold text-brand-600">
                    100% Free
                  </strong>
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Registration
                </div>
                <div className="text-sm leading-relaxed text-gray-600">
                  <strong className="font-semibold text-brand-600">
                    No Signup
                  </strong>
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Privacy
                </div>
                <div className="text-sm leading-relaxed text-gray-600">
                  <strong className="font-semibold text-brand-600">
                    Data Stays Local
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8" id="tools">
          <div className="relative mx-auto mb-6 max-w-xl md:mb-8">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 md:left-4"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search 50+ developer tools..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-base transition-all duration-300 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-400/20 md:rounded-2xl md:py-4 md:pl-12 md:text-lg"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {categories.map(category => (
              <button
                key={category}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 md:rounded-xl md:px-4 md:py-2.5 md:text-base ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-lg shadow-brand-500/25"
                    : "border border-brand-300 bg-transparent text-brand-800 hover:border-brand-400 hover:shadow-lg hover:shadow-brand-500/20"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <section className="bg-gray-50 px-4 pb-12 pt-8 sm:px-6 md:pb-16 lg:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
            {filteredRoutes.map(route => (
              <Link
                key={route.path}
                href={route.path}
                className="relative block overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 no-underline transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10 md:p-5"
              >
                <div className="mb-2.5 flex items-center gap-2 md:mb-3">
                  <ToolCategoryIcon category={route.category} />
                  <span className="text-xs font-semibold uppercase text-brand-600 md:text-sm">
                    {route.category}
                  </span>
                </div>
                <h3 className="mb-1.5 text-lg font-bold text-brand-600 md:mb-2">
                  {route.searchTerm}
                </h3>
                <p className="mb-3 text-sm leading-relaxed text-gray-600 md:mb-4">
                  {route.desc}
                </p>
                <div className="text-sm font-semibold text-brand-600 md:text-base">
                  Launch Tool →
                </div>
              </Link>
            ))}
          </div>

          {filteredRoutes.length === 0 && (
            <div className="py-10 text-center text-gray-500 md:py-12">
              <p>No tools found matching your criteria.</p>
            </div>
          )}
        </section>

        {/* What Is & Features Section */}
        <section className="bg-gray-50 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <h2 className="mb-3 text-center text-[28px] font-bold text-gray-900 md:mb-4">
            What is Folioify?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-center text-base text-gray-600 md:mb-12">
            Folioify is a comprehensive toolkit designed to simplify modern web
            development workflows. Unlike other converters that upload your code
            to remote servers, we leverage WebAssembly to perform all
            transformations <strong>locally on your device</strong>.
          </p>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:gap-6">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10 md:p-5 lg:p-6">
              <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600 md:mb-3">
                <FreeIcon />
              </div>
              <h3 className="mb-1.5 text-lg font-bold text-brand-600 md:mb-2">
                Transform Code
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Convert SVGs to React, JSON to TypeScript, HTML to Pug, and more
                with pixel-perfect accuracy.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10 md:p-5 lg:p-6">
              <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600 md:mb-3">
                <SpeedIcon />
              </div>
              <h3 className="mb-1.5 text-lg font-bold text-brand-600 md:mb-2">
                Generate Assets
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Create consistent data structures, schema definitions, and
                boilerplate code instantly.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10 md:p-5 lg:p-6">
              <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600 md:mb-3">
                <PrivacyIcon />
              </div>
              <h3 className="mb-1.5 text-lg font-bold text-brand-600 md:mb-2">
                Format Data
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Prettify and clean up messy code snippets automatically using
                industry-standard formatters.
              </p>
            </div>
          </div>
        </section>

        {/* Common Use Cases Section - GEO §5 */}
        <section className="bg-gray-50 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <h2 className="mb-3 text-center text-[28px] font-bold text-gray-900 md:mb-4">
            Common Use Cases
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-center text-base text-gray-600 md:mb-12">
            Discover how developers use Folioify to streamline their workflows.
          </p>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:gap-6">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10 md:p-5 lg:p-6">
              <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600 md:mb-3">
                <FreeIcon />
              </div>
              <h3 className="mb-1.5 text-lg font-bold text-brand-600 md:mb-2">
                Frontend Components
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Convert <strong>SVG icons to React/JSX</strong> components for
                seamless integration into your UI library.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10 md:p-5 lg:p-6">
              <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600 md:mb-3">
                <SpeedIcon />
              </div>
              <h3 className="mb-1.5 text-lg font-bold text-brand-600 md:mb-2">
                Schema & Types
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Generate <strong>TypeScript interfaces from JSON</strong>{" "}
                responses to ensure type safety in your codebase.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10 md:p-5 lg:p-6">
              <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600 md:mb-3">
                <PrivacyIcon />
              </div>
              <h3 className="mb-1.5 text-lg font-bold text-brand-600 md:mb-2">
                Markup & Styles
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Transform <strong>HTML to Pug/Jade</strong> or convert CSS to
                Tailwind utility classes.
              </p>
            </div>
          </div>
        </section>

        {/* Boundaries Section - GEO §5: What It Cannot Do */}
        <section className="bg-gray-100 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <h2 className="mb-3 text-center text-[28px] font-bold text-gray-900 md:mb-4">
            What Folioify Does Not Do
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-center text-base text-gray-600 md:mb-12">
            Understanding our scope helps you choose the right tool for your
            needs.
          </p>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:gap-6">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10 md:p-5 lg:p-6">
              <h3 className="mb-1.5 text-lg font-bold text-brand-600 md:mb-2">
                No Server Processing
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                We do <strong>not</strong> upload, store, or process your code
                on remote servers. Everything runs locally.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10 md:p-5 lg:p-6">
              <h3 className="mb-1.5 text-lg font-bold text-brand-600 md:mb-2">
                No Accounts or Storage
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                We do <strong>not</strong> offer user accounts, cloud storage,
                or history sync. Your data stays on your device.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10 md:p-5 lg:p-6">
              <h3 className="mb-1.5 text-lg font-bold text-brand-600 md:mb-2">
                No Proprietary Lock-in
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                We use <strong>open-source libraries</strong> (SVGR, Prettier,
                json-to-ts). No vendor lock-in or proprietary formats.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-gradient-to-br from-brand-50 via-brand-100 to-brand-50 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <h2 className="mb-8 text-center text-[28px] font-bold text-gray-900 md:mb-12">
            How It Works
          </h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 lg:gap-10">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-400 text-xl font-bold text-white shadow-lg shadow-brand-500/35 md:mb-4">
                1
              </div>
              <h4 className="mb-2 text-lg font-semibold text-gray-900 md:mb-3">
                Select a Tool
              </h4>
              <p className="text-sm leading-relaxed text-gray-600">
                Choose from our categorized list of converters below (SVG, JSON,
                HTML, etc.).
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-400 text-xl font-bold text-white shadow-lg shadow-brand-500/35 md:mb-4">
                2
              </div>
              <h4 className="mb-2 text-lg font-semibold text-gray-900 md:mb-3">
                Paste Code
              </h4>
              <p className="text-sm leading-relaxed text-gray-600">
                Paste your input code into the editor. The tool detects format
                automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-400 text-xl font-bold text-white shadow-lg shadow-brand-500/35 md:mb-4">
                3
              </div>
              <h4 className="mb-2 text-lg font-semibold text-gray-900 md:mb-3">
                Get Result
              </h4>
              <p className="text-sm leading-relaxed text-gray-600">
                Copy the transformed code from the output panel. It updates
                instantly.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-12 bg-white px-4 py-12 sm:px-6 md:mt-16 md:py-16 lg:px-8">
          <h2 className="mb-8 text-center text-[28px] font-bold text-gray-900 md:mb-12">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:gap-6">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-5 lg:p-6"
              >
                <div className="mb-2 text-[15px] font-semibold text-gray-900 md:mb-3">
                  {item.question}
                </div>
                <div className="text-sm leading-relaxed text-gray-600">
                  {item.answer}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mt-12 bg-brand-50 px-4 py-12 sm:px-6 md:mt-16 md:py-16 lg:px-8">
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 text-center md:grid-cols-3 md:gap-8">
            <div>
              <span className="block text-3xl font-extrabold text-brand-600 md:text-4xl">
                {routes.length}+
              </span>
              <span className="mt-1 text-sm text-gray-600 md:mt-2 md:text-base">
                Free Tools
              </span>
            </div>
            <div>
              <span className="block text-3xl font-extrabold text-brand-600 md:text-4xl">
                {categorizedRoutes.length}
              </span>
              <span className="mt-1 text-sm text-gray-600 md:mt-2 md:text-base">
                Categories
              </span>
            </div>
            <div>
              <span className="block text-3xl font-extrabold text-brand-600 md:text-4xl">
                0
              </span>
              <span className="mt-1 text-sm text-gray-600 md:mt-2 md:text-base">
                Registration
              </span>
            </div>
          </div>
        </section>

        {/* Last Updated - GEO Freshness Signal */}
        <footer className="border-t border-gray-200 px-4 py-6 text-center text-xs text-gray-500 sm:px-6 md:py-8 md:text-sm lg:px-8">
          Last Updated: <time dateTime={lastUpdated}>{lastUpdated}</time>
        </footer>
      </article>
    </>
  );
}
