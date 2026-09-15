import dynamic from "next/dynamic";
import { Loader2, RefreshCw } from "lucide-react";

const WORKSPACE_LOAD_TIMEOUT_MS = 15_000;

function loadSandpackJsxViewer() {
  return Promise.race([
    import("@components/jsx-viewer/SandpackJsxViewer"),
    new Promise<never>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error("JSX workspace download timed out."));
      }, WORKSPACE_LOAD_TIMEOUT_MS);
    })
  ]);
}

const SandpackJsxViewer = dynamic(loadSandpackJsxViewer, {
  ssr: false,
  loading: ({ error, retry }) => (
    <div className="flex min-h-[720px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
      {error ? (
        <div
          role="alert"
          className="mx-4 max-w-md rounded-xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-900 shadow-sm"
        >
          <p className="font-semibold">Unable to load the JSX workspace.</p>
          <p className="mt-1 text-red-700">
            Check your connection, then retry the editor download.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 font-semibold text-red-800 hover:bg-red-100"
            onClick={retry}
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
        </div>
      ) : (
        <div
          role="status"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
        >
          <Loader2
            className="h-4 w-4 animate-spin text-brand-600"
            aria-hidden
          />
          Loading Sandpack workspace...
        </div>
      )}
    </div>
  )
});

export default function JsxViewer() {
  return <SandpackJsxViewer />;
}
