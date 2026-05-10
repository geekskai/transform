import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import * as Babel from "@babel/standalone";
import EditorPanel from "@components/EditorPanel";
import { useData } from "@hooks/useData";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TriangleAlert } from "lucide-react";

const PREVIEW_COMPONENT_ERROR =
  "No previewable React component found. Define App/Preview/Component, declare a PascalCase component, or paste a JSX fragment.";

const SAMPLE_JSX = `const ProductCard = ({ title, price, tags = [] }) => (
  <article className="rounded-2xl border border-slate-200 p-4 shadow-sm">
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="mt-2 text-slate-700">\${price}</p>
    <ul className="mt-3 flex gap-2">
      {tags.map(tag => (
        <li key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs">
          {tag}
        </li>
      ))}
    </ul>
  </article>
);

const App = () => (
  <ProductCard
    title="Starter Card"
    price={29}
    tags={["React", "JSX", "Preview"]}
  />
);
`;

function getPreviewCandidateNames(source: string) {
  const firstComponentMatch = source.match(
    /\b(?:const|function|class)\s+([A-Z][A-Za-z0-9_]*)\b/
  );
  const firstComponentName = firstComponentMatch?.[1] || "";

  return Array.from(
    new Set(["App", "Preview", "Component", firstComponentName].filter(Boolean))
  );
}

function normalizePreviewSource(source: string) {
  const trimmedSource = source.trim();
  return /^\s*</.test(trimmedSource)
    ? `const App = () => (${source});`
    : source;
}

function stripModuleSyntax(source: string) {
  return source
    .replace(/^\s*import\s+.*?from\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/^\s*import\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/export\s+default\s+/g, "")
    .replace(/export\s+(const|function|class)\s+/g, "$1 ");
}

function buildPreviewRuntime(source: string) {
  const normalizedSource = normalizePreviewSource(source);
  const previewCandidateNames = getPreviewCandidateNames(normalizedSource);

  return `${stripModuleSyntax(normalizedSource)}

const __previewCandidateNames = ${JSON.stringify(previewCandidateNames)};
let __PreviewComponent = null;

for (const __name of __previewCandidateNames) {
  try {
    const __candidate = eval(__name);
    if (__candidate) {
      __PreviewComponent = __candidate;
      break;
    }
  } catch (_) {}
}

if (!__PreviewComponent) {
  throw new Error(${JSON.stringify(PREVIEW_COMPONENT_ERROR)});
}

const __root = ReactDOM.createRoot(document.getElementById("root"));
__root.render(
  React.isValidElement(__PreviewComponent)
    ? __PreviewComponent
    : React.createElement(__PreviewComponent)
);`;
}

function sanitizeScriptContent(value: string) {
  return value.replace(/<\/script/gi, "<\\/script");
}

function buildPreviewDocument(
  compiledRuntimeCode: string,
  includeTailwind: boolean
) {
  const safeCompiledRuntimeCode = sanitizeScriptContent(compiledRuntimeCode);

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
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        background: #ffffff;
        color: #0f172a;
      }
      #root {
        min-height: 100vh;
        padding: 16px;
      }
      #error {
        margin: 16px;
        border-radius: 10px;
        border: 1px solid #fecaca;
        background: #fee2e2;
        color: #991b1b;
        padding: 10px 12px;
        font-size: 13px;
        white-space: pre-wrap;
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="error"></div>
    <div id="root"></div>

    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script>
      const showError = message => {
        const errorEl = document.getElementById("error");
        errorEl.style.display = "block";
        errorEl.textContent = message;
      };

      try {
${safeCompiledRuntimeCode
  .split("\n")
  .map(line => `        ${line}`)
  .join("\n")}
      } catch (error) {
        showError(error && error.message ? error.message : String(error));
      }
    </script>
  </body>
</html>`;
}

export default function JsxViewer() {
  const [value, setValue] = useData("jsx");
  const [transpiledCode, setTranspiledCode] = useState("");
  const [previewRuntimeCode, setPreviewRuntimeCode] = useState("");
  const [buildError, setBuildError] = useState("");
  const [enableTailwindPreview, setEnableTailwindPreview] = useState(true);

  useEffect(() => {
    if (!value || !value.trim()) {
      setValue(SAMPLE_JSX);
    }
  }, [setValue, value]);

  useEffect(() => {
    const input = value || "";
    const timer = setTimeout(() => {
      if (!input.trim()) {
        setTranspiledCode("");
        setPreviewRuntimeCode("");
        setBuildError("");
        return;
      }

      try {
        const normalizedInput = normalizePreviewSource(input);
        const transformed = Babel.transform(normalizedInput, {
          presets: ["react"],
          sourceType: "module",
          filename: "input.jsx"
        });
        const previewRuntime = Babel.transform(
          buildPreviewRuntime(normalizedInput),
          {
            presets: ["react"],
            sourceType: "script",
            filename: "preview.jsx"
          }
        );

        setTranspiledCode(transformed.code || "");
        setPreviewRuntimeCode(previewRuntime.code || "");
        setBuildError("");
      } catch (error) {
        setBuildError(
          error instanceof Error ? error.message : "Unable to parse JSX input."
        );
        setPreviewRuntimeCode("");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const previewDoc = useMemo(
    () => buildPreviewDocument(previewRuntimeCode, enableTailwindPreview),
    [previewRuntimeCode, enableTailwindPreview]
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p>
            Validate, transpile, and render <strong>JSX</strong> instantly with
            a <strong>live React preview</strong>.
          </p>
          <p className="text-xs text-gray-500">
            Define a component named <strong>App</strong>,{" "}
            <strong>Preview</strong>, or <strong>Component</strong> to render
            (or just paste a JSX fragment).
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-purple-200 bg-purple-50 px-4 py-2">
          <Switch
            id="tailwind-preview-toggle"
            checked={enableTailwindPreview}
            onCheckedChange={setEnableTailwindPreview}
          />
          <Label
            htmlFor="tailwind-preview-toggle"
            className="text-xs font-medium"
          >
            Tailwind CDN
          </Label>
        </div>
      </div>

      <div className="flex min-h-[680px] overflow-hidden rounded-2xl border bg-white">
        <div className="flex flex-1 border-r">
          <EditorPanel
            id="jsx-viewer-input"
            title="JSX / TSX Input"
            language="typescript"
            defaultValue={value || ""}
            onChange={setValue}
            hasLoad
            hasClear
            hasCopy={false}
            acceptFiles={[".jsx", ".tsx", ".js", ".ts"]}
          />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="h-1/2 min-h-[260px] border-b">
            <div className="flex h-11 items-center border-b px-3">
              <h3 className="text-lg font-medium text-gray-900 m-0">
                Live React Preview
              </h3>
            </div>
            <iframe
              title="JSX live preview"
              className="h-[calc(100%-44px)] w-full bg-white"
              sandbox="allow-scripts"
              srcDoc={previewDoc}
            />
          </div>

          <div className="h-1/2 min-h-[260px]">
            <EditorPanel
              id="jsx-viewer-transpiled"
              title="Transpiled JavaScript"
              language="javascript"
              defaultValue={transpiledCode}
              editable={false}
              hasPrettier={false}
              hasLoad={false}
              hasClear={false}
            />
          </div>
        </div>
      </div>

      {buildError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900 flex items-center gap-2">
          <TriangleAlert className="h-4 w-4 text-red-700" />
          <span className="text-sm font-medium">{buildError}</span>
        </div>
      )}
    </section>
  );
}
