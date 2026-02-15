import React from "react";
import Link from "next/link";
import { Meta } from "../Meta";
import BlogJsonLd from "./BlogJsonLd";
import { SITE_CONFIG } from "../../lib/seo";

interface BlogLayoutProps {
  children: React.ReactNode;
  meta: {
    title: string;
    description: string;
    date: string;
    author: string;
    slug: string; // Added slug
    coverImage?: string;
    lastmod?: string;
    tags?: string[];
    faqs?: { question: string; answer: string }[];
    canonicalUrl?: string;
  };
}

export default function BlogLayout({ children, meta }: BlogLayoutProps) {
  const canonical =
    meta.canonicalUrl ||
    `${SITE_CONFIG.baseUrl.replace(/\/$/, "")}/blog/${meta.slug}`;

  return (
    <>
      <Meta
        title={`${meta.title} | Folioify Blog`}
        description={meta.description}
        ogType="article"
        ogImage={meta.coverImage}
        datePublished={meta.date}
        lastModified={meta.lastmod}
        keywords={meta.tags}
        canonical={canonical}
      />
      <BlogJsonLd post={meta} />

      {/* Navigation - Minimal for Blog */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-gray-900 text-xl no-underline hover:text-brand-600 transition-colors"
            >
              <span className="text-2xl">⚡</span>
              <span>Folioify</span>
            </Link>
            <div className="flex gap-4 text-sm font-medium">
              <Link
                href="/blog"
                className="text-gray-600 hover:text-brand-600 transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/"
                className="text-gray-600 hover:text-brand-600 transition-colors"
              >
                Tools
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="min-h-screen bg-gray-50 pb-12 pt-8 sm:pt-12">
        <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-8 text-center sm:mb-12">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500">
              <time dateTime={meta.date}>
                {new Date(meta.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </time>
              <span>•</span>
              <span>{meta.author}</span>
              {meta.lastmod && (
                <>
                  <span>•</span>
                  <span className="text-gray-400">
                    Updated:{" "}
                    {new Date(meta.lastmod).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </span>
                </>
              )}
            </div>
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
              {meta.title}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 leading-relaxed">
              {meta.description}
            </p>
          </header>

          {/* Featured Image */}
          {meta.coverImage && (
            <div className="mb-8 sm:mb-12 overflow-hidden rounded-2xl border border-gray-100 shadow-lg">
              <img
                src={meta.coverImage}
                alt={meta.title}
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg prose-indigo mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-100
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900
            prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-md
            prose-code:text-brand-600 prose-code:bg-brand-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-gray-900 prose-pre:shadow-lg
          "
          >
            {children}

            {/* Tags */}
            {meta.tags && meta.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-2 pt-8 border-t border-gray-100">
                {meta.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      </main>

      {/* Footer CTA */}
      <section className="bg-white border-t border-gray-100 py-12">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Boost your productivity
          </h2>
          <p className="mx-auto mt-4 text-lg text-gray-600">
            Check out our suite of free developer tools designed to help you
            code faster.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/"
              className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all hover:-translate-y-0.5"
            >
              Explore Tools
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
