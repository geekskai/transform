import * as React from "react";
import Editor, { EditorProps } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import * as monacoEditor from "monaco-editor";

export function processSize(size) {
  return !/^\d+$/.test(size) ? size : `${size}px`;
}

interface MonacoProps extends EditorProps {
  theme?: string;
  language?: string;
  value?: string;
  width?: number | string;
  height?: number | string;
  options?: any;
  defaultValue?: string;
  onChange?: (
    value: string | undefined,
    ev: monacoEditor.editor.IModelContentChangedEvent
  ) => void;
  onMount?: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => void;
}

export const Monaco: React.FC<MonacoProps> = ({
  language,
  value,
  defaultValue,
  height,
  width,
  options,
  onChange,
  onMount,
  ...props
}) => {
  return (
    <div className="h-full relative flex-1">
      <Editor
        defaultLanguage={language}
        defaultValue={defaultValue}
        value={value}
        height={height}
        width={width}
        options={options}
        onChange={onChange}
        onMount={onMount}
        loading={
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
        {...props}
      />
    </div>
  );
};

export default Monaco;
