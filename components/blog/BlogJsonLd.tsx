import Head from "next/head";
import { buildBlogPostingSchema, buildFAQPageSchema } from "../../lib/seo";

interface BlogJsonLdProps {
  post: {
    title: string;
    description: string;
    date: string;
    author: string;
    slug: string;
    coverImage?: string;
    images?: string | string[];
    lastmod?: string;
    faqs?: { question: string; answer: string }[];
  };
}

export default function BlogJsonLd({ post }: BlogJsonLdProps) {
  const blogPostingSchema = buildBlogPostingSchema(post);
  const faqSchema = post.faqs ? buildFAQPageSchema(post.faqs) : null;

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostingSchema)
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema)
          }}
        />
      )}
    </Head>
  );
}
