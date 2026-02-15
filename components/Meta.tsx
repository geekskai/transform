/**
 * SEO & GEO Meta 组件：title、description、canonical、og、twitter、品牌一致
 * MetaProps 与 utils/routes.RouteSEO、lib/seo.ToolMeta 对齐，由 getToolMeta(route) 传入
 * @see docs/SEO-METADATA-DESIGN.md §4.3、§5
 */

import Head from "next/head";
import React from "react";
import { SITE_CONFIG } from "../lib/seo";

/** 与 RouteSEO / ToolMeta 字段对应，由 _app 从 getToolMeta 传入 */
export interface MetaProps {
  title: string;
  description: string;
  /** 若未传则不做 canonical/og:url */
  url?: string;
  /** 显式 canonical，优先于 url */
  canonical?: string;
  keywords?: string[];
  /** 绝对 URL */
  ogImage?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
  /** GEO §10 新鲜度 */
  lastModified?: string;
  datePublished?: string;
}

const defaultOgImage = `${SITE_CONFIG.baseUrl.replace(/\/$/, "")}${
  SITE_CONFIG.defaultOgImage
}`;

export const Meta = ({
  title,
  description,
  url,
  canonical: canonicalProp,
  keywords,
  ogImage = defaultOgImage,
  ogType = "website",
  noindex,
  lastModified,
  datePublished
}: MetaProps) => {
  const canonical = canonicalProp ?? url;
  const ogUrl = canonical ?? url;

  return (
    <Head>
      <title>{title}</title>
      <link rel="icon" href="/static/favicon.png" type="image/png" />
      <meta content={description} name="description" />
      {canonical && <link rel="canonical" href={canonical} key="canonical" />}
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:site_name" content={SITE_CONFIG.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content={SITE_CONFIG.locale} />
      {lastModified && ogType === "article" && (
        <meta property="article:modified_time" content={lastModified} />
      )}
      {datePublished && ogType === "article" && (
        <meta property="article:published_time" content={datePublished} />
      )}
      {lastModified && <meta name="last-modified" content={lastModified} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
      <meta name="twitter:creator" content={SITE_CONFIG.twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <link rel="manifest" href="/static/site.webmanifest" />
    </Head>
  );
};
