/**
 * SEO & GEO Metadata - 单一数据源与 Schema 生成
 * 数据源：utils/routes.Route（含 RouteSEO 可选字段），与 components/Meta.MetaProps 对齐
 * @see docs/SEO-METADATA-DESIGN.md
 */

import { activeRouteData } from "@utils/routes";

type Route = NonNullable<ReturnType<typeof activeRouteData>>;

/** 站点级配置，与 DESIGN-SPEC 和 package.json 对齐 */
export const SITE_CONFIG = {
  name: "Folioify",
  baseUrl:
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SITE_URL) ||
    "https://folioify.com",
  brand: "folioify",
  defaultOgImage: "/cover.png",
  twitterHandle: "@folioify",
  locale: "en_US",
  themeColor: "#16F2B3"
} as const;

export const SEO = {
  title: SITE_CONFIG.name,
  description:
    "A polyglot web converter that's going to save you a lot of time.",
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: SITE_CONFIG.baseUrl,
    site_name: SITE_CONFIG.name,
    images: [
      {
        url: `${SITE_CONFIG.baseUrl}${SITE_CONFIG.defaultOgImage}`,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name
      }
    ]
  },
  twitter: {
    handle: SITE_CONFIG.twitterHandle,
    site: SITE_CONFIG.twitterHandle,
    cardType: "summary_large_image"
  }
};

const MAX_DESCRIPTION_LENGTH = 155;

/** 工具页 / 首页 Meta 输出（与 MetaProps 对齐，供 Meta 与 JsonLd 使用） */
export interface ToolMeta {
  title: string;
  description: string;
  canonical: string;
  keywords: string[];
  ogImage: string;
  ogType: "website" | "article";
  searchTerm: string;
  path: string;
  noindex?: boolean;
  lastModified?: string;
  datePublished?: string;
}

/** 首页固定 Meta */
const HOME_META: ToolMeta = {
  title: SITE_CONFIG.name,
  description:
    "A polyglot web converter that's going to save you a lot of time.",
  canonical: SITE_CONFIG.baseUrl + "/",
  keywords: [
    "web converter",
    "online converter",
    "free tool",
    SITE_CONFIG.brand
  ],
  ogImage: `${SITE_CONFIG.baseUrl}${SITE_CONFIG.defaultOgImage}`,
  ogType: "website",
  searchTerm: SITE_CONFIG.name,
  path: "/"
};

/** 根据 pathname 生成完整工具页 Meta（单一数据源：routes） */
export function getToolMeta(pathname: string): ToolMeta | null {
  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/$/, "");
  if (!pathname || pathname === "/") {
    return {
      ...HOME_META,
      canonical: baseUrl + "/",
      ogImage: `${baseUrl}${SITE_CONFIG.defaultOgImage}`
    };
  }

  const route: Route | undefined = activeRouteData(pathname);
  if (!route) return null;

  const searchTerm = route.searchTerm || route.label || pathname;
  const title = route.title
    ? route.title
    : `${searchTerm} | ${SITE_CONFIG.name}`;
  let description =
    route.desc && route.desc.trim()
      ? route.desc
      : `An online playground to convert ${searchTerm}`;
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    description = description.slice(0, MAX_DESCRIPTION_LENGTH - 3) + "...";
  }

  const keywords =
    (route.keywords?.length ?? 0) > 0
      ? route.keywords
      : [searchTerm, "online converter", "free tool", SITE_CONFIG.brand];

  const canonical = baseUrl + pathname;
  const ogImage = route.ogImage
    ? route.ogImage.startsWith("http")
      ? route.ogImage
      : baseUrl + route.ogImage
    : `${baseUrl}${SITE_CONFIG.defaultOgImage}`;

  return {
    title,
    description,
    canonical,
    keywords,
    ogImage,
    ogType: route.ogType ?? "website",
    searchTerm,
    path: route.path,
    noindex: route.noindex,
    lastModified: route.lastModified,
    datePublished: route.datePublished
  };
}

/** WebApplication JSON-LD（SEO/GEO §18 检索对齐） */
export function buildWebApplicationSchema(meta: ToolMeta): object {
  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/$/, "");
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: meta.searchTerm,
    description: meta.description,
    url: meta.canonical,
    applicationCategory: "UtilityApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    provider: {
      "@type": "Organization",
      name: SITE_CONFIG.brand
    }
  };
  if (meta.datePublished) schema.datePublished = meta.datePublished;
  if (meta.lastModified) schema.dateModified = meta.lastModified;
  return schema;
}

/** Organization JSON-LD（站点级，GEO §14 实体信号） */
export function buildOrganizationSchema(): object {
  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.brand,
    url: baseUrl + "/"
  };
}

/** BreadcrumbList JSON-LD（GEO §12 内部推理线索） */
export function buildBreadcrumbSchema(
  pathname: string,
  toolName?: string
): object {
  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/$/, "");
  const items: { "@type": string; name: string; item?: string }[] = [
    { "@type": "ListItem", name: "Home", item: baseUrl + "/" }
  ];

  // Blog paths
  if (pathname.startsWith("/blog")) {
    items.push({
      "@type": "ListItem",
      name: "Blog",
      item: baseUrl + "/blog"
    });

    if (pathname !== "/blog" && toolName) {
      items.push({
        "@type": "ListItem",
        name: toolName,
        item: baseUrl + pathname
      });
    }
  }
  // Tool paths
  else if (pathname && pathname !== "/") {
    items.push({
      "@type": "ListItem",
      name: "Tools", // Or "Tools" intermediate page if it exists
      item: baseUrl + "/" // Assuming tools are on home or standard path
    });
    items.push({
      "@type": "ListItem",
      name: toolName || "Tool",
      item: baseUrl + pathname
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      ...item,
      position: i + 1
    }))
  };
}

/** BlogPosting JSON-LD (SEO) */
export function buildBlogPostingSchema(post: {
  title: string;
  description: string;
  date: string;
  author: string;
  slug: string;
  coverImage?: string;
  images?: string | string[];
  lastmod?: string;
}): object {
  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/$/, "");
  const url = `${baseUrl}/blog/${post.slug}`;

  let imageList: string[] = [];
  if (post.images) {
    if (Array.isArray(post.images)) {
      imageList = post.images.map(img =>
        img.startsWith("http") ? img : `${baseUrl}${img}`
      );
    } else {
      imageList = [
        post.images.startsWith("http")
          ? post.images
          : `${baseUrl}${post.images}`
      ];
    }
  } else if (post.coverImage) {
    imageList = [
      post.coverImage.startsWith("http")
        ? post.coverImage
        : `${baseUrl}${post.coverImage}`
    ];
  } else {
    imageList = [`${baseUrl}${SITE_CONFIG.defaultOgImage}`];
  }

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: imageList,
    datePublished: post.date,
    dateModified: post.lastmod || post.date,
    author: {
      "@type": "Person",
      name: post.author || SITE_CONFIG.brand,
      url: SITE_CONFIG.twitterHandle
        ? `https://twitter.com/${SITE_CONFIG.twitterHandle.replace("@", "")}`
        : undefined
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/static/favicon.png`
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url
    }
  };
}

/** FAQPage JSON-LD (SEO) */
export function buildFAQPageSchema(
  faqs: { question: string; answer: string }[]
): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}
