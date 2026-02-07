# pages/tools SEO Metadata 技术方案

> **目标**：为 `pages/tools` 下 60+ 工具页统一、可维护地接入 SEO Metadata，并贴合 UI 设计规范与品牌（folioify / #16F2B3）。  
> **技术栈**：Next.js 10.2.3、React 17、现有 `utils/routes` + `components/Meta`（无新增依赖）。  
> **GEO 对齐**：本方案在传统 SEO 基础上，按 [GEO Whitepaper](./GEO-Whitepaper.md)（Generative Engine Optimization）设计，使工具页具备 **可被 AI 检索、信任、引用** 的元数据与结构，支撑「成为 AI 答案中的可引用来源」。

---

## 0. GEO 与 SEO 在本方案中的关系

| 维度         | SEO（本方案已覆盖）                       | GEO（本方案对齐）                                                            |
| ------------ | ----------------------------------------- | ---------------------------------------------------------------------------- |
| **目标**     | 排名、点击                                | **被 AI 引用**（Retrieval → Trust → Assembly）                               |
| **Metadata** | title、description、canonical、og/twitter | 同上 + **新鲜度信号**（last-modified）、**实体一致**（Organization）         |
| **Schema**   | 富结果展示                                | **检索对齐**（WebApplication、Organization、FAQPage）— 见 GEO §18            |
| **内容结构** | 关键词、内链                              | **Fact-chunk**、短段落、`<strong>` 关键事实、FAQ 作为「问题库」— 见 GEO §7–9 |
| **站点**     | 站内链接                                  | **Site Focus**、内链作为「推理线索」、Entity Graph — 见 GEO §11–13           |

本方案优先完成 **Metadata + Schema + 单一数据源**，为后续将工具页升级为 **GEO Pillar 式页面**（TL;DR、边界说明、FAQ、Last Updated）预留扩展点。

---

## 1. 现状与问题

### 1.1 现有实现

| 项目       | 说明                                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **数据源** | `utils/routes.tsx`：`categorizedRoutes` → 扁平化为 `routes`，含 `path`、`searchTerm`、`desc`（部分条目有自定义 `desc`）          |
| **解析**   | `activeRouteData(pathname)` 根据当前 path 返回对应 route                                                                         |
| **Meta**   | `components/Meta.tsx`：接收 `title`、`description`、`url`，输出 `<title>`、`description`、`og:*`、`twitter:*`、favicon、manifest |
| **\_app**  | 首页用固定文案，其余用 `activeRoute?.searchTerm` 与 `activeRoute?.desc` 传给 Meta                                                |

### 1.2 缺口（对齐 SEO 规范与 DESIGN-SPEC）

- **缺 canonical**：无规范 URL，不利于去重与权重集中。
- **缺 keywords**：工具页无统一/可配置 keywords，不利于检索与 AI 信息抽取。
- **缺 JSON-LD**：无 WebApplication / Organization / BreadcrumbList，不利于 AI 与富结果。
- **品牌不统一**：`Meta` 里 og:image 仍为 `transform.tools`，twitter:creator 为 `ritz078`，与 package.json `author: folioify` 及 DESIGN-SPEC 品牌不一致。
- **站点级信息分散**：site name、默认 og image、品牌名未集中配置。
- **工具页无“核心事实”结构**：SEO 规范要求可被 AI 抽取的 fact-chunk（如定价、功能、目标用户），当前仅 description 一段文字。

### 1.3 缺口（对齐 GEO Whitepaper）

- **无新鲜度信号**：GEO §10 要求可见的 "Last updated" 与 ≤90 天更新周期；当前无 `last-modified` 等 meta 或 schema。
- **无检索对齐的 Schema 策略**：GEO §18 强调 Schema 用于 **retrieval alignment**，高价值类型为 FAQPage、WebApplication、Organization；当前未注入。
- **工具页非「答案源」形态**：GEO §5–7 的 Pillar 要求 TL;DR、边界说明、FAQ、更新时间；工具页目前仅有编辑器，无「可被 AI 直接抽取」的短段落与事实块。
- **实体与站点焦点**：GEO §14、§11 要求清晰的 Organization 与 Site Focus；站点级 Organization 与内部链接图谱需在 metadata/schema 与后续内容上统一。

---

## 2. 设计原则

1. **单一数据源**：所有工具页 SEO 文案与配置来自同一处（扩展现有 routes 或集中配置文件），避免散落在各页面。
2. **零侵入工具页**：工具页继续只负责业务（如 ConversionPanel），SEO 由 `_app` + 增强版 Meta/SEO 组件根据 pathname 自动注入。
3. **品牌与 DESIGN-SPEC 一致**：站点名、品牌色 #16F2B3、folioify、默认 og 图与 manifest 与 `docs/DESIGN-SPEC-LIGHT-THEME-BRAND.md` 一致。
4. **符合现有 SEO 规范**：与 `SEO.md` 及 `.cursor/rules` 中的 WebApplication、Organization、Breadcrumb、fact-chunk、`<strong>` 等要求一致。
5. **可扩展**：后续可为某工具单独覆盖 title/description/keywords/ogImage，或加 FAQ/Article 等 JSON-LD，而不改架构。
6. **GEO 友好**（对齐 [GEO Whitepaper](./GEO-Whitepaper.md)）：
   - **Retrievability**：description 简洁、可抽取；Schema 准确、利于检索。
   - **Trust**：Organization 明确、canonical 唯一、品牌一致。
   - **Reusability**：结构化 meta + JSON-LD，便于 AI 重组答案。
   - **Freshness**：预留 last-modified / datePublished 等字段与更新周期策略。
7. **TDK 差异化**：避免全站套用同一模版导致页面同质化；每页应有可区分的 title/description/keywords，详见 [§11 TDK 差异化与模板化风险](#11-tdk-差异化与模板化风险seo-专家视角)。

---

## 3. 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│  _app.tsx                                                        │
│  - 根据 router.pathname 取 meta（见 4.1）                         │
│  - 渲染 <Meta /> 或 <ToolPageMeta />（见 4.2）                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  lib/seo.ts (新建)                                                │
│  - SITE_CONFIG：baseUrl, siteName, brand, defaultOgImage, ...    │
│  - getToolMeta(pathname)：基于 activeRouteData + 规则生成完整 meta │
│  - buildWebApplicationSchema(toolMeta)                           │
│  - buildBreadcrumbSchema(pathname)                               │
│  - buildOrganizationSchema()                                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ utils/routes  │     │ components/Meta │     │ components/     │
│ (可选扩展)     │     │ (增强)           │     │ JsonLd.tsx (新)  │
│ - 为 route    │     │ - canonical      │     │ - 注入 WebApp   │
│ 增加 keywords │     │ - keywords       │     │ - Breadcrumb    │
│ 等字段         │     │ - og:site_name  │     │ - Organization  │
└───────────────┘     │ - 品牌 og/tw    │     └─────────────────┘
                      └─────────────────┘
```

- **数据流**：pathname → `getToolMeta(pathname)` → `{ title, description, canonical, keywords, ogImage, ... }` → Meta + JsonLd。
- **工具页**：无需改代码，仅通过 `routes`（或集中配置）补充/覆盖 SEO 字段即可。

---

## 4. 详细设计

### 4.1 站点级配置（lib/seo.ts）

集中配置，与 DESIGN-SPEC 和 package.json 对齐：

```ts
// lib/seo.ts
export const SITE_CONFIG = {
  name: "Folioify",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://folioify.com/", // 或你们正式域名
  brand: "folioify",
  defaultOgImage: "/cover.png", // 或品牌化 og 图路径
  twitterHandle: "@folioify", // 与 author 一致
  locale: "en_US",
  themeColor: "#16F2B3" // DESIGN-SPEC --brand
} as const;
```

- `baseUrl` 用于 canonical、JSON-LD 的 `url`/`item`。
- `defaultOgImage` 建议使用绝对 URL：`${SITE_CONFIG.baseUrl}${SITE_CONFIG.defaultOgImage}`。

### 4.2 工具页 Meta 生成（getToolMeta）

**输入**：`pathname`（如 `/tools/json-to-typescript`）。  
**输出**：`ToolMeta`：

```ts
interface ToolMeta {
  title: string; // 用于 <title>、og:title、twitter:title 建议60字之内
  description: string; // 用于 description、og:description、twitter:description（建议 80–155 字，GEO 可作「答案种子」）
  canonical: string; // 绝对 URL
  keywords: string[]; // 用于 meta keywords 或 JSON-LD keywords
  ogImage: string; // 绝对 URL
  ogType: "website";
  searchTerm: string; // 与现有 searchTerm 一致，用于 JSON-LD name 等
  path: string; // 用于 Breadcrumb
  // GEO 友好：新鲜度与版本信号（可选，见 GEO §10）
  lastModified?: string; // ISO 8601，用于 meta、JSON-LD dateModified
  datePublished?: string; // ISO 8601，用于 JSON-LD datePublished
}
```

**逻辑**：

1. 若 `pathname === "/"`：返回首页 meta（固定 title/description/canonical，无工具维度）。
2. 否则调用 `activeRouteData(pathname)`：
   - `title`：优先 `route.title`，否则 `route.searchTerm`，格式可为 `"${searchTerm} | ${SITE_CONFIG.name}"`。
   - `description`：`route.desc`，若需统一长度可在此截断（如 155 字符内）。
   - `canonical`：`${SITE_CONFIG.baseUrl}${pathname}`（不保留 query）。
   - `keywords`：
     - 若 route 上扩展了 `keywords: string[]`，用其；
     - 否则用函数生成：如 `[route.searchTerm, "online converter", "free tool", SITE_CONFIG.brand]`。
   - `ogImage`：优先 `route.ogImage`（绝对 URL），否则站点默认。
   - `searchTerm` / `path`：直接来自 route。
   - **GEO 新鲜度**：若 route 扩展了 `lastModified` / `datePublished`（或来自集中配置如 `lib/tools-seo-overrides.ts`），写入 ToolMeta；否则可选使用站点级「内容版本」或留空，待 Phase 3 统一维护。

这样 **单一数据源** 仍是 routes；仅在不改 routes 结构的前提下，用默认规则也能产出完整 meta。

### 4.3 增强 Meta 组件（components/Meta.tsx）

在现有基础上增加并统一：

- **Canonical**：`<link rel="canonical" href={canonical} />`
- **Keywords**：`<meta name="keywords" content={keywords.join(", ")} />`（若项目接受 keywords）
- **Open Graph**：
  - `og:url`、`og:site_name`（SITE_CONFIG.name）
  - `og:image` 使用绝对 URL
  - `og:locale`（可选）
- **Twitter**：
  - `twitter:creator` / `twitter:site` 使用 SITE_CONFIG.twitterHandle
  - 保持 `summary_large_image` 与与 og 一致的 title/description/image
- **品牌**：favicon、manifest 已存在；若 manifest 中有 `name`/`short_name`，与 SITE_CONFIG 一致。

接口建议：

```ts
interface MetaProps {
  title: string;
  description: string;
  url?: string; // 若未传则不做 canonical/og:url
  canonical?: string; // 显式 canonical，优先于 url
  keywords?: string[];
  ogImage?: string; // 绝对 URL
  ogType?: "website" | "article";
  noindex?: boolean; // 预留
  // GEO 新鲜度（GEO §10）
  lastModified?: string; // ISO 8601，输出 meta 或 article:modified_time
  datePublished?: string; // 可选，用于 article:published_time
}
```

内部：canonical 取 `canonical ?? url`；ogImage 取传入值或 `${SITE_CONFIG.baseUrl}${SITE_CONFIG.defaultOgImage}`。若提供 `lastModified`，可输出 `<meta name="last-modified" content={lastModified} />` 或 `article:modified_time`（当 ogType 为 article 时），以增强 **Trust** 与 **Freshness** 信号。

### 4.4 JSON-LD（components/JsonLd.tsx）

在 `_app` 或布局中，根据 pathname 注入 **一组** JSON-LD（可合并为 `@graph` 或分开多个 script）：

1. **WebApplication**（工具页或首页）
   - 与 SEO/GEO 规范一致：`name`、`description`、`url`、`applicationCategory: "UtilityApplication"`、`offers: { price: "0", priceCurrency: "USD" }`、`provider: { @type: Organization, name: SITE_CONFIG.brand }`。
   - **GEO §18 检索对齐**：description 保持简洁、事实化，便于 AI 抽取。
   - 若 ToolMeta 提供 `lastModified` / `datePublished`，可增加 `dateModified`、`datePublished`，强化 **Freshness** 与 **Trust**。
2. **Organization**（站点级，可每页输出一次）
   - `name`、`url`（站点首页）、可选 `logo`、`contactPoint`（若 SITE_CONFIG 扩展）。
   - 与 package.json `author: folioify` 及 GEO §14 Entity Signals 一致。
3. **BreadcrumbList**（工具页）
   - 例如：Home → Tools → “JSON to TypeScript”（或当前工具 searchTerm），`item` 用 canonical 风格 URL；利于 **内部推理线索**（GEO §12）。
4. **FAQPage**（可选，Phase 3）
   - 当某工具页配置了 FAQ 列表（如 `route.faq: { question, answer }[]`），输出 FAQPage JSON-LD；GEO §9 将 FAQ 视为「AI 问题库」，利于长尾与重组。

实现方式：

- 新建 `components/JsonLd.tsx`，接收 `pathname` 或直接接收 `toolMeta` + `isHome`，内部调用 `buildWebApplicationSchema`、`buildOrganizationSchema`、`buildBreadcrumbSchema`，输出 `<script type="application/ld+json">`。
- 服务端渲染时用 `dangerouslySetInnerHTML` 注入 JSON.stringify(schema)。

### 4.5 \_app 集成

- 从 `lib/seo` 引入 `getToolMeta`、`SITE_CONFIG`。
- 根据 `router.pathname`：
  - 首页：传固定 title/description、canonical=`SITE_CONFIG.baseUrl`、keywords（可选）、defaultOgImage。
  - 其他路径：`const meta = getToolMeta(router.pathname)`；若 `meta` 存在则传 `title/description/canonical/keywords/ogImage` 给 Meta，并渲染 `<JsonLd pathname={router.pathname} />`（或等价的 meta 传入 JsonLd）。
- 保持现有 NProgress、Navigator、ConversionPanel 等逻辑不变。

### 4.6 与 UI 设计规范（DESIGN-SPEC）的结合

- **Meta 与 Head**：不直接改页面 DOM 结构，只提供正确的 title/description/og/twitter/JSON-LD；DESIGN-SPEC 的 typography、spacing、brand 色用于页面内可见 UI。
- **工具页内“可被 AI 抽取”的 fact-chunk**（可选增强，对齐 GEO §8 Content Chunking & Fact Design）：
  - GEO：AI 检索的是 **事实** 而非长文；短段落、列表、`<strong>` 关键事实优于大段 prose。
  - 若未来在工具页增加一块“关于本工具”的文案（例如在 ConversionPanel 上方或侧栏），建议使用 DESIGN-SPEC 的 **Section Title / Section Description / Feature Card** 等组件，并在文案中体现：
    - **定价**：免费、无需注册；
    - **功能**：如“将 JSON 转为 TypeScript 类型”；
    - **目标用户**：开发者、学生等。
  - 关键事实用 **`<strong>`** 包裹，区块用 **`<section>` + 语义化标题（h2/h3）**，便于 AI 检索（与 SEO.md、GEO §8 一致）。
- **品牌色 #16F2B3**：仅影响页面内组件与 manifest/themeColor；Meta 的 og:image 若使用品牌图，视觉上与 DESIGN-SPEC 一致即可。

不强制在本期给每个工具页加整块“关于”区块；架构上预留：一旦加内容，就用同一套 fact-chunk 与 strong 规范。

---

### 4.7 GEO 页面解剖对齐（工具页升级路径）

[GEO Whitepaper §5–7](./GEO-Whitepaper.md) 将 **GEO Pillar Page** 定义为「AI 可信任的最小单元」，要求：H1 + 年份、TL;DR（80–150 字）、What Is / What Can Do、How it Works、边界说明、FAQ（≥8）、Last Updated、Related Links。

本方案对 **工具页** 的阶段性对齐建议：

| GEO 要素                  | 本期（Metadata 方案）                             | 后续（内容层）                                                             |
| ------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------- |
| **TL;DR 等价**            | `description` 简洁、事实化，可作为「答案种子」    | 页面内增加 80–150 字摘要块（DESIGN-SPEC Section Description）              |
| **What Is / What Can Do** | 通过 WebApplication `name` + `description` 表达   | 工具页上方/侧栏增加「本工具做什么 / 能做什么」短段落 + `<strong>` 关键事实 |
| **边界说明**              | 无                                                | 可选「不支持 XXX」「仅适用于 XXX」等（GEO §5 Boundary Definition）         |
| **FAQ**                   | 无                                                | 为高价值工具配置 FAQ 并输出 FAQPage JSON-LD（GEO §9）                      |
| **Last Updated**          | Meta + JSON-LD 的 `lastModified` / `dateModified` | 页面内可见「Last updated: YYYY-MM-DD」                                     |
| **Related Links**         | BreadcrumbList + 站点内链由 Navigator 提供        | 可选「相关工具」区块，强化内部推理线索（GEO §12）                          |

先完成 **Metadata + Schema**，再按需将部分工具页升级为「迷你 Pillar」形态，避免一次性改 60+ 页。

### 4.8 AI 可抓取与爬虫策略（GEO §17）

GEO §17：若 AI 无法抓取站点，GEO 无从谈起。建议：

- **robots.txt**：允许主流 AI 爬虫（如 GPTBot、ClaudeBot、Google-Extended、Perplexity 等），不在根路径整体禁止。若使用 `next.config.js` 的 `headers` 或单独 `public/robots.txt`，确保未对 `/tools/*` 做 disallow。
- **Meta**：不设置 `noindex`（除非明确为临时/测试页）；本方案中 `noindex` 仅作预留。
- **可访问性**：核心文案与 Schema 由服务端输出，减少「仅客户端渲染导致爬虫拿不到正文」的风险；当前工具页以编辑器为主，关键可检索信息集中在 `<head>` 与 JSON-LD，已满足最低要求。

实施时在 `public/robots.txt` 或文档中注明「允许 AI 爬虫」策略，并与运维/发布流程一致。

### 4.9 动态 robots.txt 与 sitemap.xml

为便于运维与 GEO 爬虫策略统一，采用 **动态生成** 而非静态文件：

| 能力            | 实现方式                                                                                        | 说明                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **robots.txt**  | `next.config.js` 将 `/robots.txt` 重写到 `/api/robots`；API 根据 `SITE_CONFIG.baseUrl` 生成正文 | 允许 `User-agent: *` 与主流 AI 爬虫（GPTBot、Google-Extended、Claude-Web、PerplexityBot 等），不 disallow `/tools/*`；末尾输出 `Sitemap: {baseUrl}/sitemap.xml`（GEO §17）。 |
| **sitemap.xml** | `/sitemap.xml` 重写到 `/api/sitemap`；API 基于 `utils/routes` 的 `routes` 生成 XML              | 首页 + 所有工具页 path 列入 `<urlset>`，`<loc>` 使用 `SITE_CONFIG.baseUrl` 拼绝对 URL；`<changefreq>weekly</changefreq>`，首页 `priority=1.0`，工具页 `priority=0.8`。       |

**涉及文件**：`next.config.js`（`rewrites`）、`pages/api/robots.ts`、`pages/api/sitemap.ts`。  
**缓存**：两接口均设置 `Cache-Control: public, max-age=86400, s-maxage=86400`（24 小时），减少重复计算。  
**数据源**：sitemap 与 SEO meta 共用 `utils/routes`，新增/下线工具页后无需手改 sitemap。

### 4.10 动态 llms.txt（AI/LLM 可读站点说明）

[llms.txt](https://llmstxt.org/) 是面向大语言模型的站点说明规范，放在站点根路径 `/llms.txt`，便于 AI 在推理时理解站点结构与关键内容（与 robots.txt/sitemap 互补）。

| 能力         | 实现方式                                                                                                   | 说明                                                                                                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **llms.txt** | `next.config.js` 将 `/llms.txt` 重写到 `/api/llms`；API 根据 `SITE_CONFIG` 与 `utils/routes` 生成 Markdown | 符合 llmstxt.org 格式：**H1** 站点名、**blockquote** 一句话摘要、段落说明、**## Tools** 下列出所有工具 `[名称](绝对 URL): 简短说明`，**## Optional** 下列出 Sitemap/Home 等可选链接。`Content-Type: text/markdown`，缓存 24h。 |

**规范要点**：H1 必填；blockquote 为项目摘要；文件列表为 `- [name](url): notes`；`## Optional` 表示可被短上下文场景跳过。  
**数据源**：与 sitemap/SEO 共用 `utils/routes`，工具列表与站点一致。  
**涉及文件**：`next.config.js`（增加 `/llms.txt` → `/api/llms`）、`pages/api/llms.ts`。

---

## 5. 数据源扩展（可选）

若希望为部分工具定制 keywords、更长 description 或独立 og 图：

- **方案 A**：在 `utils/routes.tsx` 的 `categorizedRoutes[].content[].*` 上增加可选字段：`keywords?: string[]`、`ogImage?: string`、`title?: string`；`getToolMeta` 优先使用这些字段，再回退到默认规则。
- **方案 B**：单独维护 `lib/tools-seo-overrides.ts`，结构为 `Record<string, Partial<ToolMeta>>`（key 为 path），在 `getToolMeta` 中合并 override，这样不改 routes 结构。

推荐先实现默认规则（不扩展 routes），再按需加方案 A 或 B。

### 5.1 Route SEO 字段与 Meta 对应关系

**数据流**：`utils/routes.tsx`（`categorizedRoutes[].content[].*` 可选字段）→ 扁平化为 `Route` → `lib/seo.getToolMeta(pathname)` 读取并生成 `ToolMeta` → `_app` 将 `ToolMeta` 传给 `components/Meta`（`MetaProps`）。

| utils/routes.RouteSEO（content 项可选字段） | lib/seo.ToolMeta | components/Meta.MetaProps | 说明                                                                  |
| ------------------------------------------- | ---------------- | ------------------------- | --------------------------------------------------------------------- |
| `title?`                                    | `title`          | `title`                   | 覆盖 &lt;title&gt;、og:title；未设则 `searchTerm \| SITE_CONFIG.name` |
| `desc?`                                     | `description`    | `description`             | 覆盖 meta description、og:description；未设则默认文案                 |
| —                                           | `canonical`      | `canonical`               | 由 baseUrl + pathname 生成，不在 route 配置                           |
| `keywords?`                                 | `keywords`       | `keywords`                | 覆盖 meta keywords；未设则默认数组                                    |
| `ogImage?`                                  | `ogImage`        | `ogImage`                 | 相对路径或绝对 URL；未设则站点默认                                    |
| `ogType?`                                   | `ogType`         | `ogType`                  | `"website"` \| `"article"`；未设则 `"website"`                        |
| `noindex?`                                  | `noindex`        | `noindex`                 | 为 true 时输出 meta robots noindex,nofollow                           |
| `lastModified?`                             | `lastModified`   | `lastModified`            | ISO 8601，GEO §10 新鲜度                                              |
| `datePublished?`                            | `datePublished`  | `datePublished`           | ISO 8601，GEO §10                                                     |

在 `categorizedRoutes[].content[]` 中为任意工具增加上述可选字段即可定制该页 SEO，无需改 Meta 或 \_app。

---

## 6. 文件清单与职责

| 文件                    | 操作 | 职责                                                                                                                                                             |
| ----------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/seo.ts`            | 新建 | SITE_CONFIG、getToolMeta、buildWebApplicationSchema、buildBreadcrumbSchema、buildOrganizationSchema                                                              |
| `components/Meta.tsx`   | 修改 | 增加 canonical、keywords、og:site_name、品牌化 og/twitter、使用 SITE_CONFIG                                                                                      |
| `components/JsonLd.tsx` | 新建 | 根据 pathname 输出 WebApplication + Organization + BreadcrumbList                                                                                                |
| `pages/_app.tsx`        | 修改 | 使用 getToolMeta、传完整 props 给 Meta、渲染 JsonLd                                                                                                              |
| `next.config.js`        | 修改 | `rewrites`：`/robots.txt` → `/api/robots`，`/sitemap.xml` → `/api/sitemap`，`/llms.txt` → `/api/llms`                                                            |
| `pages/api/robots.ts`   | 新建 | 动态生成 robots.txt（Allow /、AI 爬虫、Sitemap 链接），见 §4.9                                                                                                   |
| `pages/api/sitemap.ts`  | 新建 | 基于 `routes` 动态生成 sitemap.xml（首页 + 所有工具页），见 §4.9                                                                                                 |
| `pages/api/llms.ts`     | 新建 | 动态生成 llms.txt（H1 + blockquote + ## Tools 工具列表 + ## Optional），见 §4.10                                                                                 |
| `utils/routes.tsx`      | 修改 | 定义 `RouteSEO`、扩展 `Route`（title/desc/keywords/ogImage/ogType/noindex/lastModified/datePublished），与 MetaProps 对齐；getToolMeta 读取上述字段生成 ToolMeta |

---

## 7. 实施顺序建议

1. **Phase 1**：新建 `lib/seo.ts`（SITE_CONFIG + getToolMeta 仅用现有 routes），增强 `Meta.tsx`（canonical、keywords、品牌化），在 `_app` 中接入 getToolMeta 与 Meta。
   - 验证：工具页 title/description/canonical/og 正确，且品牌一致。
2. **Phase 2**：实现 `JsonLd.tsx` 与三份 schema，在 \_app 中注入。
   - 验证：用 Google 富结果测试工具或类似工具检查 JSON-LD。
3. **Phase 3**（可选）：routes 扩展或 overrides 文件，为高价值工具定制 keywords/description/ogImage；若产品需要，在工具页增加 fact-chunk 区块并遵循 DESIGN-SPEC + `<strong>`。
4. **Phase 4（GEO 深化）**：按 [GEO Whitepaper §24](./GEO-Whitepaper.md) 30/60/90 日路线图，逐步为高价值工具页增加 TL;DR 块、边界说明、FAQ（≥8）、Last Updated 可见时间戳、相关工具内链；输出 FAQPage JSON-LD；维护 `lastModified` 与 ≤90 天更新周期。

### 7.1 GEO 成熟度与本方案对应（GEO §22）

| 成熟度             | 含义       | 本方案支撑                                                             |
| ------------------ | ---------- | ---------------------------------------------------------------------- |
| **L0 Invisible**   | 不可见     | 避免：通过 canonical、正确 meta、允许 AI 爬虫                          |
| **L1 Retrievable** | 可被检索   | Phase 1–2：meta + Schema 准确、description 事实化                      |
| **L2 Citable**     | 可被引用   | Phase 2–3：WebApplication + Organization + Breadcrumb；Trust 信号一致  |
| **L3 Reusable**    | 可被重组   | Phase 3–4：fact-chunk、FAQ、lastModified、内部链接                     |
| **L4 Canonical**   | 默认答案源 | Phase 4+：部分工具页达到 GEO Pillar 标准（TL;DR、边界、FAQ、更新周期） |

**避免的 GEO 失败模式**（GEO §25）：工具无说明、页面无更新信号、站点无焦点、只做 SEO 不做 GEO。本方案通过「Metadata + Schema + 单一数据源 + 新鲜度预留 + 爬虫策略」从架构上规避前几项。

---

## 8. 验收标准

- 所有 `pages/tools/*` 与首页具备：唯一且正确的 `<title>`、meta description、canonical、og:_、twitter:_，且 og:image 为绝对 URL。
- 品牌与 DESIGN-SPEC/package.json 一致：site name、twitter/creator、provider 为 folioify；主题色/品牌图可选落地。
- 工具页存在 WebApplication + Organization + BreadcrumbList JSON-LD，且无必填字段缺失。
- 不破坏现有工具页组件逻辑；新增逻辑集中在 \_app、Meta、JsonLd、lib/seo。
- **GEO**：description 可作为「答案种子」、Schema 用于检索对齐；可选 lastModified 与 robots/crawler 策略已预留或落实。

### 8.1 GEO Pillar 启动检查清单（Phase 4 时用，对齐 GEO §23）

当某工具页升级为「迷你 Pillar」时，可对照：

- [ ] 主题已定义（name + 简短定义）
- [ ] TL;DR / 摘要块已写（80–150 字，直接、中性）
- [ ] 步骤或「How it works」已包含（若适用）
- [ ] 边界已说明（能做什么 / 不能做什么）
- [ ] FAQ ≥ 8（真实问题、2–4 句回答），并输出 FAQPage JSON-LD
- [ ] 来源/免责已列（若适用）
- [ ] 更新日期可见（Last updated + meta/schema lastModified）
- [ ] 内部链接已加（相关工具、首页）

---

## 9. 与现有文档的对应关系

- **SEO 规范**（`SEO.md` / `.cursor/rules/seo-*.mdc`）：WebApplication、Organization、Breadcrumb、fact-chunk、`<strong>`、信息可抽取性 —— 本方案通过 getToolMeta + JsonLd + 可选页面 fact-chunk 满足；**TDK 差异化**（每页可区分的 title/description/keywords）见 [§11 TDK 差异化与模板化风险](#11-tdk-差异化与模板化风险seo-专家视角)。
- **DESIGN-SPEC**（`docs/DESIGN-SPEC-LIGHT-THEME-BRAND.md`）：品牌 #16F2B3、folioify、light theme —— 本方案通过 SITE_CONFIG、品牌化 og/twitter 与预留的 themeColor/og 图视觉一致；页面内 UI 仍按 DESIGN-SPEC 的组件与样式实现。
- **package.json**：`author: folioify` —— 本方案中 Organization 与 twitter 使用 folioify 品牌名，与 author 对齐。
- **GEO Whitepaper**（`docs/GEO-Whitepaper.md`）：Generative Engine Optimization、可引用来源、Answer Supply Chain（Retrievability / Trust / Reusability / Freshness）、GEO Pillar 结构、Schema 检索对齐、实体信号、AI 爬虫策略、成熟度 L0–L4 —— 本方案在 Metadata + Schema + 数据源层面对齐 GEO，并为工具页向 Pillar 形态升级预留路径（§4.7、§4.8、§7.1、§8.1）。

---

## 10. 实施记录（Implementation Log）

### 2026-02-01 Phase 1 & Phase 2 落地

| 步骤                                            | 状态 | 说明                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 1.1** 新建 `lib/seo.ts`                 | ✅   | 实现 `SITE_CONFIG`（baseUrl、siteName、brand、defaultOgImage、twitterHandle、locale、themeColor）、`getToolMeta(pathname)`（首页固定 meta，工具页基于 `activeRouteData` 生成 title/description/canonical/keywords/ogImage，支持 route 扩展 title/keywords/ogImage/lastModified/datePublished）、`buildWebApplicationSchema`、`buildOrganizationSchema`、`buildBreadcrumbSchema`。       |
| **Phase 1.2** 增强 `components/Meta.tsx`        | ✅   | 新增 `MetaProps`：canonical、keywords、ogImage、ogType、noindex、lastModified、datePublished。输出 `<link rel="canonical">`、`<meta name="keywords">`、`og:url`/`og:site_name`/`og:image`（绝对 URL）、`og:locale`、`twitter:site`/`twitter:creator` 统一为 `SITE_CONFIG.twitterHandle`，品牌与 DESIGN-SEC 一致；支持 `last-modified` 与 `article:modified_time`（ogType=article 时）。 |
| **Phase 1.3** `_app.tsx` 接入                   | ✅   | 使用 `getToolMeta(router.pathname)` 替代原 `activeRouteData` 分支；将完整 props（title、description、canonical、keywords、ogImage、lastModified、datePublished）传入 `Meta`；未知路径回退为站点默认 meta。                                                                                                                                                                              |
| **Phase 2** 新建 `components/JsonLd.tsx` 并注入 | ✅   | 根据 pathname 调用 `getToolMeta`，输出合并为 `@graph` 的 JSON-LD：WebApplication（name、description、url、applicationCategory、offers、provider、可选 dateModified/datePublished）、Organization（name、url）、BreadcrumbList（Home → 当前工具）；在 `_app` 中渲染 `<JsonLd pathname={router.pathname} />`。                                                                            |

**涉及文件**：

- **新建**：`lib/seo.ts`、`components/JsonLd.tsx`
- **修改**：`components/Meta.tsx`、`pages/_app.tsx`
- **后续**：`utils/routes.tsx` 已扩展 `RouteSEO`/`Route` 与 Meta 对齐（见 §5.1、§10「Route SEO 字段与 Meta 对齐」）

**验收**：工具页与首页具备唯一 title、meta description、canonical、og/twitter、keywords；og:image 为绝对 URL；twitter:creator/site 为 @geekskai；WebApplication + Organization + BreadcrumbList JSON-LD 已注入；工具页业务逻辑未改动。

**后续**：Phase 3 可按需在 routes 或 `lib/tools-seo-overrides.ts` 为高价值工具定制 keywords/description/ogImage；Phase 4 按 GEO Pillar 增加 TL;DR、FAQ、Last Updated 等（见 §4.7、§8.1）。

---

### 2026-02-07 工具页 SEO 注入对齐

| 步骤                  | 状态 | 说明                                                                                            |
| --------------------- | ---- | ----------------------------------------------------------------------------------------------- |
| **pages/\_app.tsx**   | ✅   | 对齐参考实现：注入 Meta/JsonLd、接入 getToolMeta、工具页使用 ToolPageLayout，并保留 NProgress。 |
| **components/Meta**   | ✅   | 继续统一 canonical、og/twitter、keywords 与 brand/locale 字段（已符合规范）。                   |
| **components/JsonLd** | ✅   | 按 pathname 输出 WebApplication + Organization + BreadcrumbList（已符合规范）。                 |

**验收**：所有 `pages/tools/*` 通过 `_app` 自动获得完整 SEO 元数据与 JSON-LD，无需逐页改动。

---

### 2026-02-01 动态 robots.txt 与 sitemap

| 步骤                     | 状态 | 说明                                                                                                                                                                                                               |
| ------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **next.config.js**       | ✅   | 增加 `async rewrites()`：`/robots.txt` → `/api/robots`，`/sitemap.xml` → `/api/sitemap`。                                                                                                                          |
| **pages/api/robots.ts**  | ✅   | 动态生成 robots.txt：`User-agent: *` Allow `/`；显式允许 GPTBot、Google-Extended、Claude-Web、PerplexityBot；`Sitemap: {baseUrl}/sitemap.xml`；`Content-Type: text/plain`，缓存 24h。                              |
| **pages/api/sitemap.ts** | ✅   | 基于 `utils/routes` 的 `routes` 生成 sitemap XML：首页 + 所有工具 path，`<loc>` 为 `SITE_CONFIG.baseUrl` 绝对 URL，`changefreq=weekly`，首页 priority 1.0、工具页 0.8；`Content-Type: application/xml`，缓存 24h。 |
| **文档**                 | ✅   | 新增 §4.9 动态 robots.txt 与 sitemap；§6 文件清单补充 `next.config.js`、`pages/api/robots.ts`、`pages/api/sitemap.ts`。                                                                                            |

**验收**：访问 `{baseUrl}/robots.txt` 可见 Allow / 与 Sitemap 链接；访问 `{baseUrl}/sitemap.xml` 可见首页及所有工具页 URL；与 GEO §17 爬虫策略一致。

### 2026-02-01 动态 llms.txt（AI 可爬取站点说明）

| 步骤                  | 状态 | 说明                                                                                                                                                                                                                                             |
| --------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **next.config.js**    | ✅   | 增加 rewrite：`/llms.txt` → `/api/llms`。                                                                                                                                                                                                        |
| **pages/api/llms.ts** | ✅   | 按 [llmstxt.org](https://llmstxt.org/) 规范动态生成 Markdown：H1 站点名、blockquote 一句话摘要、段落说明、## Tools 下列出所有工具 `[searchTerm](baseUrl+path): desc`、## Optional 下列出 Sitemap/Home；`Content-Type: text/markdown`，缓存 24h。 |
| **文档**              | ✅   | 新增 §4.10 动态 llms.txt；§6 文件清单补充 `pages/api/llms.ts`。                                                                                                                                                                                  |

**验收**：访问 `{baseUrl}/llms.txt` 可见 Markdown 格式站点说明与工具列表；AI/LLM 可据此理解站点结构与工具入口。

---

### 2026-02-01 Route SEO 字段与 Meta 对齐

| 步骤                    | 状态 | 说明                                                                                                                                                                                                                                                            |
| ----------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **utils/routes.tsx**    | ✅   | 定义 `RouteSEO` 接口（title、desc、keywords、ogImage、ogType、noindex、lastModified、datePublished），与 `MetaProps` 一一对应；扩展 `Route` 含上述可选字段；扁平化时 `...x` 保留 content 项上的 SEO 字段；`activeRouteData` 返回类型改为 `Route \| undefined`。 |
| **lib/seo.ts**          | ✅   | 使用 `Route` 类型替代断言；`ToolMeta` 增加 `noindex?`、`ogType` 支持 `"article"`；`getToolMeta` 从 `route` 读取并透传 `ogType`、`noindex`、`lastModified`、`datePublished`。                                                                                    |
| **components/Meta.tsx** | ✅   | 注释标明 `MetaProps` 与 `RouteSEO`/`ToolMeta` 对齐，由 `getToolMeta` 传入。                                                                                                                                                                                     |
| **pages/\_app.tsx**     | ✅   | 向 `Meta` 传入 `ogType`、`noindex`。                                                                                                                                                                                                                            |
| **文档**                | ✅   | 新增 §5.1 Route SEO 字段与 Meta 对应关系（RouteSEO ↔ ToolMeta ↔ MetaProps 表）；§6 中 `utils/routes.tsx` 职责更新为「定义 RouteSEO、扩展 Route，与 MetaProps 对齐」。                                                                                           |

**数据流**：`categorizedRoutes[].content[].*`（可选 RouteSEO 字段）→ 扁平化为 `Route` → `getToolMeta(pathname)` 生成 `ToolMeta` → `_app` 将 `ToolMeta` 传给 `Meta(MetaProps)`。在 routes 中为任意工具配置 `title`/`desc`/`keywords`/`ogImage`/`ogType`/`noindex`/`lastModified`/`datePublished` 即可定制该页 SEO。

---

### 2026-02-01 全量工具页 GEO/SEO 字段完善

按 [GEO Whitepaper](./GEO-Whitepaper.md) §5（TL;DR/answer seed）、§8（fact design）、§10（freshness）要求，为 **所有工具页** 在 `utils/routes.tsx` 的 `categorizedRoutes[].content[]` 中补全 RouteSEO 字段。

| 步骤                 | 状态 | 说明                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **utils/routes.tsx** | ✅   | 为 SVG、HTML、JSON、JSON Schema、CSS、JavaScript、GraphQL、JSON-LD、TypeScript、Flow、Others 共 **60+ 工具** 逐条增加：`desc`（80–155 字，事实化「Free online tool to convert X to Y. No signup, runs in browser. By Folioify.」）、`keywords`（工具名 + online converter、free tool、folioify）、`lastModified: "2026-02-01"`（GEO §10 新鲜度）。首页与已有自定义 title/desc 的条目保留原值并补齐 keywords/lastModified。 |
| **未改**             | —    | `ogImage`、`ogType`、`noindex`、`datePublished` 仍按需在单条 route 上可选配置；本次仅批量补全 desc/keywords/lastModified。                                                                                                                                                                                                                                                                                                 |

**GEO 对齐**：description 作为「答案种子」可被 AI 抽取；keywords 利于检索；lastModified 满足 GEO §10 更新周期（≤90 天）与 Trust 信号。

**验收**：任意工具页的 meta description、keywords、JSON-LD dateModified 均来自 routes 配置；首页与 json-to-proptypes 等自定义 title/desc 保持不变。

---

## 11. TDK 差异化与模板化风险（SEO 专家视角）

### 11.1 现状简述

当前 60+ 工具页的 SEO TDK（Title、Description、Keywords）高度模板化：

- **Title**：多数未单独配置，回退为 `searchTerm | SITE_CONFIG.name`，仅首页与个别工具（如 json-to-proptypes）有自定义 title。
- **Description**：几乎统一为「Free online tool to convert X to Y. No signup, runs in browser. By Folioify.」句式，仅替换「X to Y」。
- **Keywords**：每页均为「[工具名], [相关词], online converter, free tool, folioify」五词结构，尾部三词全站一致。

### 11.2 专家结论：模板化是否合理？

**结论：从全球资深谷歌 SEO 与 GEO（Generative Engine Optimization）视角看，全站套用同一 TDK 模版不合理，应按页面做差异化。**

理由概述：

| 维度              | 模板化的风险                                                                                                                                        | 差异化后的收益                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **传统 SEO**      | 大量页面 description/语义高度相似，易被判定为重复或近重复内容，不利于单页排名；SERP 中标题与摘要同质化导致 CTR 偏低；查询意图与页面一一对应关系弱。 | 每页有唯一、可区分的 title/description，利于查询-页面相关性、点击率与长尾词覆盖。 |
| **站内竞争**      | 多工具页竞争相同泛词（如 "online converter"、"free tool"），站内权重分散，难以形成单页权威。                                                        | 每页主关键词与长尾词不同，站内自竞争减弱，利于核心页与长尾页分工。                |
| **GEO / AI 检索** | 描述雷同时，AI 在检索与重组答案时难以选出「最匹配」页面，可引用性与溯源清晰度下降。                                                                 | 描述事实化且按工具区分，利于 AI 抽取、信任与正确引用对应工具页。                  |

因此：**在保持品牌（Folioify）、免费、无需注册等统一信息的前提下，应对每页的 title、description、keywords 做差异化配置或生成。**

### 11.3 修改原则与建议

#### Title

- **唯一性**：每个工具页应有独立、可识别的 title，避免仅「searchTerm | 品牌」的千篇一律。
- **主关键词前置**：核心转化词（如「JSON to TypeScript」「SVG to JSX」）尽量靠前，便于 SERP 与 AI 理解页面主题。
- **长度**：建议 50–60 字符内（含空格），保证在结果页完整展示。
- **可选结构**：`{主关键词} Converter | Free Online Tool | {品牌}` 或 `Convert {X} to {Y} Online | {品牌}`，按工具选择一种并统一风格。

**示例（差异化）**：

- JSON to TypeScript：`JSON to TypeScript Converter | Free Online Tool | Folioify`
- SVG to JSX：`SVG to JSX Converter | Free React Component Tool | Folioify`
- HTML to Pug：`HTML to Pug Converter | Free Online | Folioify`

#### Description

- **长度**：80–155 字符（meta description 与 GEO「答案种子」兼顾）。
- **首句含主关键词**：前 80 字符内出现工具核心词，利于相关性。
- **避免整句套话完全一致**：保留「免费」「无需注册」「浏览器内运行」「Folioify」等要素，但句式与侧重点按工具轮换，例如：
  - **用例型**：「Generate TypeScript interfaces from JSON for type-safe APIs. Free, no signup. By Folioify.」
  - **受众型**：「For developers: convert JSON to Mongoose schema in the browser. No signup. By Folioify.」
  - **差异化型**：「Convert SVG to React Native components. Supports inline styles. Free, runs in browser. By Folioify.」
- **可选**：在末尾加简短 CTA 或新鲜度（如「Try free. Updated 2026.」），与 lastModified 呼应。

**示例（模板 vs 差异化）**：

| 工具                | 模板化（不推荐）                                                                                     | 差异化（推荐）                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| JSON to TypeScript  | Free online tool to convert JSON to TypeScript types. No signup, runs in browser. By Folioify.       | Generate TypeScript types from JSON. Free, no signup, runs in browser. By Folioify.    |
| JSON to Mongoose    | Free online tool to convert JSON to Mongoose schema. No signup, runs in browser. By Folioify.        | Convert JSON to Mongoose schema for Node.js. Free, in-browser, no signup. By Folioify. |
| SVG to React Native | Free online tool to convert SVG to React Native components. No signup, runs in browser. By Folioify. | SVG to React Native: convert SVGs to RN components. Free, no signup. By Folioify.      |

#### Keywords

- **数量**：每页 5–8 个为宜，避免堆砌。
- **结构建议**：
  - **1–2 个主关键词**：精确工具名（如「JSON to TypeScript」「JSON to TS」）。
  - **2–3 个语义/长尾**：同义、问句或场景词（如「generate TypeScript from JSON」「JSON type generator」「JSON to TS types」）。
  - **1–2 个类目词**：如「online converter」「developer tool」。
  - **1 个品牌词**：folioify。
- **避免**：每页末尾固定「online converter, free tool, folioify」三词完全一致，可保留其中 1–2 个并与其他词搭配，或替换为更贴近该工具的词（如「TypeScript generator」「schema generator」）。

**示例（差异化）**：

- JSON to TypeScript：`JSON to TypeScript`, `JSON to TS`, `generate TypeScript from JSON`, `JSON type generator`, `online converter`, `free tool`, `folioify`
- HTML to Pug：`HTML to Pug`, `HTML to Jade`, `Pug converter`, `HTML to template`, `online converter`, `free tool`, `folioify`

### 11.4 实施建议

1. **高价值/流量工具优先**：对核心工具（如首页、JSON to TypeScript、SVG to JSX、HTML to JSX 等）在 `utils/routes.tsx` 或 `lib/tools-seo-overrides.ts` 中单独配置 **title**、**desc**、**keywords**，完全按 §11.3 差异化。
2. **其余工具分批优化**：先按类别（如 JSON、CSS、GraphQL）为每类设计 2–3 种 description 句式与 keyword 组合，再逐条替换模板化文案，避免一次性机械替换。
3. **默认规则增强（可选）**：在 `lib/seo.ts` 的 `getToolMeta` 中，当 route 未提供 `title`/`desc`/`keywords` 时，可用「基于 path/label 的生成规则」产出略多样化的 fallback（例如根据 path 提取「X」「Y」生成不同句式），而不是全站同一句。
4. **与现有方案的关系**：不改变 §4、§5 的架构；仍以 `routes`（或 overrides）为单一数据源，仅将每页的 TDK 从「全模板」改为「按页配置或按规则生成」，并保留 lastModified、canonical、Schema 等既有设计。

### 11.5 验收要点

- 任意两个工具页的 **meta description** 不全相同（允许品牌句相同，但主体句应有可区分度）。
- 高价值工具页具备 **自定义 title**，且主关键词在 title 中靠前。
- **keywords** 在站内不出现「每页完全相同的 3–5 词尾部」；至少主关键词与 1–2 个语义词按工具不同。
- 上述改动与 GEO §5–§10（TL;DR/answer seed、fact design、freshness）及 §18（Schema 检索对齐）无冲突；description 仍可作为答案种子，且更利于 AI 选出正确页面引用。

---

**文档版本**：1.7  
**最后更新**：2026-02-01  
**变更**：新增 §11 TDK 差异化与模板化风险（SEO 专家视角）；设计原则 §2 增加「TDK 差异化」原则并引用 §11。
