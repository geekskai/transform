/**
 * SEO-friendly layout wrapper for tool pages.
 * Based on geekskai.com reference design - adapted to light theme.
 * Provides: breadcrumb, hero section, Core Info card, feature badges.
 * @see docs/SEO-METADATA-DESIGN.md
 */
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { activeRouteData } from "@utils/routes";

// Icons for feature badges (inline SVG for performance)
const LightningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ToolIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  const lastModified = route.lastModified;

  return (
    <article className="tool-page" role="main">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">
          <a className="breadcrumb__link">
            <span aria-hidden="true">🏠</span> Home
          </a>
        </Link>
        <span className="breadcrumb__separator" aria-hidden="true">
          &gt;
        </span>
        <span>Tools</span>
        <span className="breadcrumb__separator" aria-hidden="true">
          &gt;
        </span>
        <span className="breadcrumb__current" aria-current="page">
          {searchTerm}
        </span>
      </nav>

      {/* Hero Section */}
      <header className="tool-hero">
        <span className="tool-hero__badge">
          <ToolIcon />
          Free {searchTerm} Tool
        </span>

        <h1 className="tool-hero__title">{searchTerm}</h1>

        <p className="tool-hero__subtitle">{description}</p>

        {/* Core Information Card */}
        <div className="core-info-card">
          <h2 className="core-info-card__title">Core Information</h2>
          <div className="core-info-card__grid">
            <div className="core-info-card__item">
              <div className="core-info-card__label">Pricing</div>
              <div className="core-info-card__value">
                <strong>Free</strong> - No registration required
              </div>
            </div>
            <div className="core-info-card__item">
              <div className="core-info-card__label">Main Features</div>
              <div className="core-info-card__value">
                <strong>Instant conversion</strong>, Real-time preview
              </div>
            </div>
            <div className="core-info-card__item">
              <div className="core-info-card__label">Positioning</div>
              <div className="core-info-card__value">
                <strong>Professional tool</strong> for developers
              </div>
            </div>
            <div className="core-info-card__item">
              <div className="core-info-card__label">Target Users</div>
              <div className="core-info-card__value">
                <strong>Developers</strong>, Designers, Content creators
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Feature Highlight Badges */}
      <div className="feature-badges">
        <div className="feature-badge">
          <span className="feature-badge__icon">
            <LightningIcon />
          </span>
          <span className="feature-badge__label">Lightning Fast</span>
          <span className="feature-badge__desc">- Convert in seconds</span>
        </div>
        <div className="feature-badge">
          <span className="feature-badge__icon">
            <ShieldIcon />
          </span>
          <span className="feature-badge__label">Privacy Focused</span>
          <span className="feature-badge__desc">- Local processing</span>
        </div>
        <div className="feature-badge">
          <span className="feature-badge__icon">
            <CheckIcon />
          </span>
          <span className="feature-badge__label">No Registration</span>
          <span className="feature-badge__desc">- Free forever</span>
        </div>
      </div>

      {/* Tool Content (Editor Panels) */}
      <div className="tool-page__content">{children}</div>

      {/* Last Updated Metadata */}
      {lastModified && (
        <footer className="tool-page__meta">
          <p aria-label="Last updated">
            Last updated: <time dateTime={lastModified}>{lastModified}</time>
          </p>
        </footer>
      )}
    </article>
  );
}
