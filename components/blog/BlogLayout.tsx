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

      <main className="min-h-screen bg-gray-50 pb-12 pt-8 sm:pt-12">
        <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Content */}
          <div
            className="w-full max-w-7xl mx-auto prose prose-lg prose-indigo bg-white p-6 rounded-2xl shadow-sm border border-gray-100
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
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
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
