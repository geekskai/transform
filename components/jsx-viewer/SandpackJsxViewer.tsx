import * as React from "react";
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  type SandpackPreviewRef,
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
import { preparePreviewSource } from "@/lib/jsx-viewer/source-preparation";
import {
  classifySourceChange,
  type PreviewStatus
} from "@/lib/jsx-viewer/workspace-coordinator";
import { trackProductEvent } from "@/lib/product-analytics";

type Dependencies = Record<string, string>;
type SandpackAppActions = {
  updateAppCode: (source: string) => void;
  restart: () => void;
};

const USER_SOURCE_FILE = "/src/UserSource.tsx";
const APP_FILE = "/src/App.tsx";
const MAIN_FILE = "/src/main.tsx";
const STYLE_FILE = "/src/styles.css";
const HTML_FILE = "/public/index.html";
const PREVIEW_TIMEOUT_MS = 20_000;

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

function areDependenciesEqual(a: Dependencies, b: Dependencies) {
  const aEntries = dependencyEntries(a);
  const bEntries = dependencyEntries(b);

  if (aEntries.length !== bEntries.length) return false;

  return aEntries.every(
    ([name, version], index) =>
      name === bEntries[index][0] && version === bEntries[index][1]
  );
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debouncedValue;
}

function useStableDependencies(dependencies: Dependencies) {
  const stableRef = React.useRef(dependencies);

  if (!areDependenciesEqual(stableRef.current, dependencies)) {
    stableRef.current = dependencies;
  }

  return stableRef.current;
}

function SandpackBridge({
  actionRef,
  sourceCode,
  onCodeChange,
  onRestartPreview
}: {
  actionRef: React.MutableRefObject<SandpackAppActions | null>;
  sourceCode: string;
  onCodeChange: (code: string) => void;
  onRestartPreview: () => void;
}) {
  const { sandpack } = useSandpack();
  const activeSourceCode = sandpack.files[USER_SOURCE_FILE]?.code || "";
  const lastObservedSourceRef = React.useRef(sourceCode);
  const pendingProgrammaticSourceRef = React.useRef<string | null>(null);
  const updateFileRef = React.useRef(sandpack.updateFile);

  updateFileRef.current = sandpack.updateFile;

  React.useEffect(() => {
    if (
      sourceCode !== activeSourceCode &&
      sourceCode !== lastObservedSourceRef.current
    ) {
      pendingProgrammaticSourceRef.current = sourceCode;
      updateFileRef.current(USER_SOURCE_FILE, sourceCode, false);
    }
  }, [activeSourceCode, sourceCode]);

  React.useEffect(() => {
    actionRef.current = {
      updateAppCode(source: string) {
        pendingProgrammaticSourceRef.current = source;
        updateFileRef.current(USER_SOURCE_FILE, source, false);
        onCodeChange(source);
      },
      restart() {
        onRestartPreview();
      }
    };

    return () => {
      actionRef.current = null;
    };
  }, [actionRef, onCodeChange, onRestartPreview]);

  React.useEffect(() => {
    const change = classifySourceChange({
      activeSource: activeSourceCode,
      lastObservedSource: lastObservedSourceRef.current,
      pendingProgrammaticSource: pendingProgrammaticSourceRef.current
    });

    if (change === "unchanged" || change === "await-programmatic") {
      return;
    }

    lastObservedSourceRef.current = activeSourceCode;
    if (change === "programmatic-applied") {
      pendingProgrammaticSourceRef.current = null;
      return;
    }

    onCodeChange(activeSourceCode);
  }, [activeSourceCode, onCodeChange]);

  return null;
}

function PreviewStatusBridge({
  clientId,
  revision,
  sourceError,
  onStatusChange
}: {
  clientId: string | null;
  revision: string;
  sourceError: boolean;
  onStatusChange: (revision: string, status: PreviewStatus) => void;
}) {
  const { listen, sandpack } = useSandpack();
  const timeoutRef = React.useRef<number | null>(null);
  const listenRef = React.useRef(listen);
  listenRef.current = listen;

  const clearTimeout = React.useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleTimeout = React.useCallback(() => {
    clearTimeout();
    timeoutRef.current = window.setTimeout(() => {
      onStatusChange(revision, "error");
    }, PREVIEW_TIMEOUT_MS);
  }, [clearTimeout, onStatusChange, revision]);

  React.useEffect(() => {
    if (!clientId) return;

    onStatusChange(revision, sourceError ? "error" : "starting");
    scheduleTimeout();
    const unsubscribe = listenRef.current(message => {
      if (message.type === "start") {
        onStatusChange(revision, sourceError ? "error" : "starting");
        scheduleTimeout();
        return;
      }

      if (
        message.type === "action" &&
        (message.action === "show-error" ||
          (message.action === "notification" &&
            message.notificationType === "error"))
      ) {
        clearTimeout();
        onStatusChange(revision, "error");
        return;
      }

      if (message.type === "done") {
        clearTimeout();
        onStatusChange(
          revision,
          sourceError || message.compilatonError ? "error" : "ready"
        );
      }
    }, clientId);

    return () => {
      clearTimeout();
      unsubscribe();
    };
  }, [
    clearTimeout,
    clientId,
    onStatusChange,
    revision,
    scheduleTimeout,
    sourceError
  ]);

  React.useEffect(() => {
    if (sandpack.status === "timeout" || sandpack.error) {
      clearTimeout();
      onStatusChange(revision, "error");
    }
  }, [clearTimeout, onStatusChange, revision, sandpack.error, sandpack.status]);

  return null;
}

function PreviewWorkspace({
  files,
  setup,
  options,
  revision,
  sourceError,
  onStatusChange
}: {
  files: Record<string, { code: string; hidden?: boolean }>;
  setup: { entry: string; dependencies: Dependencies };
  options: {
    externalResources: string[];
    initMode: "user-visible";
  };
  revision: string;
  sourceError: boolean;
  onStatusChange: (revision: string, status: PreviewStatus) => void;
}) {
  const [clientId, setClientId] = React.useState<string | null>(null);
  const handlePreviewRef = React.useCallback(
    (preview: SandpackPreviewRef | null) => {
      setClientId(preview?.clientId || null);
    },
    []
  );

  return (
    <SandpackProvider
      template="react-ts"
      files={files}
      customSetup={setup}
      options={options}
      theme="light"
    >
      <PreviewStatusBridge
        clientId={clientId}
        revision={revision}
        sourceError={sourceError}
        onStatusChange={onStatusChange}
      />
      <SandpackPreview
        ref={handlePreviewRef}
        showNavigator
        showRefreshButton
        style={{ minHeight: "calc(100vh - 260px)", height: 820 }}
      />
    </SandpackProvider>
  );
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
  const [storedCode, setStoredCode, storageHydrated] = useData("jsx");
  const initialSourceRef = React.useRef(
    typeof storedCode === "string" ? storedCode : SAMPLE_JSX
  );
  const [code, setCode] = React.useState(initialSourceRef.current);
  const [enableTailwindPreview, setEnableTailwindPreview] =
    React.useState(true);
  const [manualDependencies, setManualDependencies] =
    React.useState<Dependencies>({});
  const [packageName, setPackageName] = React.useState("");
  const [packageVersion, setPackageVersion] = React.useState("latest");
  const [previewStatus, setPreviewStatus] =
    React.useState<PreviewStatus>("starting");
  const [previewRestartGeneration, setPreviewRestartGeneration] =
    React.useState(0);
  const sandpackActionsRef = React.useRef<SandpackAppActions | null>(null);
  const persistedCodeRef = React.useRef(code);
  const hasEditedCodeRef = React.useRef(false);
  const activationTrackedRef = React.useRef(false);
  const completionTrackedRef = React.useRef(false);
  const failureTrackedRef = React.useRef(false);
  const editorFilesRef = React.useRef({
    [USER_SOURCE_FILE]: {
      code: initialSourceRef.current,
      active: true
    }
  });

  React.useEffect(() => {
    if (storageHydrated && !hasEditedCodeRef.current) {
      setCode(typeof storedCode === "string" ? storedCode : SAMPLE_JSX);
    }
  }, [storageHydrated, storedCode]);

  const debouncedCode = useDebouncedValue(code, 400);
  const sourcePreparation = React.useMemo(
    () => preparePreviewSource(code),
    [code]
  );
  const previewPreparation = React.useMemo(
    () => preparePreviewSource(debouncedCode),
    [debouncedCode]
  );
  editorFilesRef.current[USER_SOURCE_FILE].code = code;
  const autoDependencies = React.useMemo(
    () => getDetectedDependencies(debouncedCode),
    [debouncedCode]
  );
  const rawEffectiveDependencies = React.useMemo(
    () => ({ ...autoDependencies, ...manualDependencies }),
    [autoDependencies, manualDependencies]
  );
  const effectiveDependencies = useStableDependencies(rawEffectiveDependencies);
  const dependencyKey = React.useMemo(
    () => JSON.stringify(dependencyEntries(effectiveDependencies)),
    [effectiveDependencies]
  );
  const previewKey = React.useMemo(
    () => JSON.stringify([dependencyKey, enableTailwindPreview]),
    [dependencyKey, enableTailwindPreview]
  );
  const previewRevision = React.useMemo(
    () =>
      JSON.stringify([
        previewKey,
        previewRestartGeneration,
        previewPreparation.code,
        previewPreparation.error
      ]),
    [previewKey, previewPreparation, previewRestartGeneration]
  );
  const currentPreviewRevisionRef = React.useRef(previewRevision);
  currentPreviewRevisionRef.current = previewRevision;
  const sandpackSetup = React.useMemo(
    () => ({
      entry: MAIN_FILE,
      dependencies: effectiveDependencies
    }),
    [effectiveDependencies]
  );
  const editorOptions = React.useMemo(
    () => ({
      activeFile: USER_SOURCE_FILE,
      visibleFiles: [USER_SOURCE_FILE],
      initMode: "immediate" as const,
      autorun: false
    }),
    []
  );
  const previewOptions = React.useMemo(
    () => ({
      externalResources: enableTailwindPreview
        ? ["https://cdn.tailwindcss.com"]
        : [],
      initMode: "user-visible" as const
    }),
    [enableTailwindPreview]
  );
  const previewFiles = React.useMemo(
    () => ({
      [APP_FILE]: {
        code: previewPreparation.code,
        hidden: true
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
    }),
    [previewPreparation.code]
  );

  const handleCodeChange = React.useCallback((nextCode: string) => {
    hasEditedCodeRef.current = true;
    if (!activationTrackedRef.current) {
      activationTrackedRef.current = true;
      trackProductEvent("tool_conversion_started");
    }
    setCode(nextCode);
  }, []);
  const handlePreviewStatusChange = React.useCallback(
    (revision: string, status: PreviewStatus) => {
      if (revision !== currentPreviewRevisionRef.current) return;
      setPreviewStatus(status);
      if (!hasEditedCodeRef.current) return;
      if (status === "ready" && !completionTrackedRef.current) {
        completionTrackedRef.current = true;
        trackProductEvent("tool_conversion_completed");
      }
      if (status === "error" && !failureTrackedRef.current) {
        failureTrackedRef.current = true;
        trackProductEvent("tool_conversion_failed");
      }
    },
    []
  );
  const handleRestartPreview = React.useCallback(() => {
    setPreviewRestartGeneration(generation => generation + 1);
  }, []);

  React.useEffect(() => {
    if (sourcePreparation.error) {
      setPreviewStatus("error");
    } else if (code !== debouncedCode) {
      setPreviewStatus("updating");
    }
  }, [code, debouncedCode, sourcePreparation.error]);

  React.useEffect(() => {
    if (code === persistedCodeRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      persistedCodeRef.current = code;
      setStoredCode(code);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [code, setStoredCode]);

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

  const applySnippet = React.useCallback(
    (snippetCode: string) => {
      if (sandpackActionsRef.current) {
        sandpackActionsRef.current.updateAppCode(snippetCode);
        return;
      }

      handleCodeChange(snippetCode);
    },
    [handleCodeChange]
  );

  const formatCode = React.useCallback(async () => {
    try {
      const formatted = await formatJsxCode(code);
      if (sandpackActionsRef.current) {
        sandpackActionsRef.current.updateAppCode(formatted);
      } else {
        handleCodeChange(formatted);
      }
      toast.success("Formatted with Prettier.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to format JSX."
      );
    }
  }, [code, handleCodeChange]);

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
  const previewBusy =
    previewStatus === "starting" || previewStatus === "updating";
  const previewStatusLabel = {
    starting: "Starting preview",
    updating: "Updating preview",
    ready: "Preview ready",
    error: "Preview needs attention"
  }[previewStatus];

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
          <div
            role="status"
            aria-live="polite"
            className={`flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium ${
              previewStatus === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-brand-200 bg-brand-50 text-brand-900"
            }`}
          >
            {previewBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : null}
            {previewStatusLabel}
          </div>
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

      {sourcePreparation.error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <span className="font-semibold">Preview unavailable:</span>{" "}
          {sourcePreparation.error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <SandpackProvider
          template="react-ts"
          files={editorFilesRef.current}
          options={editorOptions}
          theme="light"
        >
          <SandpackBridge
            actionRef={sandpackActionsRef}
            sourceCode={code}
            onCodeChange={handleCodeChange}
            onRestartPreview={handleRestartPreview}
          />
          <SandpackLayout className="min-h-[calc(100vh-260px)]">
            <SandpackCodeEditor
              key={USER_SOURCE_FILE}
              showTabs
              showLineNumbers
              showInlineErrors
              wrapContent
              showRunButton={false}
              style={{ minHeight: "calc(100vh - 260px)", height: 820 }}
            />
            <PreviewWorkspace
              key={previewRevision}
              files={previewFiles}
              setup={sandpackSetup}
              options={previewOptions}
              revision={previewRevision}
              sourceError={Boolean(previewPreparation.error)}
              onStatusChange={handlePreviewStatusChange}
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </section>
  );
}
