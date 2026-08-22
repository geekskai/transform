import EditorPanel from "@components/EditorPanel";
import { useData } from "@hooks/useData";
import { Button } from "@/components/ui/button";
import {
  buildSafeHtmlPreviewDocument,
  transformXmlWithXslt
} from "@/lib/xml-tools";
import { trackProductEvent } from "@/lib/product-analytics";
import { Code2, Eye, Loader2, Play, TriangleAlert } from "lucide-react";
import * as React from "react";
import { useCallback, useMemo, useState } from "react";

type ResultView = "source" | "preview";

export default function XmlToHtml() {
  const [xmlSource, setXmlSource] = useData("xml");
  const [xsltSource, setXsltSource] = useData("xslt");
  const [html, setHtml] = useState("");
  const [message, setMessage] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [resultView, setResultView] = useState<ResultView>("source");
  const previewDocument = useMemo(
    () => buildSafeHtmlPreviewDocument(html),
    [html]
  );

  const runTransformation = useCallback(async () => {
    trackProductEvent("tool_conversion_started");
    setIsRunning(true);
    setMessage("");

    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    try {
      const result = await transformXmlWithXslt(
        xmlSource || "",
        xsltSource || ""
      );
      setHtml(result.html);
      setResultView("source");
      trackProductEvent("tool_conversion_completed");
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Unable to transform XML.";
      setMessage(nextMessage);
      trackProductEvent("tool_conversion_failed");
    } finally {
      setIsRunning(false);
    }
  }, [xmlSource, xsltSource]);

  return (
    <div className="space-y-4">
      <div className="grid min-h-[720px] min-w-0 gap-4 lg:grid-cols-2">
        <div className="grid min-w-0 gap-4 md:grid-rows-2">
          <div className="flex min-h-[320px] min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <EditorPanel
              id="xml-source"
              title="XML document"
              language="xml"
              defaultValue={xmlSource || ""}
              onChange={setXmlSource}
              hasLoad
              hasClear
              hasCopy={false}
              acceptFiles=".xml,text/xml,application/xml"
              analyticsRole="input"
            />
          </div>

          <div className="flex min-h-[320px] min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <EditorPanel
              id="xslt-source"
              title="XSLT 1.0 stylesheet"
              language="xml"
              defaultValue={xsltSource || ""}
              onChange={setXsltSource}
              hasLoad
              hasClear
              hasCopy={false}
              acceptFiles=".xsl,.xslt,text/xml,application/xml"
              analyticsRole="input"
            />
          </div>
        </div>

        <div className="flex min-h-[420px] min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex min-h-12 flex-wrap items-center gap-2 border-b px-3 py-2">
            <div className="mr-auto text-sm font-semibold text-gray-900">
              HTML result
            </div>
            <Button
              type="button"
              size="sm"
              variant={resultView === "source" ? "default" : "outline"}
              onClick={() => setResultView("source")}
            >
              <Code2 className="mr-2 h-4 w-4" />
              Source
            </Button>
            <Button
              type="button"
              size="sm"
              variant={resultView === "preview" ? "default" : "outline"}
              onClick={() => setResultView("preview")}
              disabled={!html}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>

          <div className="flex min-h-0 flex-1" data-clarity-mask="true">
            {resultView === "source" ? (
              <EditorPanel
                id="html-result"
                title="Generated HTML"
                language="html"
                defaultValue={html}
                editable={false}
                hasPrettier={false}
                analyticsRole="result"
              />
            ) : (
              <iframe
                title="Isolated HTML preview"
                className="h-full min-h-[640px] w-full bg-white"
                sandbox=""
                referrerPolicy="no-referrer"
                srcDoc={previewDocument}
              />
            )}
          </div>
        </div>
      </div>

      {message ? (
        <div
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          <TriangleAlert className="mt-0.5 h-5 w-5 flex-none" />
          <span>{message}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 text-sm text-gray-600">
          Runs locally with browser-based XSLT 1.0. External stylesheets and
          resources are blocked.
        </p>
        <Button
          type="button"
          onClick={runTransformation}
          disabled={isRunning || !xmlSource?.trim() || !xsltSource?.trim()}
          className="min-w-44"
        >
          {isRunning ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Run transformation
        </Button>
      </div>
    </div>
  );
}
