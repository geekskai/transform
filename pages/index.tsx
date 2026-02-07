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

// Category gradient and color configuration
const categoryStyles: Record<
  string,
  {
    gradient: string;
    bgGradient: string;
    border: string;
    hoverBorder: string;
    shadow: string;
    text: string;
    badge: string;
    iconBg: string;
  }
> = {
  SVG: {
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-500/10 to-rose-500/5",
    border: "border-pink-200",
    hoverBorder: "hover:border-pink-400",
    shadow: "hover:shadow-pink-500/20",
    text: "text-pink-600",
    badge: "bg-pink-500",
    iconBg: "from-pink-100 to-pink-50"
  },
  HTML: {
    gradient: "from-orange-500 to-amber-500",
    bgGradient: "from-orange-500/10 to-amber-500/5",
    border: "border-orange-200",
    hoverBorder: "hover:border-orange-400",
    shadow: "hover:shadow-orange-500/20",
    text: "text-orange-600",
    badge: "bg-orange-500",
    iconBg: "from-orange-100 to-orange-50"
  },
  JSON: {
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-500/10 to-teal-500/5",
    border: "border-emerald-200",
    hoverBorder: "hover:border-emerald-400",
    shadow: "hover:shadow-emerald-500/20",
    text: "text-emerald-600",
    badge: "bg-emerald-500",
    iconBg: "from-emerald-100 to-emerald-50"
  },
  CSS: {
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/10 to-cyan-500/5",
    border: "border-blue-200",
    hoverBorder: "hover:border-blue-400",
    shadow: "hover:shadow-blue-500/20",
    text: "text-blue-600",
    badge: "bg-blue-500",
    iconBg: "from-blue-100 to-blue-50"
  },
  GraphQL: {
    gradient: "from-purple-500 to-violet-500",
    bgGradient: "from-purple-500/10 to-violet-500/5",
    border: "border-purple-200",
    hoverBorder: "hover:border-purple-400",
    shadow: "hover:shadow-purple-500/20",
    text: "text-purple-600",
    badge: "bg-purple-500",
    iconBg: "from-purple-100 to-purple-50"
  },
  TypeScript: {
    gradient: "from-blue-600 to-indigo-500",
    bgGradient: "from-blue-600/10 to-indigo-500/5",
    border: "border-blue-200",
    hoverBorder: "hover:border-blue-400",
    shadow: "hover:shadow-blue-500/20",
    text: "text-blue-600",
    badge: "bg-blue-600",
    iconBg: "from-blue-100 to-blue-50"
  },
  JavaScript: {
    gradient: "from-yellow-500 to-amber-500",
    bgGradient: "from-yellow-500/10 to-amber-500/5",
    border: "border-yellow-200",
    hoverBorder: "hover:border-yellow-400",
    shadow: "hover:shadow-yellow-500/20",
    text: "text-yellow-600",
    badge: "bg-yellow-500",
    iconBg: "from-yellow-100 to-yellow-50"
  },
  Others: {
    gradient: "from-slate-500 to-gray-500",
    bgGradient: "from-slate-500/10 to-gray-500/5",
    border: "border-slate-200",
    hoverBorder: "hover:border-slate-400",
    shadow: "hover:shadow-slate-500/20",
    text: "text-slate-600",
    badge: "bg-slate-500",
    iconBg: "from-slate-100 to-slate-50"
  }
};

const getCategoryStyle = (category: string) => {
  return (
    categoryStyles[category] || {
      gradient: "from-brand-500 to-brand-400",
      bgGradient: "from-brand-500/10 to-brand-400/5",
      border: "border-brand-200",
      hoverBorder: "hover:border-brand-400",
      shadow: "hover:shadow-brand-500/20",
      text: "text-brand-600",
      badge: "bg-brand-500",
      iconBg: "from-brand-100 to-brand-50"
    }
  );
};

// Tool category icon with dynamic color
const ToolCategoryIcon = ({ category }: { category: string }) => {
  const style = getCategoryStyle(category);
  const icons: Record<string, React.ReactNode> = {
    SVG: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
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
      >
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
        <line x1="12" y1="22" x2="12" y2="15.5" />
        <polyline points="22 8.5 12 15.5 2 8.5" />
      </svg>
    ),
    TypeScript: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M12 8v8" />
        <path d="M8 8h8" />
      </svg>
    ),
    JavaScript: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M12 8v8" />
        <path d="M16 12c0 2-1.5 4-4 4" />
      </svg>
    )
  };
  return (
    <span
      className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${style.iconBg} ${style.text}`}
    >
      <span className="h-4 w-4">{icons[category] || icons.JSON}</span>
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

      <article className="min-h-screen flex flex-col gap-4 md:gap-6 bg-brand-100">
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
        <header className="bg-gradient-to-b from-brand-50 to-brand-100 px-4 pt-6 text-center md:px-6 md:pt-8 lg:px-8">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 px-4 py-1.5 text-[13px] font-semibold text-white shadow-lg shadow-brand-500/35 md:mb-6">
            <span className="h-4 w-4">✨</span>
            Trusted by Developers Worldwide
          </span>

          <h1 className="mb-3 bg-gradient-to-br from-brand-600 via-brand-400 to-brand-500 bg-clip-text text-[32px] font-extrabold leading-tight text-transparent md:mb-4">
            Free Online Developer Tools (2026) ✨
          </h1>
          <p className="mx-auto max-w-[600px] text-[15px] leading-relaxed text-gray-600 md:mb-8">
            Secure, fast, and free developer utilities running entirely in your
            browser.
            <br />
            No servers, no uploads, just code.
          </p>

          {/* TL;DR Section - using Premium Card */}
          <div className="mx-auto max-w-6xl rounded-xl border border-brand-200 bg-white p-4 shadow-sm shadow-brand-500/5 md:p-6">
            <div className="mb-4 text-center text-base font-bold text-gray-900">
              TL;DR: Why Folioify? ⚡
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
        <div
          className="mx-auto flex flex-col gap-4 md:gap-6 max-w-7xl px-4 md:px-6"
          id="tools"
        >
          <div className="relative max-w-3xl mx-auto w-full">
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

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(category => {
              const isSelected = activeCategory === category;
              const style = getCategoryStyle(
                category === "All" ? "Others" : category
              );

              return (
                <button
                  key={category}
                  className={`group relative overflow-hidden rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 md:px-4 md:py-2 md:text-base ${
                    isSelected
                      ? `bg-gradient-to-r ${style.gradient} text-white shadow-lg`
                      : "border border-gray-200 bg-white/80 text-gray-700 shadow-sm backdrop-blur-sm hover:border-gray-300 hover:bg-white hover:text-gray-900"
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                  {!isSelected && (
                    <span className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-100 to-gray-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tools Grid */}
          <section className="px-4 md:px-6">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {filteredRoutes.map(route => {
                const style = getCategoryStyle(route.category);
                return (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={`group relative block overflow-hidden rounded-2xl border bg-white no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${style.border} ${style.hoverBorder} ${style.shadow}`}
                  >
                    {/* Gradient Header */}
                    <div
                      className={`relative h-2 bg-gradient-to-r ${style.gradient}`}
                    >
                      {/* Floating particles effect */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -right-1 top-0 h-3 w-3 rounded-full bg-white/20 blur-sm" />
                        <div className="absolute left-1/4 top-0 h-2 w-2 rounded-full bg-white/30 blur-sm" />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 md:p-5">
                      {/* Category Badge & Icon */}
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ToolCategoryIcon category={route.category} />
                          <span
                            className={`text-xs font-semibold uppercase ${style.text}`}
                          >
                            {route.category}
                          </span>
                        </div>
                        {/* Badge */}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white ${style.badge}`}
                        >
                          Free
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className={`mb-2 text-base font-bold transition-colors duration-300 group-hover:${style.text} text-gray-900 md:text-lg`}
                      >
                        {route.searchTerm}
                      </h3>

                      {/* Description */}
                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">
                        {route.desc}
                      </p>

                      {/* CTA Button */}
                      <div
                        className={`flex items-center gap-1 text-sm font-semibold ${style.text} transition-transform duration-300 group-hover:translate-x-1`}
                      >
                        Launch Tool
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.bgGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                    />
                  </Link>
                );
              })}
            </div>

            {filteredRoutes.length === 0 && (
              <div className="py-10 text-center text-gray-500 md:py-12">
                <p className="text-lg">
                  No tools found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory("All");
                    setSearchQuery("");
                  }}
                  className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </div>

        {/* What Is & Features Section */}
        <section className="px-4 md:px-6">
          <h2 className="mb-3 text-center text-[28px] font-bold text-gray-900 md:mb-4">
            What is Folioify? 🧭
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
        <section className="px-4 md:px-6">
          <h2 className="mb-3 text-center text-[28px] font-bold text-gray-900 md:mb-4">
            Common Use Cases 💡
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
        <section className="px-4 md:px-6">
          <h2 className="mb-3 text-center text-[28px] font-bold text-gray-900 md:mb-4">
            What Folioify Does Not Do 🚫
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
        <section className="px-4 bg-brand-50 py-12 sm:px-6 md:py-16 lg:px-8">
          <h2 className="mb-8 text-center text-[28px] font-bold text-gray-900 md:mb-12">
            How It Works 🪄
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
        <section className="px-4 md:px-6">
          <h2 className="mb-4 text-center text-[28px] font-bold text-gray-900 md:mb-6">
            Frequently Asked Questions ❓
          </h2>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:gap-6">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 lg:p-6"
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
        <section className="mt-4 md:mt-6 bg-brand-50 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
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
      </article>
    </>
  );
}
