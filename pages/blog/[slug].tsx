import fs from "fs";
import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import { getPostBySlug, getAllPosts } from "../../lib/blog";
import BlogLayout from "../../components/blog/BlogLayout";
import Link from "next/link";
import remarkGfm from "remark-gfm";

// MDX Components replacement
const components = {
  Link,
  img: (props: any) => (
    <span className="block my-8">
      <img
        {...props}
        className="mx-auto rounded-2xl shadow-xl border border-gray-100 max-w-full h-auto"
        loading="lazy"
      />
    </span>
  )
};

export default function Post({
  post,
  mdxSource
}: {
  post: any;
  mdxSource: any;
}) {
  const router = useRouter();

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <BlogLayout meta={post}>
      <MDXRemote {...mdxSource} components={components} />
    </BlogLayout>
  );
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug, [
    "title",
    "date",
    "slug",
    "author",
    "content",
    "ogImage",
    "coverImage",
    "description",
    "tags",
    "keywords",
    "lastmod",
    "faqs",
    "canonicalUrl",
    "images"
  ]);

  const mdxSource = await serialize(post.content || "", {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: []
    }
  });

  return {
    props: {
      post,
      mdxSource
    }
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(["slug"]);

  return {
    paths: posts.map(post => {
      return {
        params: {
          slug: post.slug
        }
      };
    }),
    fallback: false
  };
}
