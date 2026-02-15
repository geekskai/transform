import React from "react";
import flatten from "lodash/flatten";
import find from "lodash/find";

/**
 * SEO 可选字段（与 components/Meta.tsx MetaProps 对齐，由 lib/seo.getToolMeta 读取）
 * 在 categorizedRoutes[].content[].* 上可配置，用于覆盖默认生成的 title/description/keywords/ogImage 等
 * @see docs/SEO-METADATA-DESIGN.md §5
 */
export interface RouteSEO {
  /** 覆盖 <title>、og:title、twitter:title；未设则用 searchTerm | SITE_CONFIG.name */
  title?: string;
  /** 覆盖 meta description、og:description；未设则用 "An online playground to convert {searchTerm}" */
  desc?: string;
  /** 覆盖 meta keywords；未设则用 [searchTerm, "online converter", "free tool", brand] */
  keywords?: string[];
  /** 覆盖 og:image、twitter:image；可为相对路径或绝对 URL */
  ogImage?: string;
  /** 覆盖 og:type；未设则 "website" */
  ogType?: "website" | "article";
  /** 设为 true 时输出 meta robots noindex,nofollow */
  noindex?: boolean;
  /** GEO §10 新鲜度：ISO 8601，用于 meta last-modified、JSON-LD dateModified */
  lastModified?: string;
  /** GEO §10：ISO 8601，用于 JSON-LD datePublished、article:published_time */
  datePublished?: string;
}

const DEFAULT_LAST_MODIFIED = "2026-02-07";
const buildDefaultTitle = (label: string) =>
  `${label} Converter | Free Online Tool | Folioify`;
const buildDefaultDesc = (label: string) =>
  `Free online tool to convert ${label}. No signup, runs in browser. By Folioify.`;
const buildDefaultKeywords = (label: string) => [
  label,
  "online converter",
  "free tool",
  "folioify"
];

export const categorizedRoutes = [
  {
    category: "SVG",
    content: [
      {
        label: "to JSX",
        path: "/tools/svg-to-jsx",
        packageName: "@svgr/core",
        packageUrl: "https://github.com/smooth-code/svgr",
        title: "SVG to JSX Converter | Free Online Tool | Folioify",
        desc:
          "Convert SVG to React JSX components. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "SVG to JSX",
          "SVG to React",
          "JSX converter",
          "online converter",
          "free tool",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to React Native",
        path: "/tools/svg-to-react-native",
        packageName: "@svgr/core",
        packageUrl: "https://github.com/smooth-code/svgr",
        title: "SVG to React Native Converter | Free Online Tool | Folioify",
        desc:
          "SVG to React Native: convert SVGs to RN components with inline styles. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "SVG to React Native",
          "SVG to RN",
          "React Native SVG",
          "SVG converter",
          "developer tool",
          "folioify"
        ],
        lastModified: "2026-02-01"
      }
    ]
  },
  {
    category: "HTML",
    content: [
      {
        label: "to JSX",
        path: "/tools/html-to-jsx",
        title: "HTML to JSX Converter | Free Online Tool | Folioify",
        desc:
          "Paste HTML, get React JSX. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "HTML to JSX",
          "HTML to React",
          "JSX converter",
          "React JSX",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Pug",
        path: "/tools/html-to-pug",
        packageName: "html2pug",
        packageUrl: "https://github.com/izolate/html2pug",
        title: "HTML to Pug Converter | Free Online | Folioify",
        desc:
          "Convert HTML to Pug (Jade) template syntax. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "HTML to Pug",
          "HTML to Jade",
          "Pug converter",
          "template converter",
          "developer tool",
          "folioify"
        ],
        lastModified: "2026-02-01"
      }
    ]
  },
  {
    category: "JSON",
    content: [
      {
        label: "to React PropTypes",
        path: "/tools/json-to-proptypes",
        title: "Folioify | All important transforms at one place.",
        desc:
          "Generate React PropTypes from JSON sample. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "JSON to PropTypes",
          "React PropTypes",
          "propTypes generator",
          "online converter",
          "developer tool",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Flow",
        path: "/tools/json-to-flow",
        title: "JSON to Flow Converter | Free Online Tool | Folioify",
        desc:
          "Generate Flow type definitions from JSON. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "JSON to Flow",
          "Flow types",
          "Flow type generator",
          "online converter",
          "developer tool",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to GraphQL",
        path: "/tools/json-to-graphql",
        packageName: "@walmartlabs/json-to-simple-graphql-schema",
        packageUrl:
          "https://github.com/walmartlabs/json-to-simple-graphql-schema",
        title: "JSON to GraphQL Schema Converter | Free Online | Folioify",
        desc:
          "Convert JSON sample to GraphQL schema. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "JSON to GraphQL",
          "GraphQL schema",
          "schema generator",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to TypeScript",
        path: "/tools/json-to-typescript",
        packageUrl: "https://www.npmjs.com/package/json_typegen_wasm",
        packageName: "json_typegen_wasm",
        title: "JSON to TypeScript Converter | Free Online Tool | Folioify",
        desc:
          "Generate TypeScript types from JSON. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "JSON to TypeScript",
          "JSON to TS",
          "generate TypeScript from JSON",
          "JSON type generator",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to MobX-State-Tree Model",
        path: "/tools/json-to-mobx-state-tree",
        title: "JSON to MobX-State-Tree Converter | Free Online | Folioify",
        desc:
          "Convert JSON to MobX-State-Tree (MST) model. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "JSON to MobX-State-Tree",
          "MST",
          "MobX-State-Tree model",
          "online converter",
          "developer tool",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Sarcastic",
        path: "/tools/json-to-sarcastic",
        packageName: "transform-json-types",
        packageUrl: "https://github.com/transform-it/transform-json-types",
        title: "JSON to Sarcastic Converter | Free Online Tool | Folioify",
        desc:
          "Generate Sarcastic runtime types from JSON. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "JSON to Sarcastic",
          "Sarcastic types",
          "runtime types",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to io-ts",
        path: "/tools/json-to-io-ts",
        packageName: "transform-json-types",
        packageUrl: "https://github.com/transform-it/transform-json-types",
        title: "JSON to io-ts Converter | Free Online | Folioify",
        desc:
          "Generate io-ts codec types from JSON. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "JSON to io-ts",
          "io-ts",
          "io-ts codec",
          "runtime validation",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Rust Serde",
        path: "/tools/json-to-rust-serde",
        title: "JSON to Rust Serde Converter | Free Online Tool | Folioify",
        desc:
          "Convert JSON to Rust Serde structs. Free REPL, no signup, runs in browser. By Folioify.",
        keywords: [
          "JSON to Rust Serde",
          "Rust Serde",
          "Rust struct",
          "online converter",
          "developer tool",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Mongoose Schema",
        path: "/tools/json-to-mongoose",
        packageName: "generate-schema",
        packageUrl: "https://github.com/nijikokun/generate-schema",
        title: "JSON to Mongoose Schema Converter | Free Online | Folioify",
        desc:
          "Convert JSON to Mongoose schema for Node.js. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "JSON to Mongoose",
          "Mongoose schema",
          "Node.js schema",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Big Query Schema",
        path: "/tools/json-to-big-query",
        packageName: "generate-schema",
        packageUrl: "https://github.com/nijikokun/generate-schema",
        title: "JSON to BigQuery Schema Converter | Free Online | Folioify",
        desc:
          "Generate BigQuery table schema from JSON. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "JSON to Big Query",
          "BigQuery schema",
          "GCP schema",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to MySQL",
        path: "/tools/json-to-mysql",
        packageName: "generate-schema",
        packageUrl: "https://github.com/nijikokun/generate-schema",
        title: "JSON to MySQL Schema Converter | Free Online | Folioify",
        desc:
          "Convert JSON to MySQL CREATE TABLE schema. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "JSON to MySQL",
          "MySQL schema",
          "SQL schema generator",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Scala Case Class",
        path: "/tools/json-to-scala-case-class",
        title: "JSON to Scala Case Class Converter | Free Online | Folioify",
        desc:
          "Generate Scala case class from JSON. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "JSON to Scala",
          "Scala case class",
          "Scala types",
          "online converter",
          "developer tool",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Go Struct",
        path: "/tools/json-to-go",
        packageName: "json-to-go",
        packageUrl: "https://github.com/mholt/json-to-go",
        title: "JSON to Go Struct Converter | Free Online Tool | Folioify",
        desc:
          "Convert JSON to Go struct. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "JSON to Go",
          "Go struct",
          "golang struct",
          "online converter",
          "developer tool",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Go Bson",
        path: "/tools/json-to-go-bson",
        title: "JSON to Go BSON Converter | Free Online | Folioify",
        desc:
          "Generate Go BSON struct tags from JSON. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "JSON to Go BSON",
          "Go BSON",
          "MongoDB Go",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to YAML",
        path: "/tools/json-to-yaml",
        packageName: "json2yaml",
        packageUrl: "https://github.com/jeffsu/json2yaml",
        title: "JSON to YAML Converter | Free Online Tool | Folioify",
        desc:
          "Convert JSON to YAML. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "JSON to YAML",
          "YAML converter",
          "config converter",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to JSDoc",
        path: "/tools/json-to-jsdoc",
        title: "JSON to JSDoc Converter | Free Online | Folioify",
        desc:
          "Generate JSDoc type comments from JSON. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "JSON to JSDoc",
          "JSDoc",
          "JSDoc types",
          "online converter",
          "developer tool",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Kotlin",
        path: "/tools/json-to-kotlin",
        packageUrl: "https://www.npmjs.com/package/json_typegen_wasm",
        packageName: "json_typegen_wasm",
        title: "JSON to Kotlin Converter | Free Online Tool | Folioify",
        desc:
          "Generate Kotlin data class from JSON. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "JSON to Kotlin",
          "Kotlin data class",
          "Kotlin types",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Java",
        path: "/tools/json-to-java",
        packageUrl: "https://www.npmjs.com/package/json_typegen_wasm",
        packageName: "json_typegen_wasm",
        title: "JSON to Java Converter | Free Online Tool | Folioify",
        desc:
          "Generate Java class from JSON. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "JSON to Java",
          "Java class",
          "Java POJO",
          "online converter",
          "developer tool",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to JSON Schema",
        path: "/tools/json-to-json-schema",
        packageUrl: "https://www.npmjs.com/package/json_typegen_wasm",
        packageName: "json_typegen_wasm",
        title: "JSON to JSON Schema Converter | Free Online | Folioify",
        desc:
          "Infer JSON Schema from JSON sample. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "JSON to JSON Schema",
          "JSON Schema",
          "schema inference",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to TOML",
        path: "/tools/json-to-toml",
        packageUrl: "https://www.npmjs.com/package/@iarna/toml",
        packageName: "@iarna/toml",
        title: "JSON to TOML Converter | Free Online Tool | Folioify",
        desc:
          "Convert JSON to TOML config format. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "JSON to TOML",
          "TOML converter",
          "config format",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Zod Schema",
        path: "/tools/json-to-zod",
        packageUrl: "https://www.npmjs.com/package/json-to-zod",
        packageName: "json-to-zod",
        title: "JSON to Zod Converter | Free Online Tool | Folioify",
        desc:
          "Generate Zod schema from JSON. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "JSON to Zod",
          "Zod schema",
          "Zod validation",
          "online converter",
          "developer tool",
          "folioify"
        ],
        lastModified: "2026-02-01"
      }
    ]
  },
  {
    category: "JSON Schema",
    content: [
      {
        label: "to TypeScript",
        path: "/tools/json-schema-to-typescript",
        packageName: "json-schema-to-typescript",
        packageUrl: "https://github.com/bcherny/json-schema-to-typescript",
        title: "JSON Schema to TypeScript Converter | Free Online | Folioify",
        desc:
          "Generate TypeScript types from JSON Schema. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "JSON Schema to TypeScript",
          "JSON Schema",
          "TypeScript generator",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to OpenAPI Schema",
        path: "/tools/json-schema-to-openapi-schema",
        packageName: "json-schema-to-openapi-schema",
        packageUrl:
          "https://github.com/openapi-contrib/json-schema-to-openapi-schema",
        title: "JSON Schema to OpenAPI Converter | Free Online | Folioify",
        desc:
          "Convert JSON Schema to OpenAPI 3.x schema. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "JSON Schema to OpenAPI",
          "OpenAPI",
          "OpenAPI schema",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Protobuf",
        path: "/tools/json-schema-to-protobuf",
        packageName: "jsonschema-protobuf",
        packageUrl: "https://github.com/okdistribute/jsonschema-protobuf",
        title: "JSON Schema to Protobuf Converter | Free Online | Folioify",
        desc:
          "Convert JSON Schema to Protocol Buffers. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "JSON Schema to Protobuf",
          "Protobuf",
          "protocol buffers",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Zod Schema",
        path: "/tools/json-schema-to-zod",
        packageName: "json-schema-to-zod",
        packageUrl: "https://www.npmjs.com/package/json-schema-to-zod",
        title: "JSON Schema to Zod Converter | Free Online | Folioify",
        desc:
          "Generate Zod schema from JSON Schema. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "JSON Schema to Zod",
          "Zod",
          "Zod schema",
          "online converter",
          "developer tool",
          "folioify"
        ],
        lastModified: "2026-02-01"
      }
    ]
  },
  {
    category: "CSS",
    content: [
      {
        label: "to JS Objects",
        path: "/tools/css-to-js",
        packageName: "transform-css-to-js",
        packageUrl: "https://github.com/transform-it/transform-css-to-js",
        title: "CSS to JS Objects Converter | Free Online Tool | Folioify",
        desc:
          "Convert CSS to JavaScript style objects. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "CSS to JS",
          "CSS to JavaScript",
          "style objects",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to template literal",
        path: "/tools/object-styles-to-template-literal",
        packageUrl:
          "https://github.com/satya164/babel-plugin-object-styles-to-template",
        packageName: "babel-plugin-object-styles-to-template",
        title:
          "Object Styles to Template Literal Converter | Free Online | Folioify",
        desc:
          "Convert object styles to styled-components template literal. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "object styles to template",
          "CSS-in-JS",
          "styled-components",
          "template literal",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to TailwindCSS",
        path: "/tools/css-to-tailwind",
        packageUrl: "https://github.com/Jackardios/css-to-tailwindcss",
        packageName: "css-to-tailwindcss",
        title: "CSS to Tailwind Converter | Free Online Tool | Folioify",
        desc:
          "Convert CSS to TailwindCSS utility classes. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "CSS to Tailwind",
          "TailwindCSS",
          "Tailwind converter",
          "utility classes",
          "folioify"
        ],
        lastModified: "2026-02-01"
      }
    ]
  },
  {
    category: "JavaScript",
    content: [
      {
        label: "to JSON",
        path: "/tools/js-object-to-json",
        title: "JS Object to JSON Converter | Free Online Tool | Folioify",
        desc:
          "Convert JS object to JSON in browser REPL. Free, no signup. By Folioify.",
        keywords: [
          "JS to JSON",
          "JavaScript to JSON",
          "object to JSON",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Typescript",
        path: "/tools/js-object-to-typescript",
        title: "JS Object to TypeScript Converter | Free Online | Folioify",
        desc:
          "Convert JS object to TypeScript types in browser REPL. Free, no signup. By Folioify.",
        keywords: [
          "JS to TypeScript",
          "JavaScript to TypeScript",
          "object to TS",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      }
    ]
  },
  {
    category: "GraphQL",
    content: [
      {
        label: "to TypeScript",
        path: "/tools/graphql-to-typescript",
        title: "GraphQL to TypeScript Converter | Free Online Tool | Folioify",
        desc:
          "Generate TypeScript types from GraphQL schema. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "GraphQL to TypeScript",
          "GraphQL types",
          "codegen",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Flow",
        path: "/tools/graphql-to-flow",
        title: "GraphQL to Flow Converter | Free Online | Folioify",
        desc:
          "Generate Flow types from GraphQL schema. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "GraphQL to Flow",
          "Flow types",
          "GraphQL codegen",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to JAVA",
        path: "/tools/graphql-to-java",
        title: "GraphQL to Java Converter | Free Online | Folioify",
        desc:
          "Generate Java types from GraphQL schema. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "GraphQL to Java",
          "GraphQL Java",
          "Java codegen",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Resolvers Signature",
        path: "/tools/graphql-to-resolvers-signature",
        title: "GraphQL Resolvers Signature Generator | Free Online | Folioify",
        desc:
          "Generate GraphQL resolvers type signatures. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "GraphQL resolvers",
          "resolvers signature",
          "GraphQL codegen",
          "developer tool",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Introspection JSON",
        path: "/tools/graphql-to-introspection-json",
        title:
          "GraphQL to Introspection JSON Converter | Free Online | Folioify",
        desc:
          "Convert GraphQL schema to introspection JSON. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "GraphQL introspection",
          "introspection JSON",
          "schema export",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Schema AST",
        path: "/tools/graphql-to-schema-ast",
        title: "GraphQL to Schema AST Converter | Free Online | Folioify",
        desc:
          "Convert GraphQL to schema AST. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "GraphQL schema AST",
          "GraphQL AST",
          "schema parser",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Fragment Matcher",
        path: "/tools/graphql-to-fragment-matcher",
        title: "GraphQL Fragment Matcher Generator | Free Online | Folioify",
        desc:
          "Generate GraphQL fragment matcher for Apollo. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "GraphQL fragment matcher",
          "Apollo fragment",
          "GraphQL client",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Components",
        path: "/tools/graphql-to-components",
        title: "GraphQL to Components Converter | Free Online | Folioify",
        desc:
          "Convert GraphQL queries to React components. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "GraphQL to components",
          "GraphQL React",
          "query components",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to TypeScript MongoDB",
        path: "/tools/graphql-to-typescript-mongodb",
        title:
          "GraphQL to TypeScript MongoDB Converter | Free Online | Folioify",
        desc:
          "Generate TypeScript MongoDB types from GraphQL. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "GraphQL to TypeScript MongoDB",
          "GraphQL MongoDB",
          "MongoDB types",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      }
    ].map(x => ({
      ...x,
      packageUrl: "https://github.com/dotansimha/graphql-code-generator",
      packageName: "graphql-code-generator"
    }))
  },
  {
    category: "JSON-LD",
    content: [
      {
        label: "to N-Quads",
        path: "/tools/jsonld-to-nquads",
        title: "JSON-LD to N-Quads Converter | Free Online | Folioify",
        desc:
          "Convert JSON-LD to RDF N-Quads. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "JSON-LD to N-Quads",
          "N-Quads",
          "RDF",
          "linked data",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Expanded",
        path: "/tools/jsonld-to-expanded",
        title: "JSON-LD to Expanded Form Converter | Free Online | Folioify",
        desc:
          "Expand JSON-LD to full IRI form. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "JSON-LD expanded",
          "JSON-LD expand",
          "linked data",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Compacted",
        path: "/tools/jsonld-to-compacted",
        title: "JSON-LD to Compacted Form Converter | Free Online | Folioify",
        desc:
          "Compact JSON-LD with context. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "JSON-LD compacted",
          "JSON-LD compact",
          "linked data",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Flattened",
        path: "/tools/jsonld-to-flattened",
        title: "JSON-LD to Flattened Form Converter | Free Online | Folioify",
        desc:
          "Flatten JSON-LD graph. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "JSON-LD flattened",
          "JSON-LD flatten",
          "linked data",
          "developer tool",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Framed",
        path: "/tools/jsonld-to-framed",
        title: "JSON-LD to Framed Form Converter | Free Online | Folioify",
        desc:
          "Frame JSON-LD with frame document. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "JSON-LD framed",
          "JSON-LD frame",
          "linked data",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Normalized",
        path: "/tools/jsonld-to-normalized",
        title: "JSON-LD to Normalized Form Converter | Free Online | Folioify",
        desc:
          "Normalize JSON-LD (RDF dataset). Free, in-browser, no signup. By Folioify.",
        keywords: [
          "JSON-LD normalized",
          "JSON-LD normalize",
          "RDF normalization",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      }
    ].map(x => ({
      ...x,
      packageName: "jsonld",
      packageUrl: "https://github.com/digitalbazaar/jsonld.js"
    }))
  },
  {
    category: "TypeScript",
    content: [
      {
        label: "to Flow",
        path: "/tools/typescript-to-flow",
        packageName: "flowgen",
        packageUrl: "https://github.com/joarwilk/flowgen",
        title: "TypeScript to Flow Converter | Free Online Tool | Folioify",
        desc:
          "Convert TypeScript to Flow type annotations. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "TypeScript to Flow",
          "TS to Flow",
          "Flow types",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to TypeScript Declaration",
        path: "/tools/typescript-to-typescript-declaration",
        title: "TypeScript Declaration Generator | Free Online | Folioify",
        desc:
          "Generate .d.ts declaration files from TypeScript. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "TypeScript declaration",
          "d.ts",
          "type definitions",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to JSON Schema",
        path: "/tools/typescript-to-json-schema",
        packageName: "ts-json-schema-generator",
        packageUrl: "https://github.com/vega/ts-json-schema-generator",
        title: "TypeScript to JSON Schema Converter | Free Online | Folioify",
        desc:
          "Generate JSON Schema from TypeScript types. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "TypeScript to JSON Schema",
          "TS to JSON Schema",
          "schema generator",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to plain JavaScript",
        path: "/tools/typescript-to-javascript",
        title:
          "TypeScript to JavaScript Converter | Free Online Tool | Folioify",
        desc:
          "Compile TypeScript to plain JavaScript. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "TypeScript to JavaScript",
          "TS to JS",
          "TypeScript compiler",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to Zod Schema",
        path: "/tools/typescript-to-zod",
        packageName: "ts-to-zod",
        packageUrl: "https://www.npmjs.com/package/ts-to-zod",
        title: "TypeScript to Zod Converter | Free Online Tool | Folioify",
        desc:
          "Generate Zod schema from TypeScript types. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "TypeScript to Zod",
          "TS to Zod",
          "Zod schema",
          "runtime validation",
          "folioify"
        ],
        lastModified: "2026-02-01"
      }
    ]
  },
  {
    category: "Flow",
    iconName: "",
    content: [
      {
        label: "to TypeScript",
        path: "/tools/flow-to-typescript",
        title: "Flow to TypeScript Converter | Free Online Tool | Folioify",
        desc:
          "Convert Flow to TypeScript. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "Flow to TypeScript",
          "Flow to TS",
          "migrate Flow",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to TypeScript Declaration",
        path: "/tools/flow-to-typescript-declaration",
        title:
          "Flow to TypeScript Declaration Converter | Free Online | Folioify",
        desc:
          "Generate TypeScript .d.ts from Flow. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "Flow to TypeScript declaration",
          "Flow d.ts",
          "type definitions",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "to plain JavaScript",
        path: "/tools/flow-to-javascript",
        title: "Flow to JavaScript Converter | Free Online | Folioify",
        desc:
          "Strip Flow annotations to plain JavaScript. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "Flow to JavaScript",
          "Flow to JS",
          "remove Flow",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      }
    ]
  },
  {
    category: "Others",
    iconName: "",
    content: [
      {
        label: "XML to JSON",
        path: "/tools/xml-to-json",
        packageName: "xml-js",
        packageUrl: "https://github.com/nashwaan/xml-js",
        title: "XML to JSON Converter | Free Online Tool | Folioify",
        desc:
          "Convert XML to JSON. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "XML to JSON",
          "XML converter",
          "XML parser",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "YAML to JSON",
        path: "/tools/yaml-to-json",
        packageName: "yaml",
        packageUrl: "https://github.com/tj/js-yaml",
        title: "YAML to JSON Converter | Free Online Tool | Folioify",
        desc: "Convert YAML to JSON. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "YAML to JSON",
          "YAML converter",
          "config converter",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "YAML to TOML",
        path: "/tools/yaml-to-toml",
        title: "YAML to TOML Converter | Free Online | Folioify",
        desc:
          "Convert YAML to TOML config format. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "YAML to TOML",
          "YAML converter",
          "config format",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "Markdown to HTML",
        path: "/tools/markdown-to-html",
        packageName: "markdown",
        packageUrl: "https://github.com/evilstreak/markdown-js",
        title: "Markdown to HTML Converter | Free Online Tool | Folioify",
        desc:
          "Convert Markdown to HTML. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "Markdown to HTML",
          "Markdown converter",
          "MD to HTML",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "TOML Syntax Checker",
        path: "/tools/check-toml",
        packageUrl: "https://www.npmjs.com/package/@iarna/toml",
        packageName: "@iarna/toml",
        title: "TOML Syntax Checker | Free Online Tool | Folioify",
        desc:
          "Validate TOML syntax instantly with clear error messages. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "TOML syntax checker",
          "TOML validator",
          "validate TOML",
          "TOML lint",
          "config checker",
          "free tool",
          "folioify"
        ],
        lastModified: "2026-02-08"
      },
      {
        label: "TOML Formatter",
        path: "/tools/toml-formatter",
        packageUrl: "https://www.npmjs.com/package/@iarna/toml",
        packageName: "@iarna/toml",
        title: "TOML Formatter | TOML Format | Folioify",
        desc:
          "Format TOML config files with consistent spacing and structure. Free, no signup, runs in browser.",
        keywords: [
          "TOML formatter",
          "format TOML",
          "TOML pretty print",
          "TOML beautifier",
          "config formatter",
          "free tool",
          "folioify"
        ],
        lastModified: "2026-02-08"
      },
      {
        label: "TOML to JSON",
        path: "/tools/toml-to-json",
        packageUrl: "https://www.npmjs.com/package/@iarna/toml",
        packageName: "@iarna/toml",
        title: "TOML to JSON Converter | Free Online Tool | Folioify",
        desc:
          "Convert TOML to JSON. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "TOML to JSON",
          "TOML converter",
          "config converter",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "TOML to YAML",
        path: "/tools/toml-to-yaml",
        title: "TOML to YAML Converter | Free Online | Folioify",
        desc: "Convert TOML to YAML. Free, in-browser, no signup. By Folioify.",
        keywords: [
          "TOML to YAML",
          "TOML converter",
          "config format",
          "online converter",
          "folioify"
        ],
        lastModified: "2026-02-01"
      },
      {
        label: "Cadence to Go",
        path: "/tools/cadence-to-go",
        title: "Cadence to Go Converter | Free Online | Folioify",
        desc:
          "Convert Cadence smart contract to Go. Free, no signup, runs in browser. By Folioify.",
        keywords: [
          "Cadence to Go",
          "Cadence",
          "Flow blockchain",
          "smart contract",
          "folioify"
        ],
        lastModified: "2026-02-01"
      }
    ]
  }
];

/** 扁平化后的单条路由，含 SEO 可选字段（RouteSEO） */
export interface Route {
  path: string;
  label: string;
  desc: string;
  searchTerm: string;
  category: string;
  packageUrl?: string;
  packageName?: string;
  title?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
  lastModified?: string;
  datePublished?: string;
}

export const routes = flatten(
  categorizedRoutes.map(a =>
    // @ts-ignore
    a.content.map(
      (x: { label: string; path: string; desc?: string } & RouteSEO) => {
        const _label =
          a.category.toLowerCase() !== "others"
            ? `${a.category} ${x.label}`
            : x.label;
        return {
          ...x,
          category: a.category,
          searchTerm: _label,
          title: x.title || buildDefaultTitle(_label),
          desc: x.desc || buildDefaultDesc(_label),
          keywords: x.keywords || buildDefaultKeywords(_label),
          lastModified: x.lastModified || DEFAULT_LAST_MODIFIED
        };
      }
    )
  )
) as Route[];

export function activeRouteData(pathname: string): Route | undefined {
  return find(routes, (o: Route) => o.path === pathname);
}
