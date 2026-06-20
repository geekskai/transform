import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Loader2 } from "lucide-react";
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

export type PreviewRenderStatus = "idle" | "rendering" | "ready" | "error";

type JsxPreviewPanelProps = {
  previewRuntimeCode: string;
  enableTailwindPreview: boolean;
  refreshKey: number;
  isCompiling?: boolean;
  onRenderStatusChange?: (status: PreviewRenderStatus) => void;
};

type PreviewErrorBoundaryProps = {
  children: React.ReactNode;
  onError: (message: string) => void;
};

type PreviewErrorBoundaryState = {
  message: string | null;
};

class PreviewErrorBoundary extends React.Component<
  PreviewErrorBoundaryProps,
  PreviewErrorBoundaryState
> {
  state: PreviewErrorBoundaryState = { message: null };

  static getDerivedStateFromError(error: unknown): PreviewErrorBoundaryState {
    return {
      message: error instanceof Error ? error.message : String(error)
    };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error instanceof Error ? error.message : String(error));
  }

  render() {
    if (this.state.message) {
      return (
        <div className="whitespace-pre-wrap rounded-[10px] border border-red-200 bg-red-100 px-3 py-2.5 text-[13px] text-red-800">
          {this.state.message}
        </div>
      );
    }

    return this.props.children;
  }
}

export default function JsxPreviewPanel({
  previewRuntimeCode,
  enableTailwindPreview,
  refreshKey,
  isCompiling = false,
  onRenderStatusChange
}: JsxPreviewPanelProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Root | null>(null);
  const renderRunRef = useRef(0);
  const renderErrorRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [renderStatus, setRenderStatus] = useState<PreviewRenderStatus>("idle");
  const [hasRenderedContent, setHasRenderedContent] = useState(false);

  useTailwindCdn(enableTailwindPreview);

  const updateRenderStatus = React.useCallback(
    (status: PreviewRenderStatus) => {
      setRenderStatus(status);
      onRenderStatusChange?.(status);
    },
    [onRenderStatusChange]
  );

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) {
      return;
    }

    if (!previewRuntimeCode.trim()) {
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }

      mountNode.replaceChildren();
      setError(null);
      setHasRenderedContent(false);
      updateRenderStatus("idle");
      return;
    }

    const runId = renderRunRef.current + 1;
    renderRunRef.current = runId;
    renderErrorRef.current = false;
    setError(null);
    updateRenderStatus("rendering");

    const frameId = window.requestAnimationFrame(() => {
      if (renderRunRef.current !== runId) return;

      try {
        const previewComponent = runPreviewResolver(previewRuntimeCode, React);
        const element = React.isValidElement(previewComponent)
          ? previewComponent
          : React.createElement(previewComponent as React.ComponentType);

        if (rootRef.current) {
          rootRef.current.unmount();
          rootRef.current = null;
        }

        rootRef.current = createRoot(mountNode);
        rootRef.current.render(
          <PreviewErrorBoundary
            onError={() => {
              renderErrorRef.current = true;
              setError(null);
              updateRenderStatus("error");
            }}
          >
            {element}
          </PreviewErrorBoundary>
        );

        window.setTimeout(() => {
          if (renderRunRef.current !== runId || renderErrorRef.current) return;
          setHasRenderedContent(true);
          updateRenderStatus("ready");
        }, 0);
      } catch (previewError) {
        if (rootRef.current) {
          rootRef.current.unmount();
          rootRef.current = null;
        }

        mountNode.replaceChildren();
        setHasRenderedContent(false);
        setError(
          previewError instanceof Error
            ? previewError.message
            : String(previewError)
        );
        updateRenderStatus("error");
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [previewRuntimeCode, refreshKey, updateRenderStatus]);

  useEffect(() => {
    return () => {
      renderRunRef.current += 1;
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
    };
  }, []);

  const hasRuntimeCode = Boolean(previewRuntimeCode.trim());
  const showLoadingOverlay =
    isCompiling ||
    renderStatus === "rendering" ||
    (!hasRenderedContent && hasRuntimeCode && !error);
  const loadingLabel = isCompiling
    ? "Compiling JSX..."
    : "Rendering React preview...";

  return (
    <div
      className="relative h-[calc(100%-44px)] overflow-auto bg-white"
      data-clarity-unmask="true"
    >
      {showLoadingOverlay ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-[1px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
            {loadingLabel}
          </div>
        </div>
      ) : null}
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
