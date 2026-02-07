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
    className="value-card__icon"
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
    className="value-card__icon"
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
    className="value-card__icon"
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
    )
  };
  return (
    <span className="tool-card__category-icon">
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

      <article className="home-page min-h-screen">
        {/* GEO: Core Facts Chunk for AI Extraction */}
        <section className="fact-chunk sr-only" aria-hidden="false">
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
        <header className="tool-hero px-4 pb-8 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
          <span className="tool-hero__badge mb-4 md:mb-6">
            <span className="tool-hero__badge-icon">✨</span>
            Trusted by Developers Worldwide
          </span>

          <h1 className="tool-hero__title mb-3 md:mb-4">
            Free Online Developer Tools (2026)
          </h1>
          <p className="tool-hero__subtitle mb-6 md:mb-8">
            Secure, fast, and free developer utilities running entirely in your
            browser.
            <br />
            No servers, no uploads, just code.
          </p>

          {/* TL;DR Section - using Premium Card */}
          <div className="core-info-card mx-auto mt-6 max-w-3xl p-4 md:mt-8 md:p-6 lg:p-8">
            <div className="core-info-card__title mb-4 md:mb-6">
              TL;DR: Why Folioify?
            </div>
            <div className="core-info-card__grid gap-4 md:gap-6 lg:gap-8">
              <div className="core-info-card__item">
                <div className="core-info-card__label mb-2">Processing</div>
                <div className="core-info-card__value">
                  <strong>Client-Side Only</strong>
                </div>
              </div>
              <div className="core-info-card__item">
                <div className="core-info-card__label mb-2">Cost</div>
                <div className="core-info-card__value">
                  <strong>100% Free</strong>
                </div>
              </div>
              <div className="core-info-card__item">
                <div className="core-info-card__label mb-2">Registration</div>
                <div className="core-info-card__value">
                  <strong>No Signup</strong>
                </div>
              </div>
              <div className="core-info-card__item">
                <div className="core-info-card__label mb-2">Privacy</div>
                <div className="core-info-card__value">
                  <strong>Data Stays Local</strong>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* What Is & Features Section */}
        <section className="features-section mt-12 px-4 py-12 sm:px-6 md:mt-16 md:py-16 lg:px-8">
          <h2 className="features-section__title mb-3 md:mb-4">
            What is Folioify?
          </h2>
          <p className="features-section__subtitle mx-auto mb-8 max-w-2xl md:mb-12">
            Folioify is a comprehensive toolkit designed to simplify modern web
            development workflows. Unlike other converters that upload your code
            to remote servers, we leverage WebAssembly to perform all
            transformations <strong>locally on your device</strong>.
          </p>

          <div className="features-grid mx-auto max-w-5xl gap-4 md:gap-5 lg:gap-6">
            <div className="feature-card p-4 md:p-5 lg:p-6">
              <div className="feature-card__icon mb-2.5 md:mb-3">
                <FreeIcon />
              </div>
              <h3 className="feature-card__title mb-1.5 md:mb-2">
                Transform Code
              </h3>
              <p className="feature-card__description">
                Convert SVGs to React, JSON to TypeScript, HTML to Pug, and more
                with pixel-perfect accuracy.
              </p>
            </div>
            <div className="feature-card p-4 md:p-5 lg:p-6">
              <div className="feature-card__icon mb-2.5 md:mb-3">
                <SpeedIcon />
              </div>
              <h3 className="feature-card__title mb-1.5 md:mb-2">
                Generate Assets
              </h3>
              <p className="feature-card__description">
                Create consistent data structures, schema definitions, and
                boilerplate code instantly.
              </p>
            </div>
            <div className="feature-card p-4 md:p-5 lg:p-6">
              <div className="feature-card__icon mb-2.5 md:mb-3">
                <PrivacyIcon />
              </div>
              <h3 className="feature-card__title mb-1.5 md:mb-2">
                Format Data
              </h3>
              <p className="feature-card__description">
                Prettify and clean up messy code snippets automatically using
                industry-standard formatters.
              </p>
            </div>
          </div>
        </section>

        {/* Common Use Cases Section - GEO §5 */}
        <section className="features-section mt-12 px-4 py-12 sm:px-6 md:mt-16 md:py-16 lg:px-8">
          <h2 className="features-section__title mb-3 md:mb-4">
            Common Use Cases
          </h2>
          <p className="features-section__subtitle mx-auto mb-8 max-w-2xl md:mb-12">
            Discover how developers use Folioify to streamline their workflows.
          </p>
          <div className="features-grid mx-auto max-w-5xl gap-4 md:gap-5 lg:gap-6">
            <div className="feature-card p-4 md:p-5 lg:p-6">
              <div className="feature-card__icon mb-2.5 md:mb-3">
                <FreeIcon />
              </div>
              <h3 className="feature-card__title mb-1.5 md:mb-2">
                Frontend Components
              </h3>
              <p className="feature-card__description">
                Convert <strong>SVG icons to React/JSX</strong> components for
                seamless integration into your UI library.
              </p>
            </div>
            <div className="feature-card p-4 md:p-5 lg:p-6">
              <div className="feature-card__icon mb-2.5 md:mb-3">
                <SpeedIcon />
              </div>
              <h3 className="feature-card__title mb-1.5 md:mb-2">
                Schema & Types
              </h3>
              <p className="feature-card__description">
                Generate <strong>TypeScript interfaces from JSON</strong>{" "}
                responses to ensure type safety in your codebase.
              </p>
            </div>
            <div className="feature-card p-4 md:p-5 lg:p-6">
              <div className="feature-card__icon mb-2.5 md:mb-3">
                <PrivacyIcon />
              </div>
              <h3 className="feature-card__title mb-1.5 md:mb-2">
                Markup & Styles
              </h3>
              <p className="feature-card__description">
                Transform <strong>HTML to Pug/Jade</strong> or convert CSS to
                Tailwind utility classes.
              </p>
            </div>
          </div>
        </section>

        {/* Boundaries Section - GEO §5: What It Cannot Do */}
        <section className="features-section mt-12 bg-gray-50 px-4 py-12 sm:px-6 md:mt-16 md:py-16 lg:px-8">
          <h2 className="features-section__title mb-3 md:mb-4">
            What Folioify Does Not Do
          </h2>
          <p className="features-section__subtitle mx-auto mb-8 max-w-2xl md:mb-12">
            Understanding our scope helps you choose the right tool for your
            needs.
          </p>
          <div className="features-grid mx-auto max-w-5xl gap-4 md:gap-5 lg:gap-6">
            <div className="feature-card p-4 md:p-5 lg:p-6">
              <h3 className="feature-card__title mb-1.5 md:mb-2">
                No Server Processing
              </h3>
              <p className="feature-card__description">
                We do <strong>not</strong> upload, store, or process your code
                on remote servers. Everything runs locally.
              </p>
            </div>
            <div className="feature-card p-4 md:p-5 lg:p-6">
              <h3 className="feature-card__title mb-1.5 md:mb-2">
                No Accounts or Storage
              </h3>
              <p className="feature-card__description">
                We do <strong>not</strong> offer user accounts, cloud storage,
                or history sync. Your data stays on your device.
              </p>
            </div>
            <div className="feature-card p-4 md:p-5 lg:p-6">
              <h3 className="feature-card__title mb-1.5 md:mb-2">
                No Proprietary Lock-in
              </h3>
              <p className="feature-card__description">
                We use <strong>open-source libraries</strong> (SVGR, Prettier,
                json-to-ts). No vendor lock-in or proprietary formats.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="howto-section mt-12 px-4 py-12 sm:px-6 md:mt-16 md:py-16 lg:px-8">
          <h2 className="howto-section__title mb-8 md:mb-12">How It Works</h2>
          <div className="howto-grid mx-auto max-w-4xl gap-6 md:gap-8 lg:gap-10">
            <div className="howto-step">
              <div className="howto-step__number mb-3 md:mb-4">1</div>
              <h4 className="howto-step__title mb-2 md:mb-3">Select a Tool</h4>
              <p className="howto-step__description">
                Choose from our categorized list of converters below (SVG, JSON,
                HTML, etc.).
              </p>
            </div>
            <div className="howto-step">
              <div className="howto-step__number mb-3 md:mb-4">2</div>
              <h4 className="howto-step__title mb-2 md:mb-3">Paste Code</h4>
              <p className="howto-step__description">
                Paste your input code into the editor. The tool detects format
                automatically.
              </p>
            </div>
            <div className="howto-step">
              <div className="howto-step__number mb-3 md:mb-4">3</div>
              <h4 className="howto-step__title mb-2 md:mb-3">Get Result</h4>
              <p className="howto-step__description">
                Copy the transformed code from the output panel. It updates
                instantly.
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <div
          className="home-filters mx-auto mt-12 max-w-5xl px-4 py-6 sm:px-6 md:mt-16 md:py-8 lg:px-8"
          id="tools"
        >
          <div className="search-bar relative mx-auto mb-6 max-w-xl md:mb-8">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="search-bar__icon absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 md:left-4"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search 50+ developer tools..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-bar__input w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-base transition-all duration-300 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-400/20 md:rounded-2xl md:py-4 md:pl-12 md:text-lg"
            />
          </div>

          <div className="category-filters flex flex-wrap justify-center gap-2 md:gap-3">
            {categories.map(category => (
              <button
                key={category}
                className={`category-filter rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 md:rounded-xl md:px-4 md:py-2.5 md:text-base ${
                  activeCategory === category
                    ? "btn-primary"
                    : "btn-secondary bg-transparent"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <section className="features-section px-4 pb-12 pt-0 sm:px-6 md:pb-16 lg:px-8">
          <div className="grid-responsive mx-auto max-w-5xl gap-4 md:gap-5 lg:gap-6">
            {filteredRoutes.map(route => (
              <Link
                key={route.path}
                href={route.path}
                className="feature-card block p-4 no-underline transition-all duration-300 md:p-5 lg:p-6"
              >
                <div className="mb-2.5 flex items-center gap-2 md:mb-3">
                  <ToolCategoryIcon category={route.category} />
                  <span className="text-xs font-semibold uppercase text-brand-600 md:text-sm">
                    {route.category}
                  </span>
                </div>
                <h3 className="feature-card__title mb-1.5 md:mb-2">
                  {route.searchTerm}
                </h3>
                <p className="feature-card__desc mb-3 md:mb-4">{route.desc}</p>
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

        {/* FAQ Section */}
        <section className="faq-section mt-12 px-4 py-12 sm:px-6 md:mt-16 md:py-16 lg:px-8">
          <h2 className="faq-section__title mb-8 md:mb-12">
            Frequently Asked Questions
          </h2>
          <div className="faq-grid mx-auto max-w-4xl gap-4 md:gap-5 lg:gap-6">
            {faqItems.map((item, index) => (
              <div key={index} className="faq-card p-4 md:p-5 lg:p-6">
                <div className="faq-card__question mb-2 md:mb-3">
                  {item.question}
                </div>
                <div className="faq-card__answer">{item.answer}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section mt-12 bg-brand-50 px-4 py-12 sm:px-6 md:mt-16 md:py-16 lg:px-8">
          <div className="grid-responsive mx-auto max-w-3xl gap-6 text-center md:gap-8">
            <div className="stat-item">
              <span className="block text-3xl font-extrabold text-brand-600 md:text-4xl">
                {routes.length}+
              </span>
              <span className="mt-1 text-sm text-gray-600 md:mt-2 md:text-base">
                Free Tools
              </span>
            </div>
            <div className="stat-item">
              <span className="block text-3xl font-extrabold text-brand-600 md:text-4xl">
                {categorizedRoutes.length}
              </span>
              <span className="mt-1 text-sm text-gray-600 md:mt-2 md:text-base">
                Categories
              </span>
            </div>
            <div className="stat-item">
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
