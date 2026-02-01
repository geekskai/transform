/**
 * SEO-friendly layout wrapper for tool pages.
 * Provides: breadcrumb, H1, key-fact section (GEO §8, SEO-METADATA-DESIGN §4.6).
 * @see docs/SEO-METADATA-DESIGN.md
 */
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { activeRouteData } from "@utils/routes";
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
      <header className="tool-page__seo">
        <nav className="tool-page__breadcrumb" aria-label="Breadcrumb">
          <Link href="/">
            <a className="tool-page__breadcrumb-link">Home</a>
          </Link>
          <span className="tool-page__breadcrumb-sep" aria-hidden="true">
            /
          </span>
          <span className="tool-page__breadcrumb-current" aria-current="page">
            {searchTerm}
          </span>
        </nav>

        <h1 className="tool-page__title">{searchTerm}</h1>

        <section
          className="tool-page__intro fact-chunk"
          aria-labelledby="tool-intro-heading"
        >
          <h2 id="tool-intro-heading" className="tool-page__intro-heading">
            About this tool
          </h2>
          <p className="tool-page__intro-desc">
            {description} <strong>Free to use</strong>, no signup required. Runs
            in your browser.
          </p>
          {lastModified && (
            <p className="tool-page__intro-meta" aria-label="Last updated">
              Last updated: <time dateTime={lastModified}>{lastModified}</time>
            </p>
          )}
        </section>
      </header>

      <div className="tool-page__main">{children}</div>
    </article>
  );
}
