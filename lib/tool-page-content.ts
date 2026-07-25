import { getToolProcessingDetails } from "./tool-processing";

export type ToolFAQ = {
  question: string;
  answer: string;
};

export type ToolPageContent = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  summary: string;
  whatIs: string;
  capabilities: string[];
  howItWorks: string[];
  useCases: string[];
  inputExample?: string;
  outputExample?: string;
  options?: string[];
  commonErrors?: string[];
  limitations?: string[];
  faqs: ToolFAQ[];
};

export type CategoryPageContent = {
  title: string;
  description: string;
  highlights: string[];
  useCases: string[];
  faqs: ToolFAQ[];
};

const PRIORITY_INDEXING_TOOL_PATHS = new Set([
  "/tools/svg-to-jsx",
  "/tools/svg-to-react-native",
  "/tools/html-to-jsx",
  "/tools/html-to-pug",
  "/tools/html-viewer",
  "/tools/jsx-viewer",
  "/tools/json-to-typescript",
  "/tools/json-to-yaml",
  "/tools/json-to-zod",
  "/tools/json-to-mongoose",
  "/tools/json-schema-to-typescript",
  "/tools/css-to-js",
  "/tools/css-to-tailwind",
  "/tools/markdown-to-jsx",
  "/tools/markdown-to-html",
  "/tools/typescript-to-zod",
  "/tools/typescript-to-json-schema",
  "/tools/typescript-to-flow",
  "/tools/toml-to-yaml",
  "/tools/check-toml",
  "/tools/toml-formatter",
  "/tools/yaml-to-toml",
  "/tools/yaml-to-json",
  "/tools/xml-to-json",
  "/tools/flow-to-javascript",
  "/tools/flow-to-typescript",
  "/tools/js-object-to-json",
  "/tools/js-object-to-typescript",
  "/tools/jsonld-to-expanded",
  "/tools/graphql-to-typescript",
  "/tools/graphql-to-typescript-mongodb",
  "/tools/graphql-to-components",
  "/tools/graphql-to-fragment-matcher",
  "/tools/graphql-to-introspection-json",
  "/tools/graphql-to-resolvers-signature",
  "/tools/graphql-to-java",
  "/tools/graphql-to-flow",
  "/tools/object-styles-to-template-literal",
  "/tools/json-to-kotlin",
  "/tools/json-to-big-query",
  "/tools/json-to-sarcastic",
  "/tools/json-to-mobx-state-tree",
  "/tools/json-to-graphql"
]);

export const INDEXING_CONTENT_LAST_MODIFIED = "2026-07-04";

const STALE_LAST_MODIFIED_CUTOFF = "2026-04-05";

/** Resolve last-modified for meta, schema, and sitemap (GEO §10 freshness). */
export function getRouteLastModified(
  path: string,
  routeLastModified?: string
): string {
  if (
    getToolPageContentWithoutGenerated(path) ||
    isPriorityIndexingToolPath(path)
  ) {
    return INDEXING_CONTENT_LAST_MODIFIED;
  }

  if (buildGeneratedToolContent(path)) {
    return INDEXING_CONTENT_LAST_MODIFIED;
  }

  if (!routeLastModified || routeLastModified <= STALE_LAST_MODIFIED_CUTOFF) {
    return INDEXING_CONTENT_LAST_MODIFIED;
  }

  return routeLastModified;
}

function getToolPageContentWithoutGenerated(
  path: string
): ToolPageContent | undefined {
  return TOOL_PAGE_CONTENT[path];
}

export function isPriorityIndexingToolPath(path: string): boolean {
  return PRIORITY_INDEXING_TOOL_PATHS.has(path);
}

const tokenLabels: Record<string, string> = {
  api: "API",
  big: "Big",
  bson: "BSON",
  css: "CSS",
  flow: "Flow",
  fragment: "Fragment",
  graphql: "GraphQL",
  html: "HTML",
  introspection: "Introspection",
  java: "Java",
  javascript: "JavaScript",
  js: "JS",
  json: "JSON",
  jsonld: "JSON-LD",
  jsx: "JSX",
  kotlin: "Kotlin",
  markdown: "Markdown",
  mobx: "MobX",
  mongodb: "MongoDB",
  mongoose: "Mongoose",
  object: "Object",
  resolvers: "Resolvers",
  sarcastic: "Sarcastic",
  schema: "Schema",
  tailwind: "Tailwind",
  template: "Template",
  toml: "TOML",
  typescript: "TypeScript",
  xml: "XML",
  yaml: "YAML",
  zod: "Zod"
};

const categoryContent: Record<string, CategoryPageContent> = {
  svg: {
    title: "SVG Developer Tools",
    description:
      "Convert SVG assets into framework-ready components for React, JSX, and React Native projects without uploading icon source files.",
    highlights: [
      "Best for design-system icons, app illustrations, and exported vector assets.",
      "Keeps viewBox and path data visible so developers can review the generated component.",
      "Useful when moving SVG files from design tools into production UI code."
    ],
    useCases: [
      "Prepare SVG icons for React component libraries.",
      "Convert SVG artwork for React Native mobile screens.",
      "Clean SVG snippets before sharing them in documentation."
    ],
    faqs: [
      {
        question: "Are SVG conversions private?",
        answer:
          "Yes. SVG conversion runs in the browser, so pasted markup is not uploaded to Folioify servers."
      },
      {
        question: "Should I review generated SVG components?",
        answer:
          "Yes. Review accessibility labels, colors, and sizing before using generated components in production."
      }
    ]
  },
  html: {
    title: "HTML Developer Tools",
    description:
      "Preview, convert, and adapt HTML snippets for React, JSX, Pug, and browser-based debugging workflows.",
    highlights: [
      "Useful for migrating static markup into component-based applications.",
      "Helps test copied HTML examples before adding them to a codebase.",
      "Supports quick template conversion without creating a local project."
    ],
    useCases: [
      "Convert HTML into JSX for React components.",
      "Preview HTML snippets or email fragments in the browser.",
      "Convert legacy HTML templates into Pug syntax."
    ],
    faqs: [
      {
        question: "Can these tools replace browser testing?",
        answer:
          "No. They speed up conversion and preview work, but production HTML should still be tested in target browsers."
      },
      {
        question: "How do HTML tools process my markup?",
        answer:
          "Processing depends on the tool. Browser-based tools keep transformation input in your browser; server-backed tools identify that input is sent to Folioify for conversion."
      }
    ]
  },
  json: {
    title: "JSON Developer Tools",
    description:
      "Generate types, schemas, database models, and framework-specific code from JSON examples for API and data workflows.",
    highlights: [
      "Best for turning API payload samples into typed code or schema drafts.",
      "Supports many target languages and validation libraries.",
      "Helps document data structures during implementation and debugging."
    ],
    useCases: [
      "Generate TypeScript, Zod, Kotlin, or GraphQL drafts from JSON samples.",
      "Prepare database or analytics schema drafts from event payloads.",
      "Convert JSON into YAML, TOML, or other exchange formats."
    ],
    faqs: [
      {
        question: "Can one JSON sample describe every production field?",
        answer:
          "No. Use representative samples and review optional, nullable, and repeated fields manually."
      },
      {
        question: "Is generated code production-ready?",
        answer:
          "Generated output is a strong starting point, but it should be reviewed and tested in your project."
      }
    ]
  },
  "json-schema": {
    title: "JSON Schema Developer Tools",
    description:
      "Convert JSON Schema into TypeScript, Zod, OpenAPI-compatible schema, and other formats used in validation and API design.",
    highlights: [
      "Useful for API contracts, validation libraries, and shared model definitions.",
      "Keeps schema structure visible for review before adoption.",
      "Helps teams move between schema-first and type-first workflows."
    ],
    useCases: [
      "Generate TypeScript definitions from JSON Schema.",
      "Create Zod schemas for runtime validation.",
      "Adapt JSON Schema for OpenAPI documentation."
    ],
    faqs: [
      {
        question: "Does conversion preserve every JSON Schema feature?",
        answer:
          "Most common structures convert well, but advanced keywords may require manual review."
      },
      {
        question: "Should I validate the generated schema?",
        answer:
          "Yes. Run it through your target validator or compiler before publishing it."
      }
    ]
  },
  css: {
    title: "CSS Developer Tools",
    description:
      "Convert CSS into JavaScript style objects, Tailwind utility classes, and component-friendly styling formats.",
    highlights: [
      "Useful when migrating stylesheet snippets into component code.",
      "Helps prototype inline styles and utility-class alternatives.",
      "Keeps style transformations quick and copyable."
    ],
    useCases: [
      "Convert CSS declarations into React style objects.",
      "Translate CSS snippets into Tailwind classes.",
      "Prepare style examples for docs and component libraries."
    ],
    faqs: [
      {
        question: "Can CSS tools convert every selector?",
        answer:
          "Simple declarations convert best. Complex selectors, media queries, and pseudo states may need manual work."
      },
      {
        question: "Is Tailwind conversion exact?",
        answer:
          "It creates a practical utility-class draft. Review spacing, colors, and responsive behavior."
      }
    ]
  },
  javascript: {
    title: "JavaScript Developer Tools",
    description:
      "Convert JavaScript object and style snippets into strict JSON, TypeScript types, and component-ready formats.",
    highlights: [
      "Useful for cleaning copied console data and object literals.",
      "Helps migrate loose JavaScript snippets into typed or structured output.",
      "Designed for quick debugging and documentation workflows."
    ],
    useCases: [
      "Convert JS object literals into valid JSON.",
      "Generate TypeScript shapes from object examples.",
      "Adapt object styles into template-friendly strings."
    ],
    faqs: [
      {
        question: "Is a JS object the same as JSON?",
        answer:
          "No. JSON is a strict data format; JavaScript object literals are language syntax."
      },
      {
        question: "Can functions be converted to JSON?",
        answer:
          "No. JSON does not support functions, undefined, symbols, or class instances."
      }
    ]
  },
  graphql: {
    title: "GraphQL Developer Tools",
    description:
      "Convert GraphQL schemas and documents into types, resolver signatures, introspection JSON, and client-ready artifacts.",
    highlights: [
      "Useful for schema-first API development and client code generation.",
      "Helps inspect GraphQL SDL before wiring it into tooling.",
      "Supports multiple GraphQL output targets for migration and documentation."
    ],
    useCases: [
      "Generate TypeScript or Flow types from GraphQL schema input.",
      "Create introspection JSON for documentation and client tooling.",
      "Draft resolver signatures or component bindings from GraphQL definitions."
    ],
    faqs: [
      {
        question: "Do GraphQL tools call my API endpoint?",
        answer:
          "No. These tools work with pasted schema or document text in the browser."
      },
      {
        question: "Can generated GraphQL code be used directly?",
        answer:
          "Use it as a starting point and run it through your project compiler or GraphQL codegen setup."
      }
    ]
  },
  "json-ld": {
    title: "JSON-LD Developer Tools",
    description:
      "Expand, compact, flatten, frame, and normalize JSON-LD data for linked-data debugging and structured-data workflows.",
    highlights: [
      "Useful when debugging schema.org, linked data, and semantic JSON documents.",
      "Helps inspect how context expansion changes JSON-LD output.",
      "Keeps transformations visible for validation and documentation."
    ],
    useCases: [
      "Expand JSON-LD before validating structured data.",
      "Normalize linked-data examples for comparison.",
      "Debug context and framing behavior in JSON-LD documents."
    ],
    faqs: [
      {
        question: "Is JSON-LD the same as JSON?",
        answer:
          "JSON-LD is JSON with linked-data context and semantics. It can be transformed into expanded or normalized forms."
      },
      {
        question: "Do JSON-LD tools validate rich results?",
        answer:
          "No. Use Google rich result tools for eligibility checks after transforming and reviewing the data."
      }
    ]
  },
  typescript: {
    title: "TypeScript Developer Tools",
    description:
      "Convert TypeScript into Flow, JavaScript, JSON Schema, Zod, and declaration outputs for migration and validation workflows.",
    highlights: [
      "Useful for teams moving between type systems and runtime validators.",
      "Helps generate schema or declaration drafts from typed source.",
      "Speeds up TypeScript modernization and API contract work."
    ],
    useCases: [
      "Generate Zod or JSON Schema from TypeScript definitions.",
      "Convert TypeScript into JavaScript for compatibility checks.",
      "Create Flow or declaration outputs during migration work."
    ],
    faqs: [
      {
        question: "Can TypeScript conversion understand runtime behavior?",
        answer:
          "No. These tools focus on source and type transformations, not runtime analysis."
      },
      {
        question: "Should generated schemas be reviewed?",
        answer:
          "Yes. Validate generated output against your compiler, validator, and real API samples."
      }
    ]
  },
  flow: {
    title: "Flow Developer Tools",
    description:
      "Convert Flow annotations and files into JavaScript, TypeScript, and TypeScript declaration outputs for legacy code migration.",
    highlights: [
      "Useful for maintaining or migrating older Flow codebases.",
      "Helps estimate migration effort before changing a repository.",
      "Creates reviewable output for TypeScript modernization."
    ],
    useCases: [
      "Convert Flow source to JavaScript while removing annotations.",
      "Translate Flow types into TypeScript syntax.",
      "Generate migration drafts for code review."
    ],
    faqs: [
      {
        question: "Can these tools migrate a whole Flow repo?",
        answer:
          "No. They convert snippets and files. Repository migration still needs build, lint, and test work."
      },
      {
        question: "Are Flow and TypeScript semantics identical?",
        answer:
          "No. Exact object types, variance, and utility types often need manual review."
      }
    ]
  },
  others: {
    title: "Other Developer Tools",
    description:
      "Find format validators, Markdown converters, XML utilities, and config helpers that do not fit a single language category.",
    highlights: [
      "Useful for quick config, markup, and documentation transformations.",
      "Groups practical utilities that developers need during daily debugging.",
      "Provides direct links to smaller tools that are easy to miss from search."
    ],
    useCases: [
      "Validate TOML configuration.",
      "Convert Markdown, XML, YAML, and TOML snippets.",
      "Prepare docs or config examples for code reviews."
    ],
    faqs: [
      {
        question: "Why are these tools grouped as Others?",
        answer:
          "They solve useful developer tasks that span configuration, markup, and documentation instead of one programming language."
      },
      {
        question: "Are these utilities still maintained?",
        answer:
          "Yes. They share the same Folioify tool layout, SEO metadata, and browser-first processing model."
      }
    ]
  }
};

function titleCaseToken(token: string): string {
  return tokenLabels[token] || token.charAt(0).toUpperCase() + token.slice(1);
}

function labelFromSlug(slug: string): string {
  return slug.split("-").map(titleCaseToken).join(" ");
}

function parseToolName(path: string) {
  const slug = path.replace(/^\/tools\//, "");
  const parts = slug.split("-to-");

  if (slug === "check-toml") {
    return {
      label: "TOML Syntax Checker",
      source: "TOML",
      target: "validation result",
      kind: "checker" as const
    };
  }

  if (slug.endsWith("-viewer")) {
    const source = labelFromSlug(slug.replace(/-viewer$/, ""));
    return {
      label: `${source} Viewer`,
      source,
      target: "live preview",
      kind: "viewer" as const
    };
  }

  if (slug === "object-styles-to-template-literal") {
    return {
      label: "Object Styles to Template Literal",
      source: "JavaScript style objects",
      target: "template literal CSS",
      kind: "converter" as const
    };
  }

  if (parts.length === 2) {
    return {
      label: `${labelFromSlug(parts[0])} to ${labelFromSlug(parts[1])}`,
      source: labelFromSlug(parts[0]),
      target: labelFromSlug(parts[1]),
      kind: "converter" as const
    };
  }

  return {
    label: labelFromSlug(slug),
    source: labelFromSlug(slug),
    target: "developer-ready output",
    kind: "converter" as const
  };
}

function buildGeneratedToolContent(path: string): ToolPageContent | undefined {
  if (!path.startsWith("/tools/")) return undefined;

  const tool = parseToolName(path);
  const processing = getToolProcessingDetails(path);
  const action =
    tool.kind === "checker"
      ? `validate ${tool.source} syntax`
      : tool.kind === "viewer"
      ? `preview ${tool.source} snippets`
      : `convert ${tool.source} into ${tool.target}`;
  const output =
    tool.kind === "checker"
      ? "clear validation status and parse errors"
      : tool.kind === "viewer"
      ? `${tool.source} rendered preview`
      : `${tool.target} output`;

  return {
    metaTitle: `${tool.label} Online | Free Developer Tool | Folioify`,
    metaDescription: `Use this free ${tool.label} online tool to ${action} with copy-ready output, no signup, and clear processing details.`,
    keywords: [
      tool.label,
      `${tool.label} online`,
      `free ${tool.label}`,
      `${tool.source} tool`,
      `${tool.target} generator`,
      "developer tool"
    ],
    summary: `The ${tool.label} page is built for developers who need to ${action} quickly. ${processing.description}`,
    whatIs: `${tool.label} is a focused online utility that takes ${tool.source} input and produces ${output}. It is designed for quick debugging, migration, documentation, and implementation workflows. ${processing.description}`,
    capabilities: [
      `Process ${tool.source} input without creating a local project.`,
      `Produce ${output} that can be copied into code, docs, or tooling.`,
      "Keep conversion work fast with an editor-driven workflow.",
      "Use the tool without creating an account."
    ],
    howItWorks: [
      `Paste representative ${tool.source} input into the editor.`,
      "The tool parses the input and applies the matching transformation.",
      `Review the generated ${output} and copy it into your workflow.`
    ],
    useCases: [
      `Debug ${tool.source} snippets before adding them to a project.`,
      `Prepare ${tool.target} examples for documentation or code review.`,
      "Move copied examples into a cleaner developer-ready format.",
      "Compare generated output before choosing a manual implementation."
    ],
    inputExample:
      tool.kind === "checker"
        ? `[package]\nname = "folioify"\nversion = "1.0.0"`
        : tool.kind === "viewer"
        ? `<div class="preview">Hello Folioify</div>`
        : `${tool.source} input goes here`,
    outputExample:
      tool.kind === "checker"
        ? "Valid TOML, or a parser error that points to the invalid syntax."
        : tool.kind === "viewer"
        ? `A browser-rendered ${tool.source} preview.`
        : `Copy-ready ${tool.target} output.`,
    options: [
      "Input quality: use complete, representative snippets for better output.",
      "Manual review: check generated names, optional fields, and edge cases before production use.",
      "Copy workflow: copy only the final output after reviewing parser errors."
    ],
    commonErrors: [
      `Invalid ${tool.source} syntax can prevent conversion.`,
      "Incomplete examples can lead to overly narrow generated output.",
      "Project-specific rules may require manual cleanup after generation."
    ],
    limitations: [
      "Generated output is a practical starting point, not a full project migration.",
      "Runtime behavior and business rules are not inferred from snippets.",
      "Large inputs can take longer because processing happens in the browser."
    ],
    faqs: [
      {
        question: `Is ${tool.label} free?`,
        answer:
          "Yes. The tool is free to use with no signup, subscription, or usage limit."
      },
      {
        question: `How does ${tool.label} process my input?`,
        answer: processing.description
      },
      {
        question: `Can I use the ${tool.target} output in production?`,
        answer:
          "Use the output as a strong starting point, then review it with your project compiler, tests, or validator before shipping."
      }
    ]
  };
}

export const TOOL_PAGE_CONTENT: Record<string, ToolPageContent> = {
  "/tools/svg-to-jsx": {
    metaTitle: "SVG to JSX Converter | Free React Component Tool | Folioify",
    metaDescription:
      "Convert SVG markup to React JSX components online. Preserves viewBox and paths, outputs copy-ready TSX with camelCase props. Free, no signup, runs in browser.",
    keywords: [
      "SVG to JSX",
      "SVG to React",
      "convert SVG to component",
      "React icon converter",
      "SVGR online",
      "free SVG tool"
    ],
    summary:
      "Convert exported SVG icons and illustrations into React JSX components you can paste directly into a design system or app codebase.",
    whatIs:
      "SVG to JSX is a browser-based converter that transforms SVG markup into React-friendly JSX. It normalizes attributes like class to className and produces component-ready output without uploading files.",
    capabilities: [
      "Convert inline SVG markup into React JSX or TSX.",
      "Preserve viewBox, paths, and structural SVG elements.",
      "Normalize SVG attributes to JSX prop names.",
      "Copy output for icons, logos, and UI illustrations."
    ],
    howItWorks: [
      "Paste SVG markup into the editor.",
      "The converter parses the SVG and applies JSX transformations.",
      "Review and copy the generated React component code."
    ],
    useCases: [
      "Turn Figma or Illustrator SVG exports into React icon components.",
      "Migrate web SVG assets into a React or Next.js codebase.",
      "Clean SVG snippets before adding them to Storybook or docs.",
      "Prepare icon components for a shared UI library."
    ],
    inputExample: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
</svg>`,
    outputExample: `const SvgIcon = props => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
  </svg>
);`,
    commonErrors: [
      "Invalid SVG syntax prevents conversion — check unclosed tags.",
      "External xlink:href references may need manual cleanup.",
      "Complex CSS inside SVG may not map cleanly to JSX."
    ],
    limitations: [
      "Review accessibility props like aria-label and title manually.",
      "Large SVGs with embedded images may need extra handling.",
      "Generated components are a starting point, not a full design-system export."
    ],
    faqs: [
      {
        question: "Does SVG to JSX preserve viewBox?",
        answer:
          "Yes. viewBox and path data are kept so icons scale correctly in React layouts."
      },
      {
        question: "Can I convert SVG files?",
        answer:
          "Paste the SVG markup directly. File upload is not required because processing runs locally in your browser."
      },
      {
        question: "Is the output TypeScript compatible?",
        answer:
          "Yes. You can paste the JSX into .tsx files and add prop types as needed."
      }
    ]
  },
  "/tools/json-to-typescript": {
    metaTitle: "JSON to TypeScript Converter | Generate TS Types | Folioify",
    metaDescription:
      "Generate TypeScript interfaces and type aliases from JSON online. Ideal for API responses, config files, and mock data. Free, no signup, runs in browser.",
    keywords: [
      "JSON to TypeScript",
      "JSON to TS",
      "generate TypeScript from JSON",
      "JSON type generator",
      "TypeScript interface generator",
      "API types"
    ],
    summary:
      "Turn JSON samples into TypeScript types so API payloads, config objects, and mock data become type-safe faster.",
    whatIs:
      "JSON to TypeScript infers structural types from JSON input and outputs interfaces or type aliases you can drop into frontend or backend TypeScript projects.",
    capabilities: [
      "Infer strings, numbers, booleans, arrays, and nested objects.",
      "Generate TypeScript-friendly property names and nested shapes.",
      "Use real API responses or config snippets as input.",
      "Produce copy-ready types for interfaces and type aliases."
    ],
    howItWorks: [
      "Paste valid JSON into the editor.",
      "The converter reads the value shape and maps fields to TypeScript types.",
      "Copy the generated interface or type alias into your project."
    ],
    useCases: [
      "Create API response types from example payloads.",
      "Type frontend state objects during refactors.",
      "Document JSON configuration with strict TypeScript models.",
      "Bootstrap types before OpenAPI or schema generation."
    ],
    inputExample: `{
  "id": 42,
  "name": "Folioify",
  "tags": ["tools", "converter"],
  "meta": { "version": 1 }
}`,
    outputExample: `interface Root {
  id: number;
  name: string;
  tags: string[];
  meta: {
    version: number;
  };
}`,
    commonErrors: [
      "Invalid JSON syntax stops type generation.",
      "A single sample may miss optional fields present in production data.",
      "Mixed-type arrays can infer broad union types."
    ],
    limitations: [
      "Generated types should be reviewed before production use.",
      "Null-only samples may not reveal the intended non-null type.",
      "Business rules and runtime validation are not inferred."
    ],
    faqs: [
      {
        question: "Does it support nested JSON?",
        answer:
          "Yes. Nested objects become nested TypeScript types with inferred property shapes."
      },
      {
        question: "Can it handle optional fields?",
        answer:
          "Optional fields are inferred from the sample you provide. Use representative payloads with and without optional keys for better results."
      },
      {
        question: "Is my JSON uploaded to a server?",
        answer: "No. Conversion runs locally in your browser for privacy."
      }
    ]
  },
  "/tools/html-to-jsx": {
    metaTitle: "HTML to JSX Converter | Free React Markup Tool | Folioify",
    metaDescription:
      "Convert HTML to React JSX online. Transforms class to className, self-closing tags, and inline attributes for copy-ready components. Free, no signup.",
    keywords: [
      "HTML to JSX",
      "convert HTML to JSX",
      "HTML to React",
      "JSX converter",
      "React markup converter",
      "HTML to component"
    ],
    summary:
      "Paste HTML snippets and get React-ready JSX with corrected attributes, self-closing tags, and JSX-safe syntax.",
    whatIs:
      "HTML to JSX converts standard HTML markup into JSX suitable for React components. It rewrites attributes like class and for, and normalizes void elements for JSX parsers.",
    capabilities: [
      "Convert HTML tags into JSX-compatible syntax.",
      "Rewrite class, for, and other HTML attributes to JSX props.",
      "Normalize self-closing tags such as img, input, and br.",
      "Copy output into React, Next.js, or MDX files."
    ],
    howItWorks: [
      "Paste HTML markup into the editor.",
      "The converter parses the DOM-like structure and emits JSX.",
      "Review attribute changes and copy the JSX into your component."
    ],
    useCases: [
      "Migrate static HTML sections into React components.",
      "Convert email or landing-page markup for frontend apps.",
      "Turn design handoff HTML into JSX during prototyping.",
      "Prepare HTML snippets for documentation examples."
    ],
    inputExample: `<div class="card">
  <img src="/logo.png" alt="Logo">
  <label for="email">Email</label>
  <input id="email" type="email">
</div>`,
    outputExample: `<div className="card">
  <img src="/logo.png" alt="Logo" />
  <label htmlFor="email">Email</label>
  <input id="email" type="email" />
</div>`,
    commonErrors: [
      "Malformed HTML can produce unexpected JSX output.",
      "Inline event handlers may need manual conversion to React handlers.",
      "Custom data attributes usually pass through but should be reviewed."
    ],
    limitations: [
      "Event attributes like onclick are not automatically converted to React handlers.",
      "Server-only HTML features may need manual cleanup for React.",
      "Large documents should be converted in smaller chunks for easier review."
    ],
    faqs: [
      {
        question: "Does HTML to JSX change class to className?",
        answer:
          "Yes. Common HTML attributes are rewritten to JSX-compatible prop names."
      },
      {
        question: "Can I convert a full page?",
        answer:
          "Yes, but converting smaller sections makes review easier before adding the JSX to components."
      },
      {
        question: "Does it work with Next.js?",
        answer:
          "Yes. The JSX output can be pasted into Next.js client or server components after any project-specific cleanup."
      }
    ]
  },
  "/tools/jsx-viewer": {
    metaTitle: "Online JSX Viewer | Live React Preview & Formatter | Folioify",
    metaDescription:
      "Preview JSX and TSX online with live React rendering, Babel validation, formatting, snippets, Tailwind support, and inline error diagnostics.",
    keywords: [
      "online JSX viewer",
      "React preview online",
      "JSX syntax checker",
      "TSX viewer",
      "live React playground"
    ],
    summary:
      "Use the JSX Viewer when you need to paste a React component, validate the syntax, format the source, and see a live preview without creating a local project.",
    whatIs:
      "The JSX Viewer is a browser-based React preview tool. It transpiles JSX with Babel, finds a previewable component, and renders it directly in the page so you can inspect UI output quickly.",
    capabilities: [
      "Preview App, Preview, Component, or a pasted JSX fragment.",
      "Format JSX with Prettier and view syntax diagnostics inline.",
      "Load snippets, local files, or remote JSX/TSX source.",
      "Optionally include the Tailwind CDN for utility-class previews."
    ],
    howItWorks: [
      "Paste JSX or TSX into the editor.",
      "The page transpiles the source with Babel and detects the preview component.",
      "The preview panel renders the component and reports compile or runtime errors."
    ],
    useCases: [
      "Debug a copied React component before adding it to a codebase.",
      "Preview Tailwind UI snippets without opening a full app.",
      "Validate JSX syntax in documentation, bug reports, or examples.",
      "Share a quick visual check with designers or frontend teammates."
    ],
    inputExample: `const App = () => (
  <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">
    Save changes
  </button>
);`,
    outputExample:
      "A rendered React button plus inline diagnostics if the JSX is invalid.",
    options: [
      "Tailwind CDN: enable utility classes in the preview panel.",
      "Format: run Prettier against the current JSX source.",
      "Refresh: remount the preview when component state needs a clean reset."
    ],
    commonErrors: [
      "No previewable component found: define App, Preview, Component, or use a JSX fragment.",
      "Unexpected token: check unclosed tags, missing braces, or TypeScript-only syntax.",
      "Runtime error: component code can compile but still throw while rendering."
    ],
    limitations: [
      "External npm imports are stripped, so paste self-contained examples.",
      "Heavy components can take longer to compile and render in the browser.",
      "The preview is for visual validation, not a replacement for app-level tests."
    ],
    faqs: [
      {
        question:
          "Can the JSX Viewer render a component without an App export?",
        answer:
          "Yes. It can render App, Preview, Component, the first PascalCase component, or a raw JSX fragment."
      },
      {
        question: "Does the JSX Viewer support Tailwind CSS?",
        answer:
          "Yes. Turn on the Tailwind CDN toggle to preview common Tailwind utility classes."
      },
      {
        question: "Why does my imported component not render?",
        answer:
          "The viewer strips module imports for safety and portability. Paste a self-contained component instead."
      }
    ]
  },
  "/tools/svg-to-react-native": {
    metaTitle:
      "SVG to React Native Converter | Convert SVG to RN Components | Folioify",
    metaDescription:
      "Convert SVG markup into React Native component code with JSX-friendly attributes and mobile-ready svg primitives.",
    keywords: [
      "SVG to React Native",
      "SVG to RN component",
      "React Native SVG converter",
      "convert SVG for mobile"
    ],
    summary:
      "This converter turns exported SVG markup into React Native component code so icons and illustrations can move from design tools into mobile screens faster.",
    whatIs:
      "SVG to React Native adapts web SVG markup for React Native workflows, replacing browser-focused attributes with JSX-compatible component output.",
    capabilities: [
      "Convert inline SVG markup into React Native JSX.",
      "Normalize common SVG attributes to JSX prop names.",
      "Prepare icon components for mobile UI libraries.",
      "Keep path data and viewBox values intact for visual fidelity."
    ],
    howItWorks: [
      "Paste SVG markup exported from Figma, Sketch, Illustrator, or a browser.",
      "The converter parses the SVG and rewrites attributes for React Native JSX.",
      "Copy the generated component into a React Native project using react-native-svg."
    ],
    useCases: [
      "Convert product icons for a React Native design system.",
      "Move marketing or onboarding illustrations into mobile screens.",
      "Clean up SVG exports before committing them to an app repository."
    ],
    inputExample: `<svg viewBox="0 0 24 24">
  <path fill="#2563eb" d="M12 2l8 20H4L12 2z" />
</svg>`,
    outputExample:
      "A React Native component using Svg and Path primitives with JSX props.",
    options: [
      "Review fills and strokes after conversion to decide whether they should become props.",
      "Keep viewBox values unchanged unless the source export has unwanted whitespace."
    ],
    commonErrors: [
      "Missing react-native-svg dependency in the target project.",
      "Unsupported SVG features such as filters, masks, or embedded CSS.",
      "Hard-coded colors that should be converted into component props."
    ],
    limitations: [
      "Complex browser SVG effects may not map perfectly to React Native.",
      "The generated component should be tested on iOS and Android.",
      "Animation behavior is outside the scope of the converter."
    ],
    faqs: [
      {
        question: "Do I need react-native-svg?",
        answer:
          "Yes. Most React Native SVG components require the react-native-svg package in your app."
      },
      {
        question: "Can it convert SVG filters?",
        answer:
          "Basic paths and shapes convert best. Advanced filters and browser-only effects may need manual work."
      },
      {
        question: "Should I keep colors hard-coded?",
        answer:
          "For reusable icons, convert fixed fill or stroke values into props after generating the component."
      }
    ]
  },
  "/tools/graphql-to-introspection-json": {
    metaTitle:
      "GraphQL to Introspection JSON Converter | Schema Export Tool | Folioify",
    metaDescription:
      "Convert GraphQL SDL into introspection JSON for GraphQL tooling, clients, schema registries, and documentation workflows.",
    keywords: [
      "GraphQL introspection JSON",
      "GraphQL schema export",
      "SDL to introspection",
      "GraphQL tooling"
    ],
    summary:
      "Use this page to turn GraphQL SDL into introspection JSON when another tool expects the standard introspection format instead of schema definition language.",
    whatIs:
      "GraphQL to Introspection JSON converts a schema written in SDL into the JSON shape used by GraphQL clients, documentation generators, and schema tooling.",
    capabilities: [
      "Parse GraphQL schema definition language.",
      "Generate introspection JSON for compatible tooling.",
      "Keep type, field, argument, interface, union, enum, and directive data visible.",
      "Run conversion in the browser for quick schema checks."
    ],
    howItWorks: [
      "Paste a GraphQL schema into the editor.",
      "The converter parses the schema and runs an introspection query representation.",
      "Copy the JSON result into documentation, client tooling, or schema pipelines."
    ],
    useCases: [
      "Generate schema JSON for GraphQL client configuration.",
      "Inspect a schema before publishing it to tooling.",
      "Move from SDL examples to introspection-based documentation."
    ],
    inputExample: `type Query {
  product(id: ID!): Product
}

type Product {
  id: ID!
  name: String!
}`,
    outputExample:
      "A JSON object containing __schema with queryType, types, fields, arguments, and scalar references.",
    commonErrors: [
      "Syntax error from missing braces or invalid field definitions.",
      "Unknown type references that are not declared in the schema.",
      "Using query documents instead of schema SDL."
    ],
    limitations: [
      "This converts schema SDL, not live remote endpoints.",
      "Custom runtime resolver behavior is not represented in introspection JSON.",
      "Very large schemas may take longer to process in the browser."
    ],
    faqs: [
      {
        question: "Can this fetch introspection from a GraphQL endpoint?",
        answer:
          "No. Paste schema SDL into the editor. It does not make network requests to remote GraphQL APIs."
      },
      {
        question: "Is introspection JSON the same as SDL?",
        answer:
          "No. SDL is human-readable schema text; introspection JSON is a structured machine-readable schema representation."
      },
      {
        question: "Can I use the output with GraphQL Code Generator?",
        answer:
          "Yes, many GraphQL tools accept introspection JSON, but check the expected schema format for your specific setup."
      }
    ]
  },
  "/tools/js-object-to-json": {
    metaTitle:
      "JS Object to JSON Converter | Fix JavaScript Object Literals | Folioify",
    metaDescription:
      "Convert JavaScript object literals into strict JSON with quoted keys, valid strings, and copy-ready output.",
    keywords: [
      "JS object to JSON",
      "JavaScript object to JSON",
      "object literal to JSON",
      "fix JSON"
    ],
    summary:
      "Use JS Object to JSON when copied configuration or console data looks like JavaScript but needs to become strict JSON for APIs, config files, or docs.",
    whatIs:
      "JS Object to JSON converts object literal syntax into valid JSON syntax by normalizing keys, strings, booleans, arrays, and nested objects.",
    capabilities: [
      "Convert unquoted object keys into JSON keys.",
      "Normalize JavaScript-style object literals for JSON consumers.",
      "Handle nested arrays and nested object structures.",
      "Produce output that can be pasted into API clients and config files."
    ],
    howItWorks: [
      "Paste a JavaScript object literal into the editor.",
      "The converter evaluates and serializes compatible values into JSON.",
      "Copy the formatted JSON output."
    ],
    useCases: [
      "Convert copied browser console objects into JSON.",
      "Prepare sample API payloads for documentation.",
      "Clean app configuration before moving it into a JSON file."
    ],
    inputExample: `{
  name: "Folioify",
  features: ["tools", "preview"],
  private: true
}`,
    outputExample: `{
  "name": "Folioify",
  "features": ["tools", "preview"],
  "private": true
}`,
    commonErrors: [
      "Functions, undefined, Date objects, and class instances are not valid JSON values.",
      "Trailing expressions or assignments can make the input invalid.",
      "Circular references cannot be represented in JSON."
    ],
    limitations: [
      "Only JSON-compatible values should be used.",
      "Comments are not part of JSON and may need to be removed.",
      "Do not paste untrusted executable code."
    ],
    faqs: [
      {
        question: "Why are my object keys quoted in the output?",
        answer:
          "JSON requires property names to be double-quoted strings, even when JavaScript object literals do not."
      },
      {
        question: "Can JSON include undefined?",
        answer:
          "No. JSON supports strings, numbers, booleans, null, arrays, and objects, but not undefined."
      },
      {
        question: "Is a JavaScript object the same as JSON?",
        answer:
          "No. JSON is a strict text format, while JavaScript object literals are programming language syntax."
      }
    ]
  },
  "/tools/html-to-pug": {
    metaTitle: "HTML to Pug Converter Online | Clean Pug Templates | Folioify",
    metaDescription:
      "Convert HTML to Pug online with readable indentation, nested template structure, and clearly disclosed server-backed processing. Free, no signup.",
    keywords: [
      "HTML to Pug converter",
      "HTML to Jade converter",
      "convert HTML to Pug online",
      "Pug template generator",
      "HTML template converter",
      "folioify"
    ],
    summary:
      "Convert HTML markup into clean Pug templates for Node, Express, static-site, and component prototyping workflows without installing a local converter.",
    whatIs:
      "HTML to Pug is an online template converter that sends submitted markup to Folioify for server-backed transformation into indentation-based Pug syntax. It is useful when migrating existing markup into Pug/Jade templates or cleaning copied HTML examples for server-rendered views.",
    capabilities: [
      "Convert nested HTML elements into indentation-based Pug syntax.",
      "Preserve text content, attributes, classes, and IDs in template-friendly form.",
      "Speed up migration from static HTML snippets to Pug or Jade-style templates.",
      "Run conversion without creating an Express or Node project."
    ],
    howItWorks: [
      "Paste complete HTML markup into the input editor.",
      "The converter parses element nesting, attributes, classes, IDs, and text nodes.",
      "Review the generated Pug output and copy it into your template file."
    ],
    useCases: [
      "Convert legacy HTML templates into Pug during Express app migration.",
      "Turn copied HTML documentation examples into cleaner indentation-based templates.",
      "Prototype server-rendered pages before wiring them into a framework.",
      "Normalize small HTML snippets before adding them to a design-system example."
    ],
    inputExample: `<section class="hero">
  <h1>Hello Folioify</h1>
  <p>Convert HTML to Pug online.</p>
</section>`,
    outputExample: `section.hero
  h1 Hello Folioify
  p Convert HTML to Pug online.`,
    options: [
      "Use complete HTML fragments so nesting can be converted accurately.",
      "Review class, ID, and boolean attributes before pasting output into a template.",
      "Keep framework-specific directives separate if your target renderer needs custom syntax."
    ],
    commonErrors: [
      "Unclosed tags or invalid nesting can produce confusing indentation.",
      "Inline scripts and templating delimiters may need manual cleanup after conversion.",
      "Whitespace-sensitive text blocks should be reviewed carefully in the generated Pug."
    ],
    limitations: [
      "The converter handles markup syntax, not application routing or server variables.",
      "Framework-specific template helpers may require manual edits.",
      "Generated Pug should be checked in your target renderer before production use."
    ],
    faqs: [
      {
        question: "Is Pug the same as Jade?",
        answer:
          "Pug is the renamed version of Jade. Many older tutorials still say Jade, but modern packages and documentation use Pug."
      },
      {
        question: "Can I convert a full HTML page to Pug?",
        answer:
          "Yes. Full pages can be converted, but large documents should be reviewed for scripts, inline styles, and framework-specific attributes."
      },
      {
        question: "How does HTML to Pug process my template?",
        answer:
          "The submitted markup is sent to Folioify for server-backed conversion and returned as Pug output. Do not submit secrets or proprietary source code."
      },
      {
        question: "Will generated Pug work in Express?",
        answer:
          "It should work as a starting point for standard markup, but Express locals, includes, mixins, and layout blocks must be added manually."
      }
    ]
  },
  "/tools/json-to-go": {
    metaTitle: "JSON to Go Struct Generator Online | Golang Tags | Folioify",
    metaDescription:
      "Generate Go structs from JSON online with nested fields and struct tags. Free browser-based JSON to Golang converter.",
    keywords: [
      "JSON to Go struct",
      "JSON to Golang struct",
      "Go struct generator",
      "generate Go structs from JSON",
      "golang json tags",
      "folioify"
    ],
    summary:
      "Generate Go struct definitions from JSON samples so API payloads, config files, and test fixtures can be mapped into typed Golang code faster.",
    whatIs:
      "JSON to Go Struct is an online generator that reads a JSON example and creates Go struct declarations with field names and JSON tags. It is useful for turning API responses into typed models before adding validation, methods, or custom unmarshalling logic.",
    capabilities: [
      "Infer Go struct fields from JSON object keys and values.",
      "Generate nested structs for embedded objects and arrays.",
      "Add JSON tags so generated fields map back to original payload keys.",
      "Create copy-ready Go code without installing a local generator."
    ],
    howItWorks: [
      "Paste a representative JSON response or request body.",
      "The generator infers field names, primitive types, arrays, and nested objects.",
      "Review the Go struct output, rename fields if needed, and paste it into your package."
    ],
    useCases: [
      "Create Go models from REST API response examples.",
      "Draft struct definitions for config files or webhook payloads.",
      "Generate test fixture types before writing unmarshalling code.",
      "Compare JSON shape changes during backend integration work."
    ],
    inputExample: `{
  "id": 42,
  "name": "Folioify",
  "active": true,
  "tags": ["tools", "go"]
}`,
    outputExample: `type AutoGenerated struct {
  ID     int      \`json:"id"\`
  Name   string   \`json:"name"\`
  Active bool     \`json:"active"\`
  Tags   []string \`json:"tags"\`
}`,
    options: [
      "Use realistic JSON with optional and repeated fields represented.",
      "Rename generated structs and fields to match your package conventions.",
      "Run gofmt after copying output into your project."
    ],
    commonErrors: [
      "A single JSON sample may miss nullable or optional fields that exist in production.",
      "Mixed-type arrays can generate broad or imperfect Go types.",
      "Numbers may need manual review when int, float64, or custom decimal types matter."
    ],
    limitations: [
      "The generator cannot infer API semantics, validation rules, or custom unmarshalling behavior.",
      "Generated structs are a starting point and should be reviewed with real payload samples.",
      "Very large payloads can be harder to inspect manually after generation."
    ],
    faqs: [
      {
        question: "Does JSON to Go generate json tags?",
        answer:
          "Yes. The output includes JSON tags so Go fields can marshal and unmarshal using the original JSON key names."
      },
      {
        question: "Can it handle nested JSON objects?",
        answer:
          "Yes. Nested objects and arrays are converted into nested Go struct shapes, but naming should be reviewed."
      },
      {
        question: "Should I use one JSON sample or multiple samples?",
        answer:
          "Use the most representative sample you have. If production payloads vary, compare multiple samples and merge optional fields manually."
      },
      {
        question: "Is the generated Go code production-ready?",
        answer:
          "It is a strong draft. Run gofmt, rename types, add validation, and test unmarshalling with real API payloads before shipping."
      }
    ]
  },
  "/tools/typescript-to-javascript": {
    metaTitle: "TypeScript to JavaScript Compiler Online | TS to JS | Folioify",
    metaDescription:
      "Compile TypeScript to JavaScript online for quick previews, demos, and migration checks with clearly disclosed server-backed processing.",
    keywords: [
      "TypeScript to JavaScript",
      "TS to JS compiler",
      "compile TypeScript online",
      "TypeScript transpiler",
      "convert TypeScript to JavaScript",
      "folioify"
    ],
    summary:
      "Compile TypeScript snippets into plain JavaScript when you need to inspect emitted code, share examples, or test migration ideas without opening a local build pipeline.",
    whatIs:
      "TypeScript to JavaScript is an online transpiler that sends submitted snippets to Folioify for server-backed compilation, removes type syntax, and returns JavaScript output. It helps developers understand what a small TS example becomes after compilation.",
    capabilities: [
      "Compile TypeScript syntax into plain JavaScript output.",
      "Preview emitted code for functions, classes, interfaces, and type annotations.",
      "Create shareable JavaScript examples from typed snippets.",
      "Run quick TS to JS checks without installing TypeScript locally."
    ],
    howItWorks: [
      "Paste a TypeScript snippet into the editor.",
      "The compiler strips types and transforms supported syntax.",
      "Copy the emitted JavaScript and test it in your target runtime."
    ],
    useCases: [
      "Explain TypeScript examples in JavaScript documentation.",
      "Check emitted JavaScript before migrating a small file.",
      "Remove type annotations from copied snippets for demos.",
      "Debug whether a syntax issue comes from TypeScript or runtime JavaScript."
    ],
    inputExample: `type User = {
  id: number;
  name: string;
};

const greet = (user: User) => \`Hello \${user.name}\`;`,
    outputExample: `const greet = user => \`Hello \${user.name}\`;`,
    options: [
      "Use self-contained snippets for the clearest output.",
      "Review imports and runtime dependencies after compilation.",
      "Test emitted code in the browser or Node version you plan to support."
    ],
    commonErrors: [
      "Type-only constructs do not exist at runtime and disappear from output.",
      "Missing imported values can still break the emitted JavaScript.",
      "Compiler output may differ from your project's tsconfig settings."
    ],
    limitations: [
      "This page compiles snippets, not full multi-file TypeScript projects.",
      "It does not run type checking across your whole repository.",
      "Project-specific Babel, SWC, or tsconfig behavior may produce different output."
    ],
    faqs: [
      {
        question: "Does TypeScript to JavaScript run type checking?",
        answer:
          "This tool focuses on transpiling snippets to JavaScript. Use your project compiler for full type checking."
      },
      {
        question: "Why did my interface disappear?",
        answer:
          "Interfaces and type aliases are TypeScript-only constructs. They are removed because JavaScript has no runtime equivalent."
      },
      {
        question: "Can I compile React TSX here?",
        answer:
          "This page is best for TypeScript snippets. For JSX or TSX preview work, use the JSX Viewer page."
      },
      {
        question: "Is the output safe to paste into production?",
        answer:
          "Review and test the output in your target runtime first, especially when imports, decorators, or newer syntax are involved."
      }
    ]
  },
  "/tools/markdown-to-jsx": {
    metaTitle:
      "Markdown to JSX Converter with Live Preview | React MD Tool | Folioify",
    metaDescription:
      "Convert Markdown to JSX with live preview, frontmatter support, and React-friendly output. Free browser-based Markdown to JSX tool.",
    keywords: [
      "Markdown to JSX",
      "Markdown to React component",
      "convert markdown to jsx",
      "convert markdown to jsx online",
      "Markdown JSX live preview",
      "React markdown converter",
      "folioify"
    ],
    summary:
      "Convert Markdown documents into React-friendly JSX so docs, changelogs, landing-page copy, and content snippets can move into component code faster.",
    whatIs:
      "Markdown to JSX is a browser-based converter for turning Markdown content into JSX output. It is useful when you want Markdown authoring speed but need React components, previewable markup, or frontmatter-aware content handling.",
    capabilities: [
      "Convert headings, paragraphs, lists, links, code blocks, and emphasis into JSX.",
      "Preview Markdown changes before copying generated component markup.",
      "Handle frontmatter-oriented content workflows for docs and static pages.",
      "Create React-friendly output without setting up MDX or a build step."
    ],
    howItWorks: [
      "Paste Markdown into the editor, including frontmatter if your snippet uses it.",
      "Preview the rendered content and inspect the generated JSX output.",
      "Copy the JSX into a React component, docs page, or content pipeline."
    ],
    useCases: [
      "Convert README sections into React documentation pages.",
      "Move blog or changelog content into component-based layouts.",
      "Prototype landing-page copy from Markdown drafts.",
      "Prepare JSX snippets from Markdown examples during migration to React."
    ],
    inputExample: `---
title: Folioify Docs
---

# Getting Started

- Paste Markdown
- Preview output
- Copy JSX`,
    outputExample: `<>
  <h1>Getting Started</h1>
  <ul>
    <li>Paste Markdown</li>
    <li>Preview output</li>
    <li>Copy JSX</li>
  </ul>
</>`,
    options: [
      "Use frontmatter for document metadata when your workflow needs title or tags.",
      "Review code blocks and embedded HTML before using the generated JSX.",
      "Choose JSX output when you need component code instead of static HTML."
    ],
    commonErrors: [
      "Unclosed inline HTML inside Markdown can produce invalid JSX.",
      "Markdown tables and custom extensions may need manual cleanup.",
      "Frontmatter fields are metadata and may not appear in the rendered JSX body."
    ],
    limitations: [
      "This is not a full MDX runtime and does not execute imported React components.",
      "Custom Markdown plugins from your app are not automatically applied.",
      "Generated JSX should be reviewed for accessibility and design-system conventions."
    ],
    faqs: [
      {
        question: "Is Markdown to JSX the same as MDX?",
        answer:
          "No. MDX lets Markdown import and execute JSX components. This tool converts Markdown content into JSX output for review and copying."
      },
      {
        question: "Can it convert frontmatter?",
        answer:
          "It can support frontmatter-oriented workflows, but metadata should be reviewed separately from the rendered JSX body."
      },
      {
        question: "Does the converter upload my Markdown?",
        answer:
          "No. The conversion is designed for browser-based processing, so private drafts stay on your device."
      },
      {
        question: "When should I use Markdown to HTML instead?",
        answer:
          "Use Markdown to HTML when you need static markup. Use Markdown to JSX when the output will live inside a React component."
      }
    ]
  },
  "/tools/check-toml": {
    metaTitle: "TOML Validator Online | Check TOML Syntax | Folioify",
    metaDescription:
      "Validate TOML syntax online for pyproject.toml, Cargo config, and app settings with clear parse errors. Free and browser-based.",
    keywords: [
      "TOML syntax checker",
      "TOML validator",
      "check TOML",
      "validate TOML online",
      "pyproject.toml validator",
      "TOML lint",
      "folioify"
    ],
    summary:
      "Validate TOML files before they break package metadata, app configuration, CI jobs, or deployment settings.",
    whatIs:
      "The TOML Validator is a browser-based syntax checker for TOML configuration files. It parses pasted TOML and reports whether tables, keys, arrays, strings, booleans, dates, and numbers are valid TOML syntax.",
    capabilities: [
      "Validate TOML tables, arrays, strings, numbers, and booleans.",
      "Catch duplicate keys and malformed table headers.",
      "Check pyproject.toml, Cargo config, app config, and infrastructure snippets.",
      "Run validation locally in the browser without uploading config files."
    ],
    howItWorks: [
      "Paste TOML into the input editor.",
      "The parser checks TOML syntax and reports the first invalid structure it finds.",
      "Review the success message or fix the parse error before copying the config."
    ],
    useCases: [
      "Check pyproject.toml before publishing or committing Python package changes.",
      "Validate Cargo, Netlify, Hugo, or application config files.",
      "Validate application config copied from documentation.",
      "Debug a deployment config that fails with a TOML parse error."
    ],
    inputExample: `[package]
name = "folioify"
version = "1.0.0"

[features]
preview = true`,
    outputExample:
      "Valid TOML, or a parse error that points to the invalid TOML syntax.",
    options: [
      "Paste the complete table when debugging duplicate keys.",
      "Keep secrets out of examples; replace tokens with placeholder values.",
      "Use the TOML Formatter after validation when you also need consistent spacing."
    ],
    commonErrors: [
      "Duplicate keys inside the same table.",
      "Missing closing quotes in strings.",
      "Incorrect table headers such as [package without a closing bracket.",
      "Mixed array values where the target TOML parser expects consistent types."
    ],
    limitations: [
      "This checks TOML syntax, not whether your app understands every key.",
      "Semantic validation must still happen in the target tool.",
      "Secrets should not be pasted into browser tools, even when processing is local."
    ],
    faqs: [
      {
        question: "Does this TOML validator format TOML?",
        answer:
          "No. This page validates TOML syntax. Use the TOML Formatter page when you want consistent formatting."
      },
      {
        question: "Can it validate pyproject.toml?",
        answer:
          "Yes, it can check TOML syntax in pyproject.toml, though package-specific rules still depend on Python tooling."
      },
      {
        question: "Can it check Cargo.toml?",
        answer:
          "Yes. It can validate Cargo.toml syntax, but Rust package-specific semantics still need Cargo itself."
      },
      {
        question: "What does duplicate key mean in TOML?",
        answer:
          "A duplicate key means the same key is assigned more than once in the same TOML table."
      },
      {
        question: "Is my TOML uploaded to a server?",
        answer:
          "No. The validator is designed to run in your browser, so pasted config snippets are not uploaded to Folioify servers."
      }
    ]
  },
  "/tools/toml-formatter": {
    metaTitle: "TOML Formatter | Pretty Print TOML Config Online | Folioify",
    metaDescription:
      "Format TOML config files online with consistent indentation and readable table structure for package and app settings.",
    keywords: [
      "TOML formatter",
      "format TOML",
      "TOML pretty print",
      "TOML beautifier"
    ],
    summary:
      "Use the TOML Formatter to make configuration files easier to review by normalizing spacing, table layout, and nested config structure.",
    whatIs:
      "The TOML Formatter parses TOML and prints it back in a consistent style, making config diffs and code reviews easier to read.",
    capabilities: [
      "Pretty print TOML tables and key-value pairs.",
      "Normalize spacing around assignments.",
      "Improve readability for package and app config files.",
      "Validate syntax before producing formatted output."
    ],
    howItWorks: [
      "Paste TOML into the editor.",
      "The formatter parses the configuration text.",
      "Copy the formatted TOML output."
    ],
    useCases: [
      "Clean up pyproject.toml or Cargo-style config examples.",
      "Prepare readable TOML snippets for documentation.",
      "Normalize config before sending a pull request."
    ],
    inputExample: `[server]
host="localhost"
port=3000
enabled=true`,
    outputExample: `[server]
host = "localhost"
port = 3000
enabled = true`,
    commonErrors: [
      "Invalid TOML cannot be formatted until syntax is fixed.",
      "Duplicate keys will fail parsing.",
      "Comments and ordering should be reviewed after formatting."
    ],
    limitations: [
      "Formatting does not verify app-specific config names.",
      "Some original spacing choices may be normalized.",
      "Large config files can take longer to parse."
    ],
    faqs: [
      {
        question: "Does formatting change TOML values?",
        answer:
          "No. The formatter is intended to preserve values while making spacing and structure easier to read."
      },
      {
        question: "Can it fix invalid TOML automatically?",
        answer: "No. Fix syntax errors first, then run the formatter."
      },
      {
        question: "Is this different from TOML validation?",
        answer:
          "Yes. Validation checks whether TOML is valid; formatting rewrites valid TOML into a cleaner style."
      }
    ]
  },
  "/tools/js-object-to-typescript": {
    metaTitle:
      "JS Object to TypeScript Converter | Generate Types from Objects | Folioify",
    metaDescription:
      "Convert JavaScript object literals into TypeScript interfaces or type definitions for app models and API examples.",
    keywords: [
      "JS object to TypeScript",
      "JavaScript object to TypeScript",
      "object to TS type",
      "TypeScript interface generator"
    ],
    summary:
      "Use JS Object to TypeScript when you have object-shaped data and need a quick starting point for interfaces or type aliases.",
    whatIs:
      "JS Object to TypeScript infers TypeScript shapes from JavaScript object literals so copied examples can become typed models.",
    capabilities: [
      "Infer strings, numbers, booleans, arrays, and nested object structures.",
      "Generate TypeScript-friendly names and property types.",
      "Use examples from config, API responses, or state objects.",
      "Create a fast draft that can be refined manually."
    ],
    howItWorks: [
      "Paste a JavaScript object literal.",
      "The converter reads the value shape and maps it to TypeScript types.",
      "Review the output and rename fields or root types as needed."
    ],
    useCases: [
      "Create initial types from a copied object sample.",
      "Type frontend state objects during refactors.",
      "Document object-shaped configuration with TypeScript."
    ],
    inputExample: `{
  user: { id: 1, name: "Kai" },
  roles: ["admin", "editor"]
}`,
    outputExample: `type Root = {
  user: {
    id: number;
    name: string;
  };
  roles: string[];
};`,
    commonErrors: [
      "Mixed arrays may infer broad union or unknown-style types.",
      "Function values are not useful for structural JSON-like type inference.",
      "A single sample may miss optional fields that appear in real data."
    ],
    limitations: [
      "Generated types should be reviewed before production use.",
      "Optional fields require multiple samples or manual edits.",
      "Runtime validation is not included."
    ],
    faqs: [
      {
        question: "Can it detect optional fields?",
        answer:
          "A single object sample cannot reliably prove optional fields. Add them manually after generation."
      },
      {
        question: "Does it generate runtime validators?",
        answer:
          "No. Use a Zod converter when you need runtime validation schemas."
      },
      {
        question: "Can I use API response examples?",
        answer:
          "Yes. Paste representative response data and review the generated types."
      }
    ]
  },
  "/tools/css-to-js": {
    metaTitle:
      "CSS to JS Converter | CSS to JavaScript Style Objects | Folioify",
    metaDescription:
      "Convert CSS declarations into JavaScript style objects for React inline styles, CSS-in-JS experiments, and component examples.",
    keywords: [
      "CSS to JS",
      "CSS to JavaScript",
      "CSS to style object",
      "React inline style converter"
    ],
    summary:
      "Use CSS to JS to convert copied CSS declarations into JavaScript object syntax for React inline styles or CSS-in-JS workflows.",
    whatIs:
      "CSS to JS rewrites CSS property names and values into JavaScript object notation, including camelCased property names.",
    capabilities: [
      "Convert kebab-case CSS properties to camelCase keys.",
      "Wrap CSS values as JavaScript strings.",
      "Prepare style snippets for React components.",
      "Speed up migration from stylesheet examples to inline style objects."
    ],
    howItWorks: [
      "Paste CSS declarations or a CSS rule.",
      "The converter parses properties and values.",
      "Copy the generated JavaScript style object."
    ],
    useCases: [
      "Convert a small CSS snippet into React inline style syntax.",
      "Prototype CSS-in-JS examples from existing CSS.",
      "Move documentation examples into component code."
    ],
    inputExample: `.card {
  background-color: white;
  border-radius: 8px;
  font-size: 14px;
}`,
    outputExample: `{
  backgroundColor: "white",
  borderRadius: "8px",
  fontSize: "14px"
}`,
    commonErrors: [
      "Pseudo-selectors and media queries cannot be represented as simple inline style objects.",
      "CSS variables may need manual handling in the target component.",
      "Vendor-prefixed properties should be reviewed after conversion."
    ],
    limitations: [
      "Inline style objects do not support every CSS selector feature.",
      "Hover, focus, and responsive behavior require CSS-in-JS or class-based styling.",
      "Generated output is a starting point, not a complete styling system."
    ],
    faqs: [
      {
        question: "Why are CSS property names camelCased?",
        answer:
          "React style objects use JavaScript property names, so background-color becomes backgroundColor."
      },
      {
        question: "Can this convert media queries?",
        answer:
          "Simple style objects cannot represent media queries directly. Use a CSS-in-JS solution for responsive rules."
      },
      {
        question: "Is this for React only?",
        answer:
          "It is most useful for React style objects, but the output can help anywhere JavaScript style objects are accepted."
      }
    ]
  },
  "/tools/json-to-flow": {
    metaTitle:
      "JSON to Flow Converter | Generate Flow Types from JSON | Folioify",
    metaDescription:
      "Generate Flow type definitions from JSON samples for legacy Flow codebases, API data, and migration work.",
    keywords: [
      "JSON to Flow",
      "Flow type generator",
      "generate Flow types",
      "JSON Flow types"
    ],
    summary:
      "Use JSON to Flow when maintaining a Flow-based codebase and you need a quick type draft from sample API or config data.",
    whatIs:
      "JSON to Flow inspects a JSON sample and generates Flow type definitions that describe the same object shape.",
    capabilities: [
      "Infer object, array, string, number, boolean, and null shapes.",
      "Generate nested Flow type structures.",
      "Create starting points for API response and config typing.",
      "Help with Flow-to-TypeScript migration audits by making data shapes explicit."
    ],
    howItWorks: [
      "Paste representative JSON data.",
      "The converter infers the shape of the sample.",
      "Copy the Flow output and refine names or optional fields."
    ],
    useCases: [
      "Type API examples in an existing Flow project.",
      "Document JSON structures before migration.",
      "Create Flow types for fixtures and test data."
    ],
    inputExample: `{
  "id": "prod_1",
  "price": 29,
  "tags": ["tool", "preview"]
}`,
    outputExample: `type Root = {
  id: string,
  price: number,
  tags: Array<string>
};`,
    commonErrors: [
      "Invalid JSON input will not parse.",
      "A single sample cannot show fields that are optional in real API responses.",
      "Mixed arrays may infer broader types than expected."
    ],
    limitations: [
      "Generated types should be reviewed by a developer.",
      "Runtime validation is not generated.",
      "Flow syntax choices may need adjustment for local style rules."
    ],
    faqs: [
      {
        question: "Is JSON to Flow useful for new projects?",
        answer:
          "Most new projects use TypeScript, but this tool is useful for existing Flow codebases and migrations."
      },
      {
        question: "Can it infer exact object types?",
        answer:
          "It creates a practical starting point. Review exactness and optionality based on your Flow configuration."
      },
      {
        question: "Can I convert the result to TypeScript?",
        answer:
          "For migration work, use this to understand the shape, then use Flow-to-TypeScript tooling where needed."
      }
    ]
  },
  "/tools/flow-to-typescript": {
    metaTitle:
      "Flow to TypeScript Converter | Migrate Flow Types to TS | Folioify",
    metaDescription:
      "Convert Flow annotations and type definitions into TypeScript syntax for migration planning and code modernization.",
    keywords: [
      "Flow to TypeScript",
      "Flow to TS",
      "migrate Flow to TypeScript",
      "Flow type converter"
    ],
    summary:
      "Use Flow to TypeScript to speed up migration work by converting Flow-style annotations into TypeScript-like output for review.",
    whatIs:
      "Flow to TypeScript converts Flow type syntax into TypeScript syntax, helping teams move legacy annotations toward modern TS code.",
    capabilities: [
      "Convert common Flow type aliases and annotations.",
      "Help identify migration issues before manual cleanup.",
      "Support incremental Flow-to-TS modernization workflows.",
      "Produce copyable TypeScript output for review."
    ],
    howItWorks: [
      "Paste Flow-annotated source or type definitions.",
      "The converter rewrites supported Flow syntax into TypeScript.",
      "Review edge cases and update the result for your project conventions."
    ],
    useCases: [
      "Estimate migration effort for a Flow file.",
      "Convert simple shared types into TypeScript.",
      "Create a cleanup draft for code review."
    ],
    inputExample: `type User = {
  id: string,
  name?: string,
};`,
    outputExample: `type User = {
  id: string;
  name?: string;
};`,
    commonErrors: [
      "Flow-specific utility types may require manual TypeScript equivalents.",
      "Exact object type semantics can differ from TypeScript.",
      "Generated imports may need cleanup in a real project."
    ],
    limitations: [
      "This is a migration helper, not a full project migration engine.",
      "Always run TypeScript checks after applying converted code.",
      "Runtime behavior is not analyzed."
    ],
    faqs: [
      {
        question: "Can it migrate an entire repository?",
        answer:
          "No. This page converts snippets and files. Repository migration still needs build, lint, and test work."
      },
      {
        question: "Are Flow exact object types preserved?",
        answer:
          "Some semantics differ between Flow and TypeScript, so exact object types need manual review."
      },
      {
        question: "Should I trust the output without checking?",
        answer:
          "No. Use it as a starting point and run TypeScript checks in your project."
      }
    ]
  },
  "/tools/json-to-big-query": {
    metaTitle:
      "JSON to BigQuery Schema Converter | Generate Table Schema | Folioify",
    metaDescription:
      "Generate a BigQuery table schema from JSON sample data for analytics pipelines, event payloads, and warehouse ingestion.",
    keywords: [
      "JSON to BigQuery",
      "BigQuery schema generator",
      "JSON BigQuery schema",
      "GCP schema"
    ],
    summary:
      "Use JSON to BigQuery when you need a quick BigQuery schema draft from sample event data or API payloads.",
    whatIs:
      "JSON to BigQuery infers BigQuery field names and types from JSON so data engineers can bootstrap table schemas faster.",
    capabilities: [
      "Infer common BigQuery field types from JSON values.",
      "Handle nested objects and repeated array-like data.",
      "Create schema drafts for event and analytics payloads.",
      "Prepare copyable output for review before warehouse ingestion."
    ],
    howItWorks: [
      "Paste representative JSON data.",
      "The converter maps fields to BigQuery schema types.",
      "Review repeated, nullable, and nested fields before using the schema."
    ],
    useCases: [
      "Draft schemas for analytics events.",
      "Document payload shape for warehouse ingestion.",
      "Prototype BigQuery table definitions from API samples."
    ],
    inputExample: `{
  "event": "signup",
  "user_id": 123,
  "metadata": { "plan": "pro" }
}`,
    outputExample:
      "A BigQuery schema with fields such as event STRING, user_id INTEGER, and metadata RECORD.",
    commonErrors: [
      "A sample with null values may not reveal the intended type.",
      "Mixed arrays need manual schema review.",
      "Field names should be checked against BigQuery naming constraints."
    ],
    limitations: [
      "The output is a schema draft, not a guarantee that all production data fits.",
      "Partitioning and clustering are not inferred from JSON.",
      "Multiple representative samples produce better schemas than a single payload."
    ],
    faqs: [
      {
        question: "Can this infer partitioning?",
        answer:
          "No. Partitioning and clustering choices depend on query patterns and should be set manually."
      },
      {
        question: "Does it support nested records?",
        answer:
          "Yes, nested objects can become RECORD fields, but review nested and repeated data carefully."
      },
      {
        question: "Should I use one sample or many?",
        answer:
          "Use the most representative sample possible. A single small payload can miss optional or repeated fields."
      }
    ]
  }
};

export function getToolPageContent(path: string): ToolPageContent | undefined {
  return TOOL_PAGE_CONTENT[path] || buildGeneratedToolContent(path);
}

export function getToolPageFAQs(path: string): ToolFAQ[] | undefined {
  return getToolPageContent(path)?.faqs;
}

export function getCategoryPageContent(
  slug: string
): CategoryPageContent | undefined {
  return categoryContent[slug];
}
