import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import prettier from "prettier/standalone";
import prettierPluginHtml from "prettier/plugins/html";
import EditorPanel from "@components/EditorPanel";
import { useData } from "@hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TriangleAlert } from "lucide-react";

type FormatMode = "beautify" | "minify";
type PreviewMode = "web" | "email";

const DEVICE_PRESETS = {
  desktop: 1440,
  tablet: 768,
  mobile: 375
} as const;

const EMAIL_PRESETS = {
  desktop: 600,
  mobile: 375
} as const;

const DEFAULT_HTML = `<div style="padding: 24px; font-family: Inter, Arial, sans-serif;">
  <h1 style="margin-bottom: 12px;">HTML Viewer</h1>
  <p style="margin-bottom: 12px;">
    Paste your HTML and preview instantly with device presets.
  </p>
  <button style="padding: 8px 12px; border: none; border-radius: 8px; background: #0ea5e9; color: white;">
    Preview Button
  </button>
</div>`;

function sanitizeHtml(input: string) {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\s(href|src)=["']javascript:[^"']*["']/gi, ` $1="#"`);
}

function minifyHtml(input: string) {
  return input.replace(/>\s+</g, "><").replace(/\n+/g, "").trim();
}

function parseAssetList(value: string) {
  return value
    .split(/[\n,]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function injectAssets(args: {
  html: string;
  cssAssets: string[];
  jsAssets: string[];
  inspectMode: boolean;
  outlineElements: boolean;
  previewMode: PreviewMode;
}) {
  const {
    html,
    cssAssets,
    jsAssets,
    inspectMode,
    outlineElements,
    previewMode
  } = args;
  const cssTags = cssAssets
    .map(url => `<link rel="stylesheet" href="${url}" />`)
    .join("\n");
  const jsTags = jsAssets
    .map(url => `<script src="${url}"><\\/script>`)
    .join("\n");

  const inspectScript = inspectMode
    ? `<script>
(() => {
  const badge = document.createElement("div");
  badge.style.position = "fixed";
  badge.style.left = "12px";
  badge.style.bottom = "12px";
  badge.style.padding = "8px 10px";
  badge.style.background = "rgba(15,23,42,0.9)";
  badge.style.color = "white";
  badge.style.font = "12px/1.4 monospace";
  badge.style.borderRadius = "8px";
  badge.style.zIndex = "2147483647";
  badge.style.pointerEvents = "none";
  badge.textContent = "Inspect mode";
  document.body.appendChild(badge);

  document.addEventListener("mouseover", event => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || target === badge) return;
    const styles = getComputedStyle(target);
    const margin = [styles.marginTop, styles.marginRight, styles.marginBottom, styles.marginLeft].join(" ");
    const padding = [styles.paddingTop, styles.paddingRight, styles.paddingBottom, styles.paddingLeft].join(" ");
    const size = target.offsetWidth + "x" + target.offsetHeight;
    badge.textContent = target.tagName.toLowerCase() + " | " + size + " | m: " + margin + " | p: " + padding;
  }, true);
})();
</script>`
    : "";

  const outlineStyle = outlineElements
    ? `<style>* { outline: 1px dashed rgba(14,165,233,0.35); }</style>`
    : "";

  const emailHelperStyle =
    previewMode === "email"
      ? `<style>
          html, body {
            margin: 0;
            padding: 0;
            background: #f8fafc;
          }
          table {
            border-collapse: collapse;
            border-spacing: 0;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
          }
          .email-preview-shell {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.06);
          }
        </style>`
      : "";

  return {
    cssTags,
    jsTags,
    inspectScript,
    outlineStyle,
    emailHelperStyle,
    html
  };
}

function buildPreviewDocument(args: {
  html: string;
  cssAssetInput: string;
  jsAssetInput: string;
  inspectMode: boolean;
  outlineElements: boolean;
  previewMode: PreviewMode;
}) {
  const {
    html,
    cssAssetInput,
    jsAssetInput,
    inspectMode,
    outlineElements,
    previewMode
  } = args;
  const assets = injectAssets({
    html,
    cssAssets: parseAssetList(cssAssetInput),
    jsAssets: parseAssetList(jsAssetInput),
    inspectMode,
    outlineElements,
    previewMode
  });

  const safeHtml = assets.html.replace(/<\/script/gi, "<\\/script");
  const hasHtmlTag = /<html[\s>]/i.test(safeHtml);

  if (hasHtmlTag) {
    return safeHtml
      .replace(
        /<\/head>/i,
        `${assets.emailHelperStyle}\n${assets.outlineStyle}\n${assets.cssTags}\n</head>`
      )
      .replace(
        /<\/body>/i,
        `${assets.jsTags}\n${assets.inspectScript}\n</body>`
      );
  }

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${assets.emailHelperStyle}
    ${assets.outlineStyle}
    ${assets.cssTags}
    <style>body { margin: 0; }</style>
  </head>
  <body>
    ${
      previewMode === "email"
        ? `<div class="email-preview-shell">${safeHtml}</div>`
        : safeHtml
    }
    ${assets.jsTags}
    ${assets.inspectScript}
  </body>
</html>`;
}

export default function HtmlViewer() {
  const [value, setValue] = useData("html");
  const [formattedHtml, setFormattedHtml] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [safeMode, setSafeMode] = useState(true);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("web");
  const [inspectMode, setInspectMode] = useState(false);
  const [outlineElements, setOutlineElements] = useState(false);
  const [formatMode, setFormatMode] = useState<FormatMode>("beautify");
  const [cssAssetInput, setCssAssetInput] = useState("");
  const [jsAssetInput, setJsAssetInput] = useState("");
  const [previewWidth, setPreviewWidth] = useState<number>(
    DEVICE_PRESETS.desktop
  );

  useEffect(() => {
    if (previewMode === "email") {
      setPreviewWidth(EMAIL_PRESETS.desktop);
    }
  }, [previewMode]);

  useEffect(() => {
    if (!value || !value.trim()) {
      setValue(DEFAULT_HTML);
    }
  }, [setValue, value]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const input = value || "";
      if (!input.trim()) {
        setFormattedHtml("");
        setErrorMessage("");
        return;
      }

      try {
        const normalized = safeMode ? sanitizeHtml(input) : input;
        const output =
          formatMode === "beautify"
            ? await prettier.format(normalized, {
                parser: "html",
                plugins: [prettierPluginHtml]
              })
            : minifyHtml(normalized);

        setFormattedHtml(output);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to process HTML."
        );
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, safeMode, formatMode]);

  const previewDoc = useMemo(
    () =>
      buildPreviewDocument({
        html: formattedHtml || "",
        cssAssetInput,
        jsAssetInput,
        inspectMode,
        outlineElements,
        previewMode
      }),
    [
      formattedHtml,
      cssAssetInput,
      jsAssetInput,
      inspectMode,
      outlineElements,
      previewMode
    ]
  );

  const downloadHtml = () => {
    const content = formattedHtml || "";
    const blob = new Blob([content], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "index.html";
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(formattedHtml || "");
    } catch {
      setErrorMessage("Failed to copy output.");
    }
  };

  return (
    <section className="space-y-5">
      <div className="space-y-2 text-sm text-gray-600">
        <p>
          Render and debug <strong>HTML</strong> instantly with sandboxed
          preview, device presets, and formatting controls.
        </p>
        <p className="text-xs text-gray-500">
          Workspace: Code Editor + Live Preview + Processed HTML output.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-cyan-200 bg-cyan-50/50 p-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Preview Mode
          </Label>
          <div className="inline-flex rounded-lg border p-1 bg-white">
            <Button
              size="sm"
              className="h-7"
              variant={previewMode === "web" ? "default" : "ghost"}
              onClick={() => setPreviewMode("web")}
            >
              Web
            </Button>
            <Button
              size="sm"
              className="h-7"
              variant={previewMode === "email" ? "default" : "ghost"}
              onClick={() => setPreviewMode("email")}
            >
              Email
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2">
          <Label htmlFor="html-safe-mode" className="text-sm">
            Safe Mode (strip scripts)
          </Label>
          <Switch
            id="html-safe-mode"
            checked={safeMode}
            onCheckedChange={setSafeMode}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2">
          <Label htmlFor="html-inspect-mode" className="text-sm">
            Inspect Mode
          </Label>
          <Switch
            id="html-inspect-mode"
            checked={inspectMode}
            onCheckedChange={setInspectMode}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2">
          <Label htmlFor="html-outline-mode" className="text-sm">
            Outline Elements
          </Label>
          <Switch
            id="html-outline-mode"
            checked={outlineElements}
            onCheckedChange={setOutlineElements}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Format Mode
          </Label>
          <div className="inline-flex rounded-lg border p-1 bg-white">
            <Button
              size="sm"
              className="h-7"
              variant={formatMode === "beautify" ? "default" : "ghost"}
              onClick={() => setFormatMode("beautify")}
            >
              Beautify
            </Button>
            <Button
              size="sm"
              className="h-7"
              variant={formatMode === "minify" ? "default" : "ghost"}
              onClick={() => setFormatMode("minify")}
            >
              Minify
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 p-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="external-css" className="text-sm font-medium">
            External CSS CDN (comma/newline separated)
          </Label>
          <Input
            id="external-css"
            placeholder="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
            value={cssAssetInput}
            onChange={e => setCssAssetInput(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="external-js" className="text-sm font-medium">
            External JS CDN (comma/newline separated)
          </Label>
          <Input
            id="external-js"
            placeholder="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"
            value={jsAssetInput}
            onChange={e => setJsAssetInput(e.target.value)}
          />
        </div>
      </div>

      <div className="flex min-h-[720px] overflow-hidden rounded-2xl border bg-white">
        <div className="flex flex-1 border-r">
          <EditorPanel
            id="html-viewer-input"
            title="HTML Code"
            language="html"
            defaultValue={value || ""}
            onChange={setValue}
            hasLoad
            hasClear
            hasCopy={false}
            acceptFiles={[".html", ".htm", ".txt"]}
          />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="h-1/2 min-h-[300px] border-b">
            <div className="flex h-11 items-center justify-between border-b px-3">
              <h3 className="text-lg font-medium text-gray-900 m-0">
                Live Preview
              </h3>
              <div className="inline-flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7"
                  onClick={() =>
                    setPreviewWidth(
                      previewMode === "email"
                        ? EMAIL_PRESETS.desktop
                        : DEVICE_PRESETS.desktop
                    )
                  }
                >
                  {previewMode === "email" ? "Email 600" : "Desktop"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7"
                  onClick={() =>
                    setPreviewWidth(
                      previewMode === "email"
                        ? EMAIL_PRESETS.mobile
                        : DEVICE_PRESETS.tablet
                    )
                  }
                >
                  {previewMode === "email" ? "Email Mobile" : "Tablet"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7"
                  onClick={() => setPreviewWidth(DEVICE_PRESETS.mobile)}
                >
                  Mobile
                </Button>
              </div>
            </div>
            <div className="flex h-[calc(100%-44px)] flex-col gap-2 p-2">
              <input
                type="range"
                min={320}
                max={1600}
                value={previewWidth}
                onChange={e => setPreviewWidth(Number(e.target.value))}
              />
              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span>Custom width: {previewWidth}px</span>
                <span>Resizable preview</span>
              </div>
              <div className="flex-1 overflow-auto rounded-lg border bg-slate-50 p-2">
                <iframe
                  title="HTML live preview"
                  className="h-full bg-white border rounded"
                  style={{ width: `${previewWidth}px`, maxWidth: "100%" }}
                  sandbox="allow-scripts"
                  srcDoc={previewDoc}
                />
              </div>
            </div>
          </div>

          <div className="h-1/2 min-h-[300px]">
            <div className="flex h-11 items-center justify-between border-b px-3">
              <h3 className="text-lg font-medium text-gray-900 m-0">
                Processed HTML
              </h3>
              <div className="inline-flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-7"
                  variant="outline"
                  onClick={copyOutput}
                >
                  Copy
                </Button>
                <Button size="sm" className="h-7" onClick={downloadHtml}>
                  Download File
                </Button>
              </div>
            </div>
            <EditorPanel
              id="html-viewer-output"
              title="Output"
              language="html"
              defaultValue={formattedHtml}
              editable={false}
              hasPrettier={false}
              hasLoad={false}
              hasClear={false}
            />
          </div>
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
