import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";
import { categorizedRoutes, routes } from "@utils/routes";
import { getCategorySlug } from "../../lib/seo";

type CategoryTool = {
  path: string;
  searchTerm: string;
  desc: string;
  lastModified?: string;
};

type CategoryPageProps = {
  category: string;
  tools: CategoryTool[];
};

export default function ToolCategoryPage({
  category,
  tools
}: CategoryPageProps) {
  return (
    <article className="min-h-screen bg-brand-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="text-gray-600 no-underline hover:text-brand-600"
          >
            Home
          </Link>
          <span aria-hidden="true">&gt;</span>
          <span>Tools</span>
          <span aria-hidden="true">&gt;</span>
          <span className="font-medium text-gray-900" aria-current="page">
            {category}
          </span>
        </nav>

        <header className="mb-8 rounded-2xl border border-brand-200 bg-white p-6 shadow-sm md:p-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-700">
            {tools.length} free tools
          </p>
          <h1 className="mb-3 text-3xl font-extrabold text-gray-900 md:text-4xl">
            {category} Developer Tools
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-gray-600 md:text-lg">
            Convert, format, validate, and generate {category} code directly in
            your browser. Folioify tools are free, require no signup, and are
            designed for fast local developer workflows.
          </p>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(tool => (
            <Link
              key={tool.path}
              href={tool.path}
              className="group rounded-xl border border-gray-200 bg-white p-5 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
            >
              <h2 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-brand-700">
                {tool.searchTerm}
              </h2>
              <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-600">
                {tool.desc}
              </p>
              <div className="text-sm font-semibold text-brand-700">
                Launch tool
              </div>
            </Link>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Why use these {category} tools?
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              These tools focus on quick transformations and validation tasks
              that developers repeat during implementation, debugging,
              documentation, and migration work.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Are uploads required?
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              No. Tools run in the browser whenever possible, so code snippets
              stay on your device and can be copied out immediately.
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: categorizedRoutes.map(category => ({
    params: { category: getCategorySlug(category.category) }
  })),
  fallback: false
});

export const getStaticProps: GetStaticProps<CategoryPageProps> = async ({
  params
}) => {
  const slug = String(params?.category || "");
  const category = categorizedRoutes.find(
    item => getCategorySlug(item.category) === slug
  );

  if (!category) {
    return { notFound: true };
  }

  return {
    props: {
      category: category.category,
      tools: routes
        .filter(tool => tool.category === category.category)
        .map(tool => ({
          path: tool.path,
          searchTerm: tool.searchTerm,
          desc: tool.desc,
          lastModified: tool.lastModified
        }))
    }
  };
};
