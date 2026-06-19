import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { runPreviewResolver } from "@/lib/jsx-viewer/preview";

const TAILWIND_SCRIPT_ID = "jsx-viewer-tailwind-cdn";

function useTailwindCdn(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") {
      return;
    }

    if (document.getElementById(TAILWIND_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement("script");
    script.id = TAILWIND_SCRIPT_ID;
    script.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(script);
  }, [enabled]);
}

type JsxPreviewPanelProps = {
  previewRuntimeCode: string;
  enableTailwindPreview: boolean;
  refreshKey: number;
};

export default function JsxPreviewPanel({
  previewRuntimeCode,
  enableTailwindPreview,
  refreshKey
}: JsxPreviewPanelProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Root | null>(null);
  const [error, setError] = useState<string | null>(null);

  useTailwindCdn(enableTailwindPreview);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) {
      return;
    }

    if (rootRef.current) {
      rootRef.current.unmount();
      rootRef.current = null;
    }

    if (!previewRuntimeCode.trim()) {
      mountNode.replaceChildren();
      setError(null);
      return;
    }

    try {
      const previewComponent = runPreviewResolver(previewRuntimeCode, React);
      const element = React.isValidElement(previewComponent)
        ? previewComponent
        : React.createElement(previewComponent as React.ComponentType);

      rootRef.current = createRoot(mountNode);
      rootRef.current.render(element);
      setError(null);
    } catch (previewError) {
      mountNode.replaceChildren();
      setError(
        previewError instanceof Error
          ? previewError.message
          : String(previewError)
      );
    }

    return () => {
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
    };
  }, [previewRuntimeCode, refreshKey]);

  return (
    <div
      className="relative h-[calc(100%-44px)] overflow-auto bg-white"
      data-clarity-unmask="true"
    >
      {error ? (
        <div className="m-4 whitespace-pre-wrap rounded-[10px] border border-red-200 bg-red-100 px-3 py-2.5 text-[13px] text-red-800">
          {error}
        </div>
      ) : null}
      <div
        ref={mountRef}
        className="min-h-full p-4"
        data-clarity-unmask="true"
      />
    </div>
  );
}
