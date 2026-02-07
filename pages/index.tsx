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
        <meta
          property="og:title"
          content="Free Online Developer Tools (2026) | Folioify"
        />
        <meta
          property="og:description"
          content="Secure, fast, and free developer tools running entirely in your browser."
        />
        <meta property="og:type" content="website" />
      </Head>

      <div className="home-page">
        {/* GEO Header Section */}
        <header className="tool-hero">
          <span className="tool-hero__badge">
            <span className="tool-hero__badge-icon">✨</span>
            Trusted by Developers Worldwide
          </span>

          <h1 className="tool-hero__title">
            Free Online Developer Tools (2026)
          </h1>
          <p className="tool-hero__subtitle">
            Secure, fast, and free developer utilities running entirely in your
            browser.
            <br />
            No servers, no uploads, just code.
          </p>

          {/* TL;DR Section - using Premium Card */}
          <div className="core-info-card">
            <div className="core-info-card__title">TL;DR: Why Folioify?</div>
            <div className="core-info-card__grid">
              <div className="core-info-card__item">
                <div className="core-info-card__label">Processing</div>
                <div className="core-info-card__value">
                  <strong>Client-Side Only</strong>
                </div>
              </div>
              <div className="core-info-card__item">
                <div className="core-info-card__label">Cost</div>
                <div className="core-info-card__value">
                  <strong>100% Free</strong>
                </div>
              </div>
              <div className="core-info-card__item">
                <div className="core-info-card__label">Registration</div>
                <div className="core-info-card__value">
                  <strong>No Signup</strong>
                </div>
              </div>
              <div className="core-info-card__item">
                <div className="core-info-card__label">Privacy</div>
                <div className="core-info-card__value">
                  <strong>Data Stays Local</strong>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* What Is & Features Section */}
        <section className="features-section">
          <h2 className="features-section__title">What is Folioify?</h2>
          <p className="features-section__subtitle">
            Folioify is a comprehensive toolkit designed to simplify modern web
            development workflows. Unlike other converters that upload your code
            to remote servers, we leverage WebAssembly to perform all
            transformations <strong>locally on your device</strong>.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card__icon">
                <FreeIcon />
              </div>
              <h3 className="feature-card__title">Transform Code</h3>
              <p className="feature-card__description">
                Convert SVGs to React, JSON to TypeScript, HTML to Pug, and more
                with pixel-perfect accuracy.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">
                <SpeedIcon />
              </div>
              <h3 className="feature-card__title">Generate Assets</h3>
              <p className="feature-card__description">
                Create consistent data structures, schema definitions, and
                boilerplate code instantly.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">
                <PrivacyIcon />
              </div>
              <h3 className="feature-card__title">Format Data</h3>
              <p className="feature-card__description">
                Prettify and clean up messy code snippets automatically using
                industry-standard formatters.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="howto-section">
          <h2 className="howto-section__title">How It Works</h2>
          <div className="howto-grid">
            <div className="howto-step">
              <div className="howto-step__number">1</div>
              <h4 className="howto-step__title">Select a Tool</h4>
              <p className="howto-step__description">
                Choose from our categorized list of converters below (SVG, JSON,
                HTML, etc.).
              </p>
            </div>
            <div className="howto-step">
              <div className="howto-step__number">2</div>
              <h4 className="howto-step__title">Paste Code</h4>
              <p className="howto-step__description">
                Paste your input code into the editor. The tool detects format
                automatically.
              </p>
            </div>
            <div className="howto-step">
              <div className="howto-step__number">3</div>
              <h4 className="howto-step__title">Get Result</h4>
              <p className="howto-step__description">
                Copy the transformed code from the output panel. It updates
                instantly.
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <div
          className="home-filters"
          id="tools"
          style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}
        >
          <div
            className="search-bar"
            style={{
              display: "flex",
              alignItems: "center",
              maxWidth: "600px",
              margin: "0 auto 24px",
              position: "relative"
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="search-bar__icon"
              style={{
                position: "absolute",
                left: "12px",
                width: "20px",
                height: "20px",
                color: "var(--text-muted)"
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search 50+ developer tools..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-bar__input"
              style={{
                width: "100%",
                padding: "12px 12px 12px 40px",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                fontSize: "16px"
              }}
            />
          </div>

          <div
            className="category-filters"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              flexWrap: "wrap"
            }}
          >
            {categories.map(category => (
              <button
                key={category}
                className={`category-filter ${
                  activeCategory === category ? "btn-primary" : "btn-secondary"
                }`}
                style={
                  activeCategory === category
                    ? { padding: "8px 16px", fontSize: "14px" }
                    : {
                        padding: "8px 16px",
                        fontSize: "14px",
                        background: "transparent"
                      }
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <section className="features-section" style={{ paddingTop: 0 }}>
          <div className="grid-responsive">
            {filteredRoutes.map(route => (
              <Link key={route.path} href={route.path}>
                <a
                  className="feature-card"
                  style={{ display: "block", textDecoration: "none" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "12px"
                    }}
                  >
                    <ToolCategoryIcon category={route.category} />
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--brand-600)",
                        textTransform: "uppercase"
                      }}
                    >
                      {route.category}
                    </span>
                  </div>
                  <h3 className="feature-card__title">{route.searchTerm}</h3>
                  <p
                    className="feature-card__desc"
                    style={{ marginBottom: "16px" }}
                  >
                    {route.desc}
                  </p>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--brand-600)"
                    }}
                  >
                    Launch Tool →
                  </div>
                </a>
              </Link>
            ))}
          </div>

          {filteredRoutes.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--text-muted)"
              }}
            >
              <p>No tools found matching your criteria.</p>
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <h2 className="faq-section__title">Frequently Asked Questions</h2>
          <div className="faq-grid">
            {faqItems.map((item, index) => (
              <div key={index} className="faq-card">
                <div className="faq-card__question">{item.question}</div>
                <div className="faq-card__answer">{item.answer}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section
          className="stats-section"
          style={{ padding: "48px 24px", background: "var(--brand-50)" }}
        >
          <div
            className="grid-responsive"
            style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}
          >
            <div className="stat-item">
              <span
                style={{
                  display: "block",
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "var(--brand-600)"
                }}
              >
                {routes.length}+
              </span>
              <span
                style={{ fontSize: "14px", color: "var(--text-secondary)" }}
              >
                Free Tools
              </span>
            </div>
            <div className="stat-item">
              <span
                style={{
                  display: "block",
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "var(--brand-600)"
                }}
              >
                {categorizedRoutes.length}
              </span>
              <span
                style={{ fontSize: "14px", color: "var(--text-secondary)" }}
              >
                Categories
              </span>
            </div>
            <div className="stat-item">
              <span
                style={{
                  display: "block",
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "var(--brand-600)"
                }}
              >
                0
              </span>
              <span
                style={{ fontSize: "14px", color: "var(--text-secondary)" }}
              >
                Registration
              </span>
            </div>
          </div>
        </section>

        {/* Last Updated */}
        <div
          style={{
            textAlign: "center",
            padding: "24px",
            fontSize: "13px",
            color: "var(--text-muted)",
            borderTop: "1px solid var(--border)"
          }}
        >
          Last Updated: February 2026
        </div>
      </div>
    </>
  );
}
