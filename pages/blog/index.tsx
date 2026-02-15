import Link from "next/link";
import { getAllPosts } from "../../lib/blog";
import { Meta } from "../../components/Meta";
import DateFormatter from "../../components/blog/DateFormatter";

export default function BlogIndex({ allPosts }: { allPosts: any[] }) {
  return (
    <>
      <Meta
        title="Blog | Folioify"
        description="Technical guides, tutorials, and updates from the Folioify team."
      />

      <main className="min-h-screen bg-gray-50 pb-12 pt-4 md:pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl mb-4">
              Folioify Blog
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-500">
              Tips, tricks, and tools for modern developers.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {allPosts.map(post => (
              <article
                key={post.slug}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1 border border-gray-100"
              >
                {post.coverImage && (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block overflow-hidden h-48"
                  >
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                )}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-600">
                      Article
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-2 block group"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="mt-3 text-base text-gray-500 line-clamp-3">
                        {post.description}
                      </p>
                    </Link>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <span className="sr-only">{post.author}</span>
                    </div>
                    <div className="ml-0">
                      <p className="text-sm font-medium text-gray-900">
                        {post.author}
                      </p>
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <DateFormatter dateString={post.date} />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const allPosts = getAllPosts([
    "title",
    "date",
    "slug",
    "author",
    "coverImage",
    "description"
  ]);

  return {
    props: { allPosts }
  };
}
