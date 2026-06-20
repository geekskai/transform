import * as React from "react";
import { useEffect, useState } from "react";
import * as Babel from "@babel/standalone";
import { useData } from "@hooks/useData";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, RefreshCw, TriangleAlert } from "lucide-react";
import JsxEditorPanel from "@components/jsx-viewer/JsxEditorPanel";
import JsxPreviewPanel, {
  type PreviewRenderStatus
} from "@components/jsx-viewer/JsxPreviewPanel";
import ResizableSplit from "@components/jsx-viewer/ResizableSplit";
import { SAMPLE_JSX, compileJsxInput } from "@/lib/jsx-viewer/preview";

type CompileStatus = "idle" | "compiling" | "ready" | "error";

export default function JsxViewer() {
  const [value, setValue] = useData("jsx");
  const [previewRuntimeCode, setPreviewRuntimeCode] = useState("");
  const [compileStatus, setCompileStatus] = useState<CompileStatus>("idle");
  const [diagnostic, setDiagnostic] = useState<{
    message: string;
    line?: number;
    column?: number;
  } | null>(null);
  const [enableTailwindPreview, setEnableTailwindPreview] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewStatus, setPreviewStatus] =
    useState<PreviewRenderStatus>("idle");

  useEffect(() => {
    if (!value || !value.trim()) {
      setValue(SAMPLE_JSX);
    }
  }, [setValue, value]);

  useEffect(() => {
    const input = value || "";

    if (!input.trim()) {
      setPreviewRuntimeCode("");
      setDiagnostic(null);
      setCompileStatus("idle");
      return;
    }

    setCompileStatus("compiling");

    const timer = setTimeout(() => {
      const result = compileJsxInput(input, (code, options) =>
        Babel.transform(code, options)
      );

      if (result.ok === false) {
        setPreviewRuntimeCode("");
        setDiagnostic({
          message: result.message,
          line: result.line,
          column: result.column
        });
        setCompileStatus("error");
        return;
      }

      setPreviewRuntimeCode(result.previewRuntimeCode);
      setDiagnostic(null);
      setCompileStatus("ready");
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const hasStatusError = compileStatus === "error" || previewStatus === "error";
  const isPreviewBusy =
    compileStatus === "compiling" || previewStatus === "rendering";
  const statusLabel =
    compileStatus === "error"
      ? "Fix errors to preview"
      : previewStatus === "error"
      ? "Preview error"
      : compileStatus === "compiling"
      ? "Updating preview…"
      : previewStatus === "rendering"
      ? "Rendering preview…"
      : compileStatus === "ready" && previewStatus === "ready"
      ? "Preview ready"
      : "Waiting for input";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p>
            Validate, transpile, and render <strong>JSX</strong> instantly with
            a <strong>live React preview</strong>.
          </p>
          <p className="text-xs text-gray-500">
            Define <strong>App</strong>, <strong>Preview</strong>, or{" "}
            <strong>Component</strong>, or paste a JSX fragment. Use{" "}
            <strong>Snippets</strong> and <strong>Format</strong> (⌘⇧F) in the
            editor toolbar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <ResizableSplit
          defaultLeftPercent={52}
          left={
            <JsxEditorPanel
              value={value || ""}
              onChange={setValue}
              diagnostic={diagnostic}
            />
          }
          right={
            <div className="flex h-full flex-col overflow-hidden">
              <div className="flex h-11 flex-shrink-0 items-center justify-between border-b px-3">
                <h3 className="m-0 text-lg font-medium text-gray-900">
                  Live React Preview
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      hasStatusError
                        ? "bg-red-50 text-red-700"
                        : compileStatus === "ready" && previewStatus === "ready"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isPreviewBusy && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    {compileStatus === "ready" && previewStatus === "ready" && (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    {hasStatusError && <TriangleAlert className="h-3 w-3" />}
                    {statusLabel}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7"
                    onClick={() => setPreviewKey(key => key + 1)}
                  >
                    <RefreshCw className="mr-1 h-3.5 w-3.5" />
                    Refresh
                  </Button>
                </div>
              </div>
              <JsxPreviewPanel
                previewRuntimeCode={previewRuntimeCode}
                enableTailwindPreview={enableTailwindPreview}
                refreshKey={previewKey}
                isCompiling={compileStatus === "compiling"}
                onRenderStatusChange={setPreviewStatus}
              />
            </div>
          }
        />
      </div>
    </section>
  );
}
