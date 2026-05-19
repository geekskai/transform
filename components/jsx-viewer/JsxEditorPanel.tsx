import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import copy from "clipboard-copy";
import { useDropzone } from "react-dropzone";
import prettier from "prettier/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";
import * as monacoEditor from "monaco-editor";
import {
  AlignLeft,
  Braces,
  Copy,
  FileUp,
  Minus,
  Plus,
  RotateCcw,
  Trash,
  Upload,
  WrapText
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { JSX_SNIPPETS, SAMPLE_JSX } from "@/lib/jsx-viewer/preview";

const Monaco = dynamic(() => import("@components/Monaco"), { ssr: false });

const MARKER_OWNER = "jsx-viewer";

export interface EditorDiagnostic {
  message: string;
  line?: number;
  column?: number;
}

export interface JsxEditorPanelProps {
  value: string;
  onChange: (value: string) => void;
  diagnostic?: EditorDiagnostic | null;
}

function buildMonacoOptions(args: {
  fontSize: number;
  wordWrap: boolean;
}): monacoEditor.editor.IStandaloneEditorConstructionOptions {
  return {
    fontSize: args.fontSize,
    tabSize: 2,
    insertSpaces: true,
    readOnly: false,
    codeLens: false,
    fontFamily: "Menlo, Consolas, monospace, sans-serif",
    minimap: { enabled: false },
    lineNumbers: "on",
    glyphMargin: true,
    folding: true,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: args.wordWrap ? "on" : "off",
    wrappingIndent: "indent",
    formatOnPaste: true,
    bracketPairColorization: { enabled: true },
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    autoIndent: "full",
    quickSuggestions: {
      other: true,
      comments: false,
      strings: true
    },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: "on",
    renderLineHighlight: "line",
    renderValidationDecorations: "on",
    scrollbar: {
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10
    },
    padding: { top: 12, bottom: 12 }
  };
}

async function formatJsxCode(source: string) {
  return prettier.format(source, {
    parser: "babel",
    plugins: [prettierPluginBabel, prettierPluginEstree],
    semi: false,
    singleQuote: false,
    printWidth: 80
  });
}

export default function JsxEditorPanel({
  value,
  onChange,
  diagnostic
}: JsxEditorPanelProps) {
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(true);
  const [fetchingUrl, setFetchingUrl] = useState("");
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
    null
  );
  const monacoRef = useRef<typeof monacoEditor | null>(null);

  const applyDiagnosticMarkers = useCallback(
    (nextDiagnostic?: EditorDiagnostic | null) => {
      const editor = editorRef.current;
      const monaco = monacoRef.current;
      if (!editor || !monaco) return;

      const model = editor.getModel();
      if (!model) return;

      if (!nextDiagnostic?.message) {
        monaco.editor.setModelMarkers(model, MARKER_OWNER, []);
        return;
      }

      const line = nextDiagnostic.line || 1;
      const column = nextDiagnostic.column || 1;
      const lineContent = model.getLineContent(line);
      const endColumn = Math.max(column + 1, lineContent.length + 1);

      monaco.editor.setModelMarkers(model, MARKER_OWNER, [
        {
          severity: monaco.MarkerSeverity.Error,
          message: nextDiagnostic.message,
          startLineNumber: line,
          startColumn: column,
          endLineNumber: line,
          endColumn
        }
      ]);
    },
    []
  );

  useEffect(() => {
    applyDiagnosticMarkers(diagnostic);
  }, [applyDiagnosticMarkers, diagnostic]);

  useEffect(() => {
    editorRef.current?.updateOptions(
      buildMonacoOptions({ fontSize, wordWrap })
    );
  }, [fontSize, wordWrap]);

  const handleFormat = useCallback(async () => {
    if (!value.trim()) return;

    try {
      const formatted = await formatJsxCode(value);
      onChange(formatted);
      toast.success("Formatted with Prettier.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to format code."
      );
    }
  }, [onChange, value]);

  const handleMount = useCallback(
    (
      editor: monacoEditor.editor.IStandaloneCodeEditor,
      monaco: typeof monacoEditor
    ) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      editor.addAction({
        id: "jsx-viewer-format",
        label: "Format Document",
        keybindings: [
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF
        ],
        run: () => {
          void handleFormat();
        }
      });

      applyDiagnosticMarkers(diagnostic);
    },
    [applyDiagnosticMarkers, diagnostic, handleFormat]
  );

  const onFilePicked = useCallback(
    (files: File[]) => {
      if (!files.length) return;
      const file = files[0];
      const reader = new FileReader();
      reader.readAsText(file, "utf-8");
      reader.onload = () => {
        onChange(reader.result as string);
        toast.success(`Loaded ${file.name}`);
      };
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: onFilePicked,
    noClick: true,
    noKeyboard: true,
    accept: [".jsx", ".tsx", ".js", ".ts"],
    onDropRejected: () =>
      toast.error("Only .jsx, .tsx, .js, .ts files are supported.")
  });

  const fetchFile = useCallback(async () => {
    if (!fetchingUrl.trim()) return;

    try {
      const res = await fetch(fetchingUrl);
      const text = await res.text();
      onChange(text);
      setFetchingUrl("");
      toast.success("Loaded from URL.");
    } catch {
      toast.error("Failed to fetch URL.");
    }
  }, [fetchingUrl, onChange]);

  const lineCount = value ? value.split("\n").length : 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="editor-panel-toolbar flex min-h-11 flex-shrink-0 flex-wrap items-center gap-1 border-b px-2 py-1.5">
        <h3 className="mr-2 text-sm font-semibold text-gray-900">
          JSX / TSX Editor
        </h3>

        <TooltipProvider delayDuration={300}>
          <Select
            onValueChange={snippetId => {
              const snippet = JSX_SNIPPETS.find(item => item.id === snippetId);
              if (snippet) onChange(snippet.code);
            }}
          >
            <SelectTrigger
              className="h-7 w-[130px] text-xs"
              title="Insert starter templates"
            >
              <SelectValue placeholder="Snippets" />
            </SelectTrigger>
            <SelectContent>
              {JSX_SNIPPETS.map(snippet => (
                <SelectItem key={snippet.id} value={snippet.id}>
                  <span className="font-medium">{snippet.label}</span>
                  <span className="ml-2 text-muted-foreground">
                    {snippet.description}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => void handleFormat()}
              >
                <Braces className="mr-1 h-3.5 w-3.5" />
                Format
              </Button>
            </TooltipTrigger>
            <TooltipContent>Prettier (⌘⇧F)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onChange(SAMPLE_JSX)}
              >
                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                Sample
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset to starter example</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={wordWrap ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setWordWrap(current => !current)}
              >
                <WrapText className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle word wrap</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setFontSize(size => Math.min(size + 1, 22))}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Increase font size</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setFontSize(size => Math.max(size - 1, 11))}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Decrease font size</TooltipContent>
          </Tooltip>

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Upload className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Load file or URL</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => open()}
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Choose local file
                </Button>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/component.jsx"
                    value={fetchingUrl}
                    onChange={e => setFetchingUrl(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") void fetchFile();
                    }}
                  />
                  <Button size="sm" onClick={() => void fetchFile()}>
                    Fetch
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onChange("")}
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear editor</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  copy(value);
                  toast.success("Copied to clipboard.");
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy code</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
          <AlignLeft className="h-3 w-3" />
          <span>{lineCount} lines</span>
          <span aria-hidden>·</span>
          <span>{fontSize}px</span>
        </div>
      </div>

      <div
        className={`relative flex flex-1 flex-col overflow-hidden ${
          isDragActive ? "ring-2 ring-inset ring-purple-400" : ""
        }`}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {isDragActive && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-purple-50/80 text-sm font-medium text-purple-700">
            Drop .jsx / .tsx file to load
          </div>
        )}

        <Monaco
          language="javascript"
          theme="vs"
          value={value}
          onChange={nextValue => onChange(nextValue || "")}
          onMount={handleMount}
          options={buildMonacoOptions({ fontSize, wordWrap })}
        />
      </div>

      {diagnostic?.message && (
        <div className="border-t border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {diagnostic.line
            ? `Line ${diagnostic.line}: ${diagnostic.message}`
            : diagnostic.message}
        </div>
      )}
    </div>
  );
}
