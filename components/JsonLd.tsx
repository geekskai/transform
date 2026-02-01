/**
 * JSON-LD 注入：WebApplication + Organization + BreadcrumbList（SEO/GEO §18）
 * @see docs/SEO-METADATA-DESIGN.md §4.4
 */

import React from "react";
import Head from "next/head";
import {
  getToolMeta,
  buildWebApplicationSchema,
  buildOrganizationSchema,
  buildBreadcrumbSchema
} from "../lib/seo";

export interface JsonLdProps {
  pathname: string;
}

/** 根据 pathname 输出 WebApplication + Organization + BreadcrumbList */
export function JsonLd({ pathname }: JsonLdProps) {
  const toolMeta = getToolMeta(pathname || "/");
  if (!toolMeta) return null;

  const webApp = buildWebApplicationSchema(toolMeta);
  const organization = buildOrganizationSchema();
  const breadcrumb = buildBreadcrumbSchema(pathname, toolMeta.searchTerm);

  const graph = [webApp, organization, breadcrumb];

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": graph
          })
        }}
      />
    </Head>
  );
}
