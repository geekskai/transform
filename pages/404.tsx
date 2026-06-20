import Link from "next/link";
import { ArrowRight, Home, Search, Wrench } from "lucide-react";
import Error404 from "../public/assets/svgs/Error404";
import { SITE_CONFIG } from "../lib/seo";

const suggestedTools = [
  {
    label: "JSX Viewer",
    href: "/tools/jsx-viewer",
    description: "Preview React JSX components directly in the browser."
  },
  {
    label: "JSON to TypeScript",
    href: "/tools/json-to-typescript",
    description: "Generate TypeScript definitions from JSON samples."
  },
  {
    label: "SVG to React Native",
    href: "/tools/svg-to-react-native",
    description: "Convert SVG markup into React Native components."
  },
  {
    label: "HTML to JSX",
    href: "/tools/html-to-jsx",
    description: "Turn HTML snippets into React-friendly JSX."
  }
];

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-180px)] w-full max-w-7xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
            404 - Page not found
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-normal text-gray-950 sm:text-5xl lg:text-6xl">
            This page is not available.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            The URL may have changed, or the tool you are looking for may live
            under a different name. Search the tool collection or jump back to
            the most useful pages on {SITE_CONFIG.name}.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>
            <Link
              href="/#tools"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:border-brand-300 hover:bg-brand-50"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Browse all tools
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <Error404 />
        </div>
      </div>

      <div className="mt-12 border-t border-gray-200 pt-8">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
          <Wrench className="h-4 w-4" aria-hidden="true" />
          Popular tools
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {suggestedTools.map(tool => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/10"
            >
              <span className="flex items-center justify-between gap-3 text-base font-semibold text-gray-950">
                {tool.label}
                <ArrowRight
                  className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700"
                  aria-hidden="true"
                />
              </span>
              <span className="mt-2 block text-sm leading-6 text-gray-600">
                {tool.description}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
