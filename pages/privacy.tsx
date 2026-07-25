import React from "react";
import {
  PRIVACY_CONTACT_EMAIL,
  PRIVACY_DISCLOSURES,
  PRIVACY_LAST_UPDATED
} from "../lib/site-transparency";

const sections = [
  ["Tool input and generated output", PRIVACY_DISCLOSURES.userContent],
  ["Server-backed transformations", PRIVACY_DISCLOSURES.serverProcessing],
  ["Browser storage", PRIVACY_DISCLOSURES.browserStorage],
  ["Analytics and session replay", PRIVACY_DISCLOSURES.analytics],
  ["Cookies and similar technologies", PRIVACY_DISCLOSURES.cookies],
  ["Advertising", PRIVACY_DISCLOSURES.advertising],
  ["Third-party services", PRIVACY_DISCLOSURES.vendors]
] as const;

export default function PrivacyPage() {
  return (
    <article className="min-h-screen bg-brand-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
        <header className="border-b border-gray-100 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            Trust and transparency
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900 md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Last updated: {PRIVACY_LAST_UPDATED}
          </p>
        </header>

        <div className="mt-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900">Overview</h2>
            <p className="mt-2 leading-relaxed text-gray-600">
              Folioify provides developer tools without user accounts. This
              policy explains what data may be processed when you use the site,
              including the difference between browser and server-backed tools.
            </p>
          </section>

          {sections.map(([title, content]) => (
            <section key={title}>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="mt-2 leading-relaxed text-gray-600">{content}</p>
            </section>
          ))}

          <section>
            <h2 className="text-xl font-bold text-gray-900">
              Provider privacy information
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-600">
              <li>
                <a
                  className="font-semibold text-brand-700 underline"
                  href="https://privacy.microsoft.com/en-us/privacystatement"
                  rel="noreferrer"
                  target="_blank"
                >
                  Microsoft privacy statement
                </a>
              </li>
              <li>
                <a
                  className="font-semibold text-brand-700 underline"
                  href="https://sentry.io/privacy/"
                  rel="noreferrer"
                  target="_blank"
                >
                  Sentry privacy policy
                </a>
              </li>
              <li>
                <a
                  className="font-semibold text-brand-700 underline"
                  href="https://vercel.com/legal/privacy-policy"
                  rel="noreferrer"
                  target="_blank"
                >
                  Vercel privacy policy
                </a>
              </li>
              <li>
                <a
                  className="font-semibold text-brand-700 underline"
                  href="https://policies.google.com/technologies/partner-sites"
                  rel="noreferrer"
                  target="_blank"
                >
                  How Google uses data on partner sites
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900">
              Choices and contact
            </h2>
            <p className="mt-2 leading-relaxed text-gray-600">
              You can clear browser storage and cookies through your browser and
              use browser privacy controls to limit tracking. Folioify is
              operated by GeeksKai. For privacy questions or requests, email{" "}
              <a
                className="font-semibold text-brand-700 underline"
                href={`mailto:${PRIVACY_CONTACT_EMAIL}`}
              >
                {PRIVACY_CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
