/**
 * SEO & GEO Metadata - 单一数据源与 Schema 生成
 * 数据源：utils/routes.Route（含 RouteSEO 可选字段），与 components/Meta.MetaProps 对齐
 * @see docs/SEO-METADATA-DESIGN.md
 */

import { activeRouteData, categorizedRoutes, routes } from "@utils/routes";
import { getToolPageContent, getToolPageFAQs } from "./tool-page-content";

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
  kind: "home" | "tool" | "category";
  noindex?: boolean;
  lastModified?: string;
  datePublished?: string;
}

export function getCategorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCategoryBySlug(slug: string) {
  return categorizedRoutes.find(
    category => getCategorySlug(category.category) === slug
  );
}

function getLatestDate(dates: Array<string | undefined>): string | undefined {
  return dates.filter(Boolean).sort().pop();
}

/** 首页固定 Meta */
const HOME_META: ToolMeta = {
  title:
    "Free Online Developer Tools (2026) | Converters, Formatters & Generators - Folioify",
  description:
    "The ultimate collection of free online developer tools. Convert SVG to JSX, JSON to TypeScript, HTML to Pug, and more. Secure client-side execution, no data uploads.",
  canonical: SITE_CONFIG.baseUrl + "/",
  keywords: [
    "developer tools",
    "online converter",
    "SVG to JSX",
    "JSON to TypeScript",
    "code converter",
    "free tools",
    "secure conversions",
    SITE_CONFIG.brand
  ],
  ogImage: `${SITE_CONFIG.baseUrl}${SITE_CONFIG.defaultOgImage}`,
  ogType: "website",
  searchTerm: SITE_CONFIG.name,
  path: "/",
  kind: "home",
  lastModified: "2026-02-07"
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
  if (!route) {
    const categoryMatch = pathname.match(/^\/tools\/([^/]+)$/);
    const category = categoryMatch
      ? getCategoryBySlug(categoryMatch[1])
      : undefined;

    if (!category) return null;

    const categoryTools = routes.filter(
      tool => tool.category === category.category
    );
    const categoryName = category.category;
    const lastModified =
      getLatestDate(categoryTools.map(tool => tool.lastModified)) ||
      HOME_META.lastModified;

    return {
      title: `${categoryName} Developer Tools | Free Online Converters | ${SITE_CONFIG.name}`,
      description: `Browse free online ${categoryName} developer tools from Folioify. Convert, format, validate, and generate code locally in your browser with no signup.`,
      canonical: `${baseUrl}/tools/${getCategorySlug(categoryName)}`,
      keywords: [
        `${categoryName} tools`,
        `${categoryName} converter`,
        "online developer tools",
        "free code tools",
        SITE_CONFIG.brand
      ],
      ogImage: `${baseUrl}${SITE_CONFIG.defaultOgImage}`,
      ogType: "website",
      searchTerm: `${categoryName} Developer Tools`,
      path: `/tools/${getCategorySlug(categoryName)}`,
      kind: "category",
      lastModified
    };
  }

  const searchTerm = route.searchTerm || route.label || pathname;
  const pageContent = getToolPageContent(route.path);
  const title = pageContent?.metaTitle
    ? pageContent.metaTitle
    : route.title
    ? route.title
    : `${searchTerm} | ${SITE_CONFIG.name}`;
  let description =
    pageContent?.metaDescription && pageContent.metaDescription.trim()
      ? pageContent.metaDescription
      : route.desc && route.desc.trim()
      ? route.desc
      : `An online playground to convert ${searchTerm}`;
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    description = description.slice(0, MAX_DESCRIPTION_LENGTH - 3) + "...";
  }

  const keywords =
    (pageContent?.keywords?.length ?? 0) > 0
      ? pageContent.keywords
      : (route.keywords?.length ?? 0) > 0
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
    kind: "tool",
    noindex: route.noindex,
    lastModified: route.lastModified,
    datePublished: route.datePublished
  };
}

/** WebApplication JSON-LD（SEO/GEO §18 检索对齐） */
export function buildWebApplicationSchema(meta: ToolMeta): object {
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

/** SoftwareApplication JSON-LD for individual tool pages. */
export function buildSoftwareApplicationSchema(meta: ToolMeta): object {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.searchTerm,
    description: meta.description,
    url: meta.canonical,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.baseUrl.replace(/\/$/, "") + "/"
    }
  };

  if (meta.datePublished) schema.datePublished = meta.datePublished;
  if (meta.lastModified) schema.dateModified = meta.lastModified;
  return schema;
}

export function buildToolFAQSchema(meta: ToolMeta): object {
  const contentFaqs = getToolPageFAQs(meta.path);
  if (contentFaqs?.length) {
    return buildFAQPageSchema(contentFaqs);
  }

  return buildFAQPageSchema([
    {
      question: `Is ${meta.searchTerm} free to use?`,
      answer:
        "Yes. This tool is completely free with no signup or payment required. You can use it as often as you need."
    },
    {
      question: "Does my data leave the browser?",
      answer:
        "No. Processing happens locally in your browser. Your input is not uploaded or stored on our servers."
    },
    {
      question: "Is the output production-ready?",
      answer:
        "Output is designed to be clean and accurate, but always review results before using in production."
    },
    {
      question: `Can I use ${meta.searchTerm} offline?`,
      answer:
        "Once the page is loaded, many conversions work without an active connection, depending on the tool."
    }
  ]);
}

export function buildCollectionPageSchema(meta: ToolMeta): object {
  const categoryName = meta.searchTerm.replace(/ Developer Tools$/, "");
  const categoryTools = routes.filter(tool => tool.category === categoryName);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: meta.searchTerm,
    description: meta.description,
    url: meta.canonical,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: categoryTools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.searchTerm,
        url: `${SITE_CONFIG.baseUrl.replace(/\/$/, "")}${tool.path}`
      }))
    }
  };
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
