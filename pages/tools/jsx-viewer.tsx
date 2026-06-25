import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const SandpackJsxViewer = dynamic(
  () => import("@components/jsx-viewer/SandpackJsxViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[720px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
          Loading Sandpack workspace...
        </div>
      </div>
    )
  }
);

export default function JsxViewer() {
  return <SandpackJsxViewer />;
}
