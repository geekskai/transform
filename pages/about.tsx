import React from "react";

const upstreamUrl = "https://github.com/ritz078/transform";

export default function AboutPage() {
  return (
    <article className="min-h-screen bg-brand-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
        <header className="border-b border-gray-100 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            Ownership and open-source credits
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900 md:text-4xl">
            About Folioify
          </h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-gray-600">
            Folioify is operated by GeeksKai. We build developer tools that make
            conversions and debugging faster while clearly identifying whether
            each tool processes input in the browser or on our server.
          </p>
        </header>

        <div className="mt-8 space-y-8 text-gray-600">
          <section>
            <h2 className="text-xl font-bold text-gray-900">
              What we maintain
            </h2>
            <p className="mt-2 leading-relaxed">
              Folioify maintains the site experience, selected transformer
              integrations, original task guides, processing disclosures, and
              product-specific tools such as the JSX Viewer and TOML Validator.
              We publish only a curated subset of tool pages for search indexing
              while the remaining utility routes stay available without being
              presented as finished editorial pages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900">
              Open-source origin and attribution
            </h2>
            <p className="mt-2 leading-relaxed">
              Folioify began as a fork of{" "}
              <a
                className="font-semibold text-brand-700 underline"
                href={upstreamUrl}
                rel="noreferrer"
                target="_blank"
              >
                ritz078/transform
              </a>
              , created by Ritesh Kumar and available at transform.tools. The
              upstream project and this fork are distributed under the MIT
              License. Folioify is independently operated; the upstream author
              does not sponsor or endorse this site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900">
              Privacy and processing
            </h2>
            <p className="mt-2 leading-relaxed">
              Processing differs by tool. Browser-based tools keep
              transformation input in the browser; server-backed tools send
              submitted input to Folioify for the requested conversion. Each
              tool displays its processing mode. Avoid entering secrets,
              credentials, personal data, or proprietary source code.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900">Contact</h2>
            <p className="mt-2 leading-relaxed">
              Questions, corrections, and privacy requests can be sent to{" "}
              <a
                className="font-semibold text-brand-700 underline"
                href="mailto:geeks.kai@gmail.com"
              >
                geeks.kai@gmail.com
              </a>
              . Source code and issue history are available in the{" "}
              <a
                className="font-semibold text-brand-700 underline"
                href="https://github.com/geekskai/transform"
                rel="noreferrer"
                target="_blank"
              >
                Folioify repository
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
