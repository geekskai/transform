import { Settings } from "@constants/svgoConfig";
import { default as React, useCallback } from "react";
import { EditorPanelProps } from "@components/EditorPanel";
import Form from "@components/Form";
import ConversionPanel, { Transformer } from "@components/ConversionPanel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TriangleAlert } from "lucide-react";
import svgToDataUrl from "svg-to-dataurl";

interface SvgConverterProps {
  name: string;
  babelWorker?: any;
  transformer: Transformer;
  formFields: any;
  resultTitle: string;
  optimizedValue: string;
  settings: any;
  setSettings: (settings: any) => void;
}

export const SvgConverter: React.FunctionComponent<SvgConverterProps> = ({
  transformer,
  resultTitle,
  formFields,
  optimizedValue,
  settings,
  setSettings
}) => {
  const getSettingsPanel = useCallback<EditorPanelProps["settingElement"]>(
    ({ open, toggle }) => {
      return (
        <Form<Partial<Settings>>
          initialValues={settings}
          open={open}
          toggle={toggle}
          title={"SVGO Settings"}
          onSubmit={setSettings}
          formsFields={formFields}
        />
      );
    },
    []
  );

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="SVG"
      resultLanguage="javascript"
      resultTitle={resultTitle}
      editorLanguage="html"
      editorDefaultValue="svg"
      settings={settings}
      editorProps={{
        settingElement: getSettingsPanel,
        topNotifications: ({ toggleSettings }) =>
          settings.optimizeSvg && (
            <Alert className="mb-4 bg-[#E8FDF7] border-[#7AF5D3] rounded-none border-b">
              <TriangleAlert className="h-4 w-4 stroke-[#0A7552]" />
              <AlertTitle className="text-[#0A7552]">
                SVGO optimization is turned on.
              </AlertTitle>
              <AlertDescription className="text-[#0A7552]">
                You can turn it off or configure it in{" "}
                <span
                  className="cursor-pointer font-bold underline"
                  onClick={toggleSettings}
                >
                  settings
                </span>
              </AlertDescription>
            </Alert>
          ),
        previewElement: value => (
          <div className="flex flex-1 flex-row">
            <div className="flex flex-1 relative bg-gradient-to-br from-[#F8FAFA] to-[#E8FDF7] border-r border-[#7AF5D3]">
              <img
                style={{
                  flex: 1,
                  display: "block",
                  width: "100%"
                }}
                src={svgToDataUrl(value)}
                alt="original"
              />

              <Badge className="absolute bottom-3 right-3 bg-teal-600 hover:bg-teal-700 pointer-events-none">
                Original
              </Badge>
            </div>
            <div className="flex flex-1 relative bg-gradient-to-br from-[#F8FAFA] to-[#E8FDF7]">
              {optimizedValue && (
                <img
                  style={{
                    flex: 1,
                    display: "block",
                    width: "100%"
                  }}
                  src={svgToDataUrl(optimizedValue)}
                  alt="optimized"
                />
              )}

              <Badge className="absolute bottom-3 right-3 bg-teal-600 hover:bg-teal-700 pointer-events-none">
                Result
              </Badge>
            </div>
          </div>
        ),
        acceptFiles: "image/svg+xml"
      }}
    />
  );
};
