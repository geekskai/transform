import EditorPanel, { EditorPanelProps } from "@components/EditorPanel";
import * as React from "react";
import { useEffect, useState } from "react";
import { Language, useData } from "@hooks/useData";
import { useRouter } from "next/router";
import { activeRouteData } from "@utils/routes";
import { getWorker } from "@utils/workerWrapper";
import PrettierWorker from "@workers/prettier.worker";
import { Loader2, TriangleAlert } from "lucide-react";

let prettierWorker: ReturnType<typeof getWorker> | undefined;

function getEditorLanguage(lang: Language) {
  const mapping: Record<string, string> = {
    flow: "typescript"
  };

  return mapping[lang] || lang;
}

export type Transformer = (args: {
  value: string;
  splitEditorValue?: string;
}) => Promise<string>;

export interface ConversionPanelProps {
  splitTitle?: string;
  splitLanguage?: Language;
  editorTitle: string;
  editorLanguage: Language;
  editorDefaultValue?: string;
  resultTitle: React.ReactNode;
  resultLanguage: Language;
  splitEditorProps?: Partial<EditorPanelProps>;
  splitEditorDefaultValue?: string;
  editorProps?: Partial<EditorPanelProps>;
  resultEditorProps?: Partial<EditorPanelProps>;
  transformer: Transformer;
  defaultSplitValue?: string;
  editorSettingsElement?: EditorPanelProps["settingElement"];
  resultSettingsElement?: EditorPanelProps["settingElement"];
  settings?: any;
}

const ConversionPanel: React.FunctionComponent<ConversionPanelProps> = function({
  splitEditorProps,
  editorProps,
  resultEditorProps,
  transformer,
  splitLanguage,
  splitTitle,
  editorLanguage,
  editorTitle,
  resultLanguage,
  resultTitle,
  editorSettingsElement,
  settings,
  editorDefaultValue,
  splitEditorDefaultValue,
  resultSettingsElement
}) {
  const [value, setValue] = useData(editorDefaultValue || editorLanguage);
  const [splitValue, setSplitValue] = useData(
    splitEditorDefaultValue || splitLanguage
  );
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [showUpdateSpinner, setShowUpdateSpinner] = useState(false);

  const router = useRouter();
  const route = activeRouteData(router.pathname);

  let packageDetails;

  if (route) {
    const { packageUrl, packageName } = route;

    packageDetails =
      packageName && packageUrl
        ? {
            name: packageName,
            url: packageUrl
          }
        : undefined;
  }

  useEffect(() => {
    let cancelled = false;
    const TIMEOUT_MS = 25_000;

    async function runTransform() {
      setShowUpdateSpinner(true);
      setMessage("");
      try {
        prettierWorker = prettierWorker || getWorker(PrettierWorker);

        const rawResult = await Promise.race([
          transformer({
            value,
            splitEditorValue: splitTitle ? splitValue : undefined
          }),
          new Promise<never>((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    "Conversion timed out. Try a smaller input or check the browser console."
                  )
                ),
              TIMEOUT_MS
            )
          )
        ]);

        if (cancelled) return;

        const prettyResultRaw = await Promise.race([
          prettierWorker.send({
            value:
              typeof rawResult === "string"
                ? rawResult
                : String(rawResult ?? ""),
            language: resultLanguage
          }),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Formatting timed out.")),
              TIMEOUT_MS
            )
          )
        ]);

        if (cancelled) return;

        let prettyResult =
          typeof prettyResultRaw === "string"
            ? prettyResultRaw
            : String(prettyResultRaw ?? "");
        if (prettyResult.startsWith(";<")) {
          prettyResult = prettyResult.slice(1);
        }
        setResult(prettyResult);
        setMessage("");
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setMessage(e?.message ?? String(e));
        }
      } finally {
        if (!cancelled) setShowUpdateSpinner(false);
      }
    }

    runTransform();
    return () => {
      cancelled = true;
    };
  }, [splitValue, value, splitTitle, settings]);

  return (
    <>
      <div className="flex flex-1 flex-row overflow-hidden min-h-[600px]">
        <div className="flex flex-1 flex-col overflow-hidden border-r">
          <EditorPanel
            language={getEditorLanguage(editorLanguage)}
            onChange={setValue}
            hasLoad
            defaultValue={value}
            id={1}
            hasCopy={false}
            title={editorTitle}
            settingElement={editorSettingsElement}
            hasClear
            {...editorProps}
          />

          {splitTitle && splitLanguage && (
            <div className="flex flex-1 border-t">
              <EditorPanel
                title={splitTitle}
                defaultValue={splitValue}
                language={getEditorLanguage(splitLanguage)}
                id={2}
                hasCopy={false}
                onChange={setSplitValue}
                hasLoad
                hasClear
                {...splitEditorProps}
              />
            </div>
          )}
        </div>
        <div className="relative flex flex-1">
          {showUpdateSpinner && (
            <div className="absolute top-[50px] right-[30px] z-[9] inline-flex rounded-2xl border border-[#7AF5D3] bg-gradient-to-br from-[#FFFFFF] to-[#E8FDF7] p-2.5 shadow-md">
              <Loader2 className="h-8 w-8 animate-spin text-[#16F2B3]" />
            </div>
          )}
          <EditorPanel
            title={resultTitle}
            defaultValue={result}
            language={getEditorLanguage(resultLanguage)}
            id={3}
            editable={false}
            hasPrettier={false}
            settingElement={resultSettingsElement}
            packageDetails={packageDetails}
            {...resultEditorProps}
          />
        </div>
      </div>

      {message && (
        <div className="absolute max-w-7xl mx-auto -bottom-[178px] left-5 right-5 z-[3] rounded-xl bg-red-100 px-6 py-4 text-red-900 flex items-center gap-2">
          <TriangleAlert className="h-5 w-5 text-red-900" />
          <span className="font-medium">{message}</span>
        </div>
      )}
    </>
  );
};

export default React.memo(ConversionPanel);
