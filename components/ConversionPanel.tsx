import { Pane, Alert, Spinner } from "evergreen-ui";
import EditorPanel, { EditorPanelProps } from "@components/EditorPanel";
import * as React from "react";
import { useEffect, useState } from "react";
import { Language, useData } from "@hooks/useData";
import { useRouter } from "next/router";
import { activeRouteData } from "@utils/routes";
import PrettierWorker from "@workers/prettier.worker";
import { getWorker } from "@utils/workerWrapper";

let prettierWorker;

function getEditorLanguage(lang: Language) {
  const mapping = {
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
  const [showUpdateSpinner, toggleUpdateSpinner] = useState(false);

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
    async function transform() {
      try {
        toggleUpdateSpinner(true);
        prettierWorker = prettierWorker || getWorker(PrettierWorker);

        const result = await transformer({
          value,
          splitEditorValue: splitTitle ? splitValue : undefined
        });

        let prettyResult = await prettierWorker.send({
          value: result,
          language: resultLanguage
        });

        // Fix for #319
        if (prettyResult.startsWith(";<")) {
          prettyResult = prettyResult.slice(1);
        }
        setResult(prettyResult);
        setMessage("");
      } catch (e) {
        console.error(e);
        setMessage(e.message);
      }
      toggleUpdateSpinner(false);
    }

    transform();
  }, [splitValue, value, splitTitle, settings]);

  return (
    <>
      <Pane
        display="flex"
        flexDirection="row"
        overflow="hidden"
        flex={1}
        minHeight={0}
      >
        <Pane
          display="flex"
          flex={1}
          borderRight
          flexDirection="column"
          overflow="hidden"
        >
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

          {splitTitle && (
            <Pane display="flex" flex={1} borderTop>
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
            </Pane>
          )}
        </Pane>
        <Pane display="flex" flex={1} position="relative">
          {showUpdateSpinner && (
            <Pane
              display="inline-flex"
              position="absolute"
              background="linear-gradient(to bottom right, #FFFFFF, #E8FDF7)"
              zIndex={9}
              borderRadius={16}
              paddingX={10}
              paddingY={10}
              elevation={2}
              top={50}
              right={30}
              border="1px solid #7AF5D3"
            >
              <Spinner
                css={{
                  "& circle": {
                    stroke: "#16F2B3"
                  }
                }}
                size={32}
              />
            </Pane>
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
        </Pane>
      </Pane>

      {message && (
        <Alert
          paddingY={16}
          paddingX={24}
          left={20}
          right={20}
          position="absolute"
          intent="danger"
          bottom={16}
          title={message}
          backgroundColor="#FEE2E2"
          borderRadius={12}
          zIndex={3}
        />
      )}
    </>
  );
};

export default React.memo(ConversionPanel);
