import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { markdown } from "markdown";
import YAML from "yaml";
import HtmlToJsx from "htmltojsx";
import EditorPanel from "@components/EditorPanel";
import { useData } from "@hooks/useData";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

type OutputStyle = "function" | "class";
type ViewTab = "code" | "preview";

const DEFAULT_MAPPING = `{
  "h1": "Heading",
  "h2": "SubHeading"
}`;

function extractFrontmatter(value: string) {
  const match = value.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { frontmatter: undefined, content: value };

  const rawFrontmatter = match[1];
  const content = value.slice(match[0].length);
  const frontmatter = YAML.parse(rawFrontmatter);
  return { frontmatter, content };
}

function addClassToTag(html: string, tagName: string, classNames: string) {
  const regex = new RegExp(`<${tagName}(\\s[^>]*)?>`, "gi");
  return html.replace(regex, (fullTag, attrs = "") => {
    const classMatch = attrs.match(/\sclass=["']([^"']*)["']/i);
    if (classMatch) {
      const existing = classMatch[1].trim();
      const merged = `${existing} ${classNames}`.trim();
      return fullTag.replace(classMatch[0], ` class="${merged}"`);
    }

    return `<${tagName}${attrs} class="${classNames}">`;
  });
}

function applyTailwindPreset(html: string) {
  let next = html;
  next = addClassToTag(next, "h1", "text-3xl font-bold tracking-tight mb-4");
  next = addClassToTag(
    next,
    "h2",
    "text-2xl font-semibold tracking-tight mb-3"
  );
  next = addClassToTag(next, "h3", "text-xl font-semibold mb-2");
  next = addClassToTag(next, "p", "leading-7 mb-3 text-slate-700");
  next = addClassToTag(next, "ul", "list-disc pl-6 space-y-2 mb-3");
  next = addClassToTag(next, "ol", "list-decimal pl-6 space-y-2 mb-3");
  next = addClassToTag(
    next,
    "blockquote",
    "border-l-4 border-slate-300 pl-4 italic text-slate-600"
  );
  next = addClassToTag(
    next,
    "pre",
    "bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto mb-4"
  );
  next = addClassToTag(next, "code", "font-mono text-sm");
  next = addClassToTag(
    next,
    "a",
    "text-blue-600 underline hover:text-blue-500"
  );

  return next;
}

function replaceTagName(jsx: string, fromTag: string, toTag: string) {
  const openTag = new RegExp(`<${fromTag}(?=[\\s>/])`, "g");
  const closeTag = new RegExp(`</${fromTag}>`, "g");
  return jsx.replace(openTag, `<${toTag}`).replace(closeTag, `</${toTag}>`);
}

function applyComponentMapping(jsx: string, mappingText: string) {
  if (!mappingText.trim()) return jsx;

  const parsed = JSON.parse(mappingText) as Record<string, string>;
  let output = jsx;
  Object.entries(parsed).forEach(([fromTag, toTag]) => {
    if (!fromTag || !toTag) return;
    output = replaceTagName(output, fromTag, toTag);
  });
  return output;
}

function convertImagesToNextImage(jsx: string) {
  return jsx.replace(/<img([^>]*)\/?>/g, (_full, attrs: string) => {
    const hasWidth = /\swidth=/.test(attrs);
    const hasHeight = /\sheight=/.test(attrs);
    const withSize = `${attrs}${hasWidth ? "" : " width={800}"}${
      hasHeight ? "" : " height={450}"
    }`;
    return `<Image${withSize} />`;
  });
}

function wrapCodeBlocksWithPrism(jsx: string) {
  return jsx.replace(
    /<pre>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/g,
    (_full, attrs: string, code: string) => {
      const languageMatch = attrs.match(/language-([A-Za-z0-9_-]+)/);
      const language = languageMatch?.[1] || "text";
      const safeCode = code.replace(/`/g, "\\`");
      return `<Prism language="${language}">{\`${safeCode}\`}</Prism>`;
    }
  );
}

function buildPreviewDocument(html: string, includeTailwind: boolean) {
  const safeHtml = html.replace(/<\/script/gi, "<\\/script");
  const tailwindScript = includeTailwind
    ? `<script src="https://cdn.tailwindcss.com"></script>`
    : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${tailwindScript}
    <style>
      body {
        margin: 0;
        padding: 16px;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        color: #0f172a;
        background: #ffffff;
      }
    </style>
  </head>
  <body>
    ${safeHtml}
  </body>
</html>`;
}

function buildComponentCode(args: {
  jsxBody: string;
  frontmatter: unknown;
  outputStyle: OutputStyle;
  addUseClient: boolean;
  convertImagesToNext: boolean;
  codeHighlighting: boolean;
}) {
  const {
    jsxBody,
    frontmatter,
    outputStyle,
    addUseClient,
    convertImagesToNext,
    codeHighlighting
  } = args;

  let jsxContent = jsxBody;
  if (convertImagesToNext) {
    jsxContent = convertImagesToNextImage(jsxContent);
  }
  if (codeHighlighting) {
    jsxContent = wrapCodeBlocksWithPrism(jsxContent);
  }

  const useClientDirective = addUseClient ? `'use client';\n\n` : "";
  const reactImport =
    outputStyle === "class" ? `import React from "react";\n` : "";
  const imageImport =
    convertImagesToNext && jsxContent.includes("<Image")
      ? `import Image from "next/image";\n`
      : "";
  const helperComment = codeHighlighting
    ? `// Note: Provide a Prism component implementation in your app.\n`
    : "";
  const frontmatterConst =
    frontmatter && typeof frontmatter === "object"
      ? `const frontmatter = ${JSON.stringify(frontmatter, null, 2)};\n`
      : "";

  if (outputStyle === "class") {
    return `${useClientDirective}${reactImport}${imageImport}${helperComment}${frontmatterConst}
export default class MarkdownContent extends React.Component {
  render() {
    return (
      <section>
        ${jsxContent}
      </section>
    );
  }
}`;
  }

  return `${useClientDirective}${reactImport}${imageImport}${helperComment}${frontmatterConst}
export default function MarkdownContent() {
  return (
    <section>
      ${jsxContent}
    </section>
  );
}`;
}

export default function MarkdownToJsx() {
  const [markdownValue, setMarkdownValue] = useData("markdown");
  const [mappingValue, setMappingValue] = useState(DEFAULT_MAPPING);
  const [outputStyle, setOutputStyle] = useState<OutputStyle>("function");
  const [includeTailwind, setIncludeTailwind] = useState(true);
  const [addUseClient, setAddUseClient] = useState(false);
  const [convertImageToNext, setConvertImageToNext] = useState(false);
  const [wrapCodeBlocks, setWrapCodeBlocks] = useState(false);
  const [componentMappingMode, setComponentMappingMode] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>("code");
  const [jsxOutput, setJsxOutput] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const input = markdownValue || "";
        if (!input.trim()) {
          setJsxOutput("");
          setPreviewHtml("");
          setErrorMessage("");
          return;
        }

        const { frontmatter, content } = extractFrontmatter(input);
        let html = markdown.toHTML(content);
        if (includeTailwind) {
          html = applyTailwindPreset(html);
        }

        const converter = new HtmlToJsx({ createClass: false });
        let jsxBody = converter.convert(html);
        if (componentMappingMode) {
          jsxBody = applyComponentMapping(jsxBody, mappingValue);
        }

        const result = buildComponentCode({
          jsxBody,
          frontmatter,
          outputStyle,
          addUseClient,
          convertImagesToNext: convertImageToNext,
          codeHighlighting: wrapCodeBlocks
        });

        setJsxOutput(result);
        setPreviewHtml(html);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to convert Markdown to JSX."
        );
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    markdownValue,
    mappingValue,
    outputStyle,
    includeTailwind,
    addUseClient,
    convertImageToNext,
    wrapCodeBlocks,
    componentMappingMode
  ]);

  const previewDoc = useMemo(
    () => buildPreviewDocument(previewHtml, includeTailwind),
    [previewHtml, includeTailwind]
  );

  return (
    <section className="space-y-5">
      <div className="space-y-2 text-sm text-gray-600">
        <p>
          Convert <strong>Markdown to JSX</strong> instantly with optional
          component mapping and frontmatter extraction.
        </p>
        <p className="text-xs text-gray-500">
          Workflow: Markdown input → JSX component output → visual preview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-purple-200 bg-purple-50/50 p-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Output Style
          </Label>
          <Select
            value={outputStyle}
            onValueChange={value => setOutputStyle(value as OutputStyle)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select output style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="function">Functional Component</SelectItem>
              <SelectItem value="class">Class Component</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2">
          <Label htmlFor="md-tailwind" className="text-sm">
            Include Tailwind CSS
          </Label>
          <Switch
            id="md-tailwind"
            checked={includeTailwind}
            onCheckedChange={setIncludeTailwind}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2">
          <Label htmlFor="md-use-client" className="text-sm">
            Add `use client`
          </Label>
          <Switch
            id="md-use-client"
            checked={addUseClient}
            onCheckedChange={setAddUseClient}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2">
          <Label htmlFor="md-component-map" className="text-sm">
            Component Mapping
          </Label>
          <Switch
            id="md-component-map"
            checked={componentMappingMode}
            onCheckedChange={setComponentMappingMode}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2">
          <Label htmlFor="md-next-image" className="text-sm">
            Convert img to Next/Image
          </Label>
          <Switch
            id="md-next-image"
            checked={convertImageToNext}
            onCheckedChange={setConvertImageToNext}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2">
          <Label htmlFor="md-code-highlight" className="text-sm">
            Wrap code blocks
          </Label>
          <Switch
            id="md-code-highlight"
            checked={wrapCodeBlocks}
            onCheckedChange={setWrapCodeBlocks}
          />
        </div>
      </div>

      {componentMappingMode && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <Label
            htmlFor="mapping-json"
            className="mb-2 block text-sm font-semibold"
          >
            Component Mapping JSON
          </Label>
          <textarea
            id="mapping-json"
            className="h-28 w-full rounded-xl border border-gray-200 p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
            value={mappingValue}
            onChange={e => setMappingValue(e.target.value)}
            spellCheck={false}
          />
        </div>
      )}

      <div className="flex min-h-[680px] overflow-hidden rounded-2xl border bg-white">
        <div className="flex flex-1 border-r">
          <EditorPanel
            id="markdown-to-jsx-input"
            title="Markdown"
            language="markdown"
            defaultValue={markdownValue || ""}
            onChange={setMarkdownValue}
            hasLoad
            hasClear
            hasCopy={false}
            acceptFiles={[".md", ".markdown", ".txt"]}
          />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex h-11 items-center justify-between border-b px-3">
            <h3 className="text-lg font-medium text-gray-900 m-0">Output</h3>
            <div className="inline-flex rounded-lg border p-1">
              <Button
                size="sm"
                variant={activeTab === "code" ? "default" : "ghost"}
                className="h-7"
                onClick={() => setActiveTab("code")}
              >
                JSX Code
              </Button>
              <Button
                size="sm"
                variant={activeTab === "preview" ? "default" : "ghost"}
                className="h-7"
                onClick={() => setActiveTab("preview")}
              >
                Visual Preview
              </Button>
            </div>
          </div>

          {activeTab === "code" ? (
            <EditorPanel
              id="markdown-to-jsx-output"
              title="Generated JSX Component"
              language="javascript"
              defaultValue={jsxOutput}
              editable={false}
              hasPrettier={false}
              hasLoad={false}
              hasClear={false}
            />
          ) : (
            <iframe
              title="Markdown to JSX visual preview"
              className="h-[calc(100%-44px)] w-full"
              sandbox="allow-scripts"
              srcDoc={previewDoc}
            />
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900 flex items-center gap-2">
          <TriangleAlert className="h-4 w-4 text-red-700" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}
    </section>
  );
}
