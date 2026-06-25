import * as React from "react";
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack
} from "@codesandbox/sandpack-react";
import copy from "clipboard-copy";
import prettier from "prettier/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";
import {
  Copy,
  Download,
  Package,
  Loader2,
  PackagePlus,
  Plus,
  RefreshCw,
  ScissorsLineDashed,
  Trash2,
  Wand2,
  X
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useData } from "@hooks/useData";
import { JSX_SNIPPETS, SAMPLE_JSX } from "@/lib/jsx-viewer/preview";

type Dependencies = Record<string, string>;
type SandpackAppActions = {
  updateAppCode: (source: string) => void;
  restart: () => void;
};

const APP_FILE = "/src/App.tsx";
const MAIN_FILE = "/src/main.tsx";
const STYLE_FILE = "/src/styles.css";
const HTML_FILE = "/public/index.html";

const SANDPACK_MAIN = `import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

const SANDPACK_STYLES = `html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #0f172a;
  background: #ffffff;
}

* {
  box-sizing: border-box;
}
`;

const SANDPACK_HTML = `<div id="root"></div>`;

const dependencyNamePattern =
  /(?:import\s+(?:type\s+)?(?:[^"']+?\s+from\s+)?|import\s*\(|require\s*\()\s*["']([^"'./][^"']*)["']/g;

function getPackageName(importPath: string) {
  if (importPath.startsWith("@")) {
    return importPath.split("/").slice(0, 2).join("/");
  }

  return importPath.split("/")[0];
}

function getDetectedDependencies(source: string): Dependencies {
  const dependencies: Dependencies = {};
  const ignored = new Set(["react", "react-dom"]);
  let match: RegExpExecArray | null;

  while ((match = dependencyNamePattern.exec(source))) {
    const packageName = getPackageName(match[1]);
    if (!ignored.has(packageName)) {
      dependencies[packageName] = "latest";
    }
  }

  return dependencies;
}

function hasReactImport(source: string) {
  return /from\s+["']react["']|import\s+React|import\s+\*\s+as\s+React/.test(
    source
  );
}

function hasDefaultExport(source: string) {
  return /\bexport\s+default\b/.test(source);
}

function getPreviewCandidate(source: string) {
  const match = source.match(/\b(?:const|function|class)\s+([A-Z]\w*)\b/);
  return ["App", "Preview", "Component", match?.[1]].find(Boolean) || "App";
}

function normalizeUserSource(source: string) {
  const trimmed = source.trim();
  if (!trimmed) return SAMPLE_JSX;

  return /^\s*</.test(trimmed) ? `const App = () => (${trimmed});` : source;
}

function buildAppFile(source: string) {
  const normalized = normalizeUserSource(source);
  const parts: string[] = [];

  if (!hasReactImport(normalized)) {
    parts.push(`import * as React from "react";`);
  }

  parts.push(normalized);

  if (!hasDefaultExport(normalized)) {
    parts.push(`\nexport default ${getPreviewCandidate(normalized)};`);
  }

  return parts.join("\n");
}

async function formatJsxCode(source: string) {
  return prettier.format(source, {
    parser: "babel-ts",
    plugins: [prettierPluginBabel, prettierPluginEstree],
    semi: true,
    singleQuote: false,
    printWidth: 88
  });
}

function dependencyEntries(dependencies: Dependencies) {
  return Object.entries(dependencies).sort(([a], [b]) => a.localeCompare(b));
}

function SandpackBridge({
  actionRef,
  onCodeChange
}: {
  actionRef: React.MutableRefObject<SandpackAppActions | null>;
  onCodeChange: (code: string) => void;
}) {
  const { sandpack } = useSandpack();
  const activeCode = sandpack.files[APP_FILE]?.code || "";

  React.useEffect(() => {
    actionRef.current = {
      updateAppCode(source: string) {
        const nextCode = buildAppFile(source);
        onCodeChange(nextCode);
        sandpack.updateFile(APP_FILE, nextCode, true);
      },
      restart() {
        void sandpack.runSandpack();
      }
    };

    return () => {
      actionRef.current = null;
    };
  }, [actionRef, onCodeChange, sandpack]);

  React.useEffect(() => {
    if (activeCode) {
      onCodeChange(activeCode);
    }
  }, [activeCode, onCodeChange]);

  return null;
}

function DependencyBadge({
  name,
  version,
  source,
  onRemove
}: {
  name: string;
  version: string;
  source: "auto" | "manual";
  onRemove?: () => void;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700">
      <span className="truncate font-semibold">{name}</span>
      <span className="text-slate-400">@</span>
      <span className="truncate text-slate-500">{version}</span>
      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase text-slate-500">
        {source}
      </span>
      {onRemove ? (
        <button
          type="button"
          className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </span>
  );
}

export default function SandpackJsxViewer() {
  const [storedCode, setStoredCode] = useData("jsx");
  const [code, setCode] = React.useState(storedCode || SAMPLE_JSX);
  const [enableTailwindPreview, setEnableTailwindPreview] =
    React.useState(true);
  const [manualDependencies, setManualDependencies] =
    React.useState<Dependencies>({});
  const [packageName, setPackageName] = React.useState("");
  const [packageVersion, setPackageVersion] = React.useState("latest");
  const sandpackActionsRef = React.useRef<SandpackAppActions | null>(null);
  const initialFilesRef = React.useRef({
    [APP_FILE]: {
      code: buildAppFile(storedCode || SAMPLE_JSX),
      active: true
    },
    [MAIN_FILE]: {
      code: SANDPACK_MAIN,
      hidden: true
    },
    [STYLE_FILE]: {
      code: SANDPACK_STYLES,
      hidden: true
    },
    [HTML_FILE]: {
      code: SANDPACK_HTML,
      hidden: true
    }
  });

  React.useEffect(() => {
    if (!storedCode?.trim()) {
      setStoredCode(SAMPLE_JSX);
    }
  }, [setStoredCode, storedCode]);

  const autoDependencies = React.useMemo(
    () => getDetectedDependencies(code),
    [code]
  );
  const effectiveDependencies = React.useMemo(
    () => ({ ...autoDependencies, ...manualDependencies }),
    [autoDependencies, manualDependencies]
  );

  const handleCodeChange = React.useCallback(
    (nextCode: string) => {
      setCode(nextCode);
      setStoredCode(nextCode);
    },
    [setStoredCode]
  );

  const addDependency = React.useCallback(() => {
    const name = packageName.trim();
    const version = packageVersion.trim() || "latest";

    if (!name) return;
    if (name === "react" || name === "react-dom") {
      toast.info("React and ReactDOM are provided by the Sandpack template.");
      return;
    }

    setManualDependencies(prev => ({ ...prev, [name]: version }));
    setPackageName("");
    setPackageVersion("latest");
    toast.success(`Added ${name}@${version}`);
  }, [packageName, packageVersion]);

  const removeDependency = React.useCallback((name: string) => {
    setManualDependencies(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const applySnippet = React.useCallback((snippetCode: string) => {
    sandpackActionsRef.current?.updateAppCode(snippetCode);
  }, []);

  const formatCode = React.useCallback(async () => {
    try {
      const formatted = await formatJsxCode(code);
      sandpackActionsRef.current?.updateAppCode(formatted);
      toast.success("Formatted with Prettier.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to format JSX."
      );
    }
  }, [code]);

  const copyCode = React.useCallback(async () => {
    await copy(code);
    toast.success("Copied JSX source.");
  }, [code]);

  const downloadCode = React.useCallback(() => {
    const blob = new Blob([code], { type: "text/typescript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "App.tsx";
    link.click();
    URL.revokeObjectURL(url);
  }, [code]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Package className="mr-1.5 h-4 w-4" />
                Dependencies
                <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                  {dependencyEntries(effectiveDependencies).length}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(92vw,420px)] p-4" align="start">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Dependencies
                  </h3>
                  <span className="rounded-full bg-brand-50 px-2 py-1 text-[11px] font-medium text-brand-700">
                    Sandpack npm
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_112px_auto]">
                  <Input
                    value={packageName}
                    onChange={event => setPackageName(event.target.value)}
                    placeholder="package name"
                    onKeyDown={event => {
                      if (event.key === "Enter") addDependency();
                    }}
                  />
                  <Input
                    value={packageVersion}
                    onChange={event => setPackageVersion(event.target.value)}
                    placeholder="version"
                    onKeyDown={event => {
                      if (event.key === "Enter") addDependency();
                    }}
                  />
                  <Button type="button" onClick={addDependency}>
                    <PackagePlus className="mr-1.5 h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="max-h-48 overflow-auto rounded-lg border border-slate-100 bg-slate-50 p-2">
                  <div className="flex flex-wrap gap-2">
                    {dependencyEntries(effectiveDependencies).length ? (
                      dependencyEntries(effectiveDependencies).map(
                        ([name, version]) => (
                          <DependencyBadge
                            key={name}
                            name={name}
                            version={version}
                            source={
                              manualDependencies[name] ? "manual" : "auto"
                            }
                            onRemove={
                              manualDependencies[name]
                                ? () => removeDependency(name)
                                : undefined
                            }
                          />
                        )
                      )
                    ) : (
                      <p className="px-1 py-2 text-xs text-slate-500">
                        Import a package or add one manually.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <ScissorsLineDashed className="mr-1.5 h-4 w-4" />
                Snippets
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(92vw,360px)] p-2" align="start">
              <div className="grid max-h-80 gap-1 overflow-auto">
                {JSX_SNIPPETS.map(snippet => (
                  <button
                    key={snippet.id}
                    type="button"
                    className="rounded-lg px-3 py-2 text-left transition hover:bg-brand-50"
                    onClick={() => applySnippet(snippet.code)}
                  >
                    <span className="block text-sm font-semibold text-slate-900">
                      {snippet.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {snippet.description}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-1.5 h-4 w-4" />
                Workspace
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(92vw,280px)] p-2" align="start">
              <div className="grid gap-1">
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => sandpackActionsRef.current?.restart()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Restart sandbox
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={downloadCode}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download App.tsx
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => applySnippet(SAMPLE_JSX)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Reset starter
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-red-600 hover:text-red-700"
                  onClick={() => {
                    setManualDependencies({});
                    toast.success("Manual dependencies cleared.");
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear manual deps
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-9 items-center gap-3 rounded-md border border-purple-200 bg-purple-50 px-3">
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
          <Button variant="outline" size="sm" onClick={formatCode}>
            <Wand2 className="mr-1.5 h-4 w-4" />
            Format
          </Button>
          <Button variant="outline" size="sm" onClick={copyCode}>
            <Copy className="mr-1.5 h-4 w-4" />
            Copy
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <SandpackProvider
          template="react-ts"
          files={initialFilesRef.current}
          customSetup={{
            entry: MAIN_FILE,
            dependencies: effectiveDependencies
          }}
          options={{
            activeFile: APP_FILE,
            visibleFiles: [APP_FILE],
            externalResources: enableTailwindPreview
              ? ["https://cdn.tailwindcss.com"]
              : [],
            initMode: "user-visible",
            recompileMode: "delayed",
            recompileDelay: 300
          }}
          theme="light"
        >
          <SandpackBridge
            actionRef={sandpackActionsRef}
            onCodeChange={handleCodeChange}
          />
          <SandpackLayout className="min-h-[calc(100vh-260px)]">
            <SandpackCodeEditor
              showTabs
              showLineNumbers
              showInlineErrors
              wrapContent
              style={{ minHeight: "calc(100vh - 260px)", height: 820 }}
            />
            <SandpackPreview
              showNavigator
              showRefreshButton
              style={{ minHeight: "calc(100vh - 260px)", height: 820 }}
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </section>
  );
}
