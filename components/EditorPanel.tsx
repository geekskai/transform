import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import copy from "clipboard-copy";
import { useDropzone } from "react-dropzone";
import { Settings, Upload, Trash, Copy, FileUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

export interface EditorPanelProps {
  editable?: boolean;
  language?: string;
  defaultValue: string;
  title: React.ReactNode;
  hasCopy?: boolean;
  hasPrettier?: boolean;
  id: string | number;
  onChange?: (value: string) => void;
  hasLoad?: boolean;
  hasClear?: boolean;
  settingElement?: (args: { toggle: () => void; open: boolean }) => JSX.Element;
  alertMessage?: React.ReactNode;
  topNotifications?: (args: {
    toggleSettings: () => void;
    isSettingsOpen: boolean;
  }) => React.ReactNode;
  previewElement?: (value: string) => React.ReactNode;
  acceptFiles?: string | string[];
  packageDetails?: {
    name: string;
    url: string;
  };
}

const Monaco = dynamic(() => import("../components/Monaco"), {
  ssr: false
});

export default function EditorPanel({
  editable = true,
  title,
  settingElement,
  hasLoad,
  acceptFiles,
  hasClear,
  hasCopy = true,
  topNotifications,
  language,
  defaultValue,
  onChange
}: // packageDetails
EditorPanelProps) {
  const [showSettingsDialogue, setSettingsDialog] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [fetchingUrl, setFetchingUrl] = useState("");

  const options = {
    fontSize: 14,
    readOnly: !editable,
    codeLens: false,
    fontFamily: "Menlo, Consolas, monospace, sans-serif",
    minimap: {
      enabled: false
    },
    quickSuggestions: false,
    lineNumbers: "on",
    renderValidationDecorations: "off"
  };

  const _toggleSettingsDialog = useCallback(
    () => setSettingsDialog(!showSettingsDialogue),
    [showSettingsDialogue]
  );

  useEffect(() => {
    // @ts-ignore
    window.__webpack_public_path__ = "/_next/";
  }, []);

  const getSettings = useCallback(
    () => (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 h-7"
          onClick={_toggleSettingsDialog}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>

        {settingElement &&
          settingElement({
            toggle: _toggleSettingsDialog,
            open: showSettingsDialogue
          })}
      </>
    ),
    [showSettingsDialogue, _toggleSettingsDialog, settingElement]
  );

  const onFilePicked = useCallback(
    (files: File[], close = () => {}) => {
      if (!(files && files.length)) return;
      const file = files[0];
      const reader = new FileReader();
      reader.readAsText(file, "utf-8");
      reader.onload = () => {
        setValue(reader.result as string);
        if (onChange) onChange(reader.result as string);
        close();
      };
    },
    [onChange]
  );

  const { getRootProps } = useDropzone({
    onDrop: files => onFilePicked(files),
    disabled: !editable,
    accept: acceptFiles as any, // React-dropzone types might vary
    onDropRejected: () => toast.error("This file type is not supported.")
  });

  const copyValue = useCallback(() => {
    copy(value);
    toast.success("Copied to clipboard.");
  }, [value]);

  const fetchFile = useCallback(
    (close: () => void) => {
      (async () => {
        if (!fetchingUrl) return;
        try {
          const res = await fetch(fetchingUrl);
          const value = await res.text();
          setValue(value);
          setFetchingUrl("");
          close();
          if (onChange) onChange(value);
        } catch (error) {
          toast.error("Failed to fetch URL");
        }
      })();
    },
    [fetchingUrl, onChange]
  );

  // whenever defaultValue changes, change the value of the editor.
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="editor-panel-toolbar flex h-11 flex-shrink-0 items-center border-b px-3 z-[2]">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 m-0">{title}</h3>
        </div>

        {settingElement && getSettings()}

        {hasLoad && (
          <Popover>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 mr-2"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Load File</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <PopoverContent className="w-80 p-5">
              {/* Popover content needs to pass `close` manually or use internal state. 
                   Shadcn Popover doesn't expose `close` to children easily without composition.
                   For now, we can omit `close` passing in JSX props if not strictly needed or re-implement logic.
                   Actually, Radix Popover primitive doesn't pass close. We can use a controlled popover if needed.
                   For simplicity here, we'll try to keep it simple.
                   Wait, `onFilePicked` calls `close`.
                */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-white to-[#E8FDF7] p-5">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Input
                    type="file"
                    onChange={e => {
                      if (e.target.files)
                        onFilePicked(Array.from(e.target.files));
                    }}
                    accept={
                      Array.isArray(acceptFiles)
                        ? acceptFiles.join(",")
                        : acceptFiles
                    }
                  />
                </div>

                <h4 className="py-2 text-sm font-medium">OR</h4>

                <div className="flex w-full flex-row">
                  <Input
                    className="rounded-none rounded-l-md"
                    placeholder="Enter URL"
                    onChange={e => setFetchingUrl(e.target.value)}
                  />
                  <Button
                    className="rounded-none rounded-r-md"
                    onClick={() => fetchFile(() => {})} // No-op close for now as uncontrolled
                  >
                    Fetch URL
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {hasClear && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 mr-2 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    setValue("");
                    if (onChange) onChange("");
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {hasCopy && (
          <Button
            variant="default"
            size="sm"
            className="h-7 mr-2"
            onClick={copyValue}
          >
            <Copy className="mr-2 h-3.5 w-3.5" />
            Copy
          </Button>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden" {...getRootProps()}>
        {topNotifications &&
          topNotifications({
            isSettingsOpen: showSettingsDialogue,
            toggleSettings: _toggleSettingsDialog
          })}

        <Monaco
          language={language}
          value={value}
          options={options as any}
          onChange={value => {
            setValue(value);
            if (onChange) onChange(value);
          }}
        />
      </div>
    </div>
  );
}
