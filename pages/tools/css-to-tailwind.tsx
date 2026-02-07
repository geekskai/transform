import React, { useCallback, useMemo, useState } from "react";
import { promises as fs } from "fs";
import path from "path";
import dynamic from "next/dynamic";

import { TailwindConverter, TailwindConverterConfig } from "css-to-tailwindcss";

import ConversionPanel, { Transformer } from "@components/ConversionPanel";
import { useSettings } from "@hooks/useSettings";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { CircleHelp } from "lucide-react";

const Monaco = dynamic(() => import("../../components/Monaco"), {
  ssr: false
});

interface RawSettings {
  tailwindConfig?: string;
  remInPx?: string | null;
  arbitraryPropertiesIsEnabled?: boolean;
}

const evalConfig = (configValue: string) =>
  eval(`const module = {}; ${configValue}; module.exports;`);

const DEFAULT_POSTCSS_PLUGINS = [require("postcss-nested")];

function decorateResult(result: string) {
  return `/*
  Based on TailwindCSS recommendations,
  consider using classes instead of the \`@apply\` directive
  @see https://tailwindcss.com/docs/reusing-styles#avoiding-premature-abstraction
*/
${result}`;
}

function CssToTailwindSettings({
  open,
  toggle,
  onConfirm,
  settings
}: {
  open: boolean;
  toggle: () => void;
  onConfirm: (props: {
    tailwindConfig: string;
    remInPx: string;
    arbitraryPropertiesIsEnabled: boolean;
  }) => boolean | Promise<boolean>;
  settings: RawSettings;
}) {
  const [tailwindConfig, setTailwindConfig] = useState(settings.tailwindConfig);
  const [remInPx, setRemInPx] = useState(settings.remInPx);
  const [
    arbitraryPropertiesIsEnabled,
    setArbitraryPropertiesIsEnabled
  ] = useState(settings.arbitraryPropertiesIsEnabled || false);

  const handleConfirm = async () => {
    const isSuccess = await onConfirm({
      tailwindConfig: tailwindConfig || "",
      remInPx: remInPx || "",
      arbitraryPropertiesIsEnabled
    });
    if (isSuccess) {
      toggle();
    }
  };

  const handleCancel = () => {
    setTailwindConfig(settings.tailwindConfig);
    setRemInPx(settings.remInPx);
    toggle();
  };

  return (
    <Dialog open={open} onOpenChange={toggle}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Converter Configuration</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium leading-none">
              Root font size in pixels
            </h4>
            <p className="text-sm text-muted-foreground">
              Used to convert rem CSS values to their px equivalents
            </p>
            <Input
              placeholder="Enter URL"
              onChange={e => setRemInPx(e.target.value)}
              value={remInPx || ""}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium leading-none">
                Enable arbitrary properties
              </h4>
              <a
                href="https://tailwindcss.com/docs/adding-custom-styles#arbitrary-properties"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <CircleHelp className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open the TailwindCSS docs...</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </a>
            </div>
            <Switch
              checked={arbitraryPropertiesIsEnabled}
              onCheckedChange={setArbitraryPropertiesIsEnabled}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium leading-none">
                Tailwind configuration
              </h4>
              <a
                href="https://tailwindcss.com/docs/configuration"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <CircleHelp className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open the TailwindCSS docs...</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </a>
            </div>
            <div className="h-[300px] border rounded-md overflow-hidden">
              <Monaco
                language="javascript"
                value={tailwindConfig}
                onChange={setTailwindConfig}
                options={{
                  fontSize: 14,
                  readOnly: false,
                  codeLens: false,
                  fontFamily: "Menlo, Consolas, monospace, sans-serif",
                  minimap: {
                    enabled: false
                  },
                  quickSuggestions: false,
                  lineNumbers: "on",
                  renderValidationDecorations: "off"
                }}
                height="300px"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CssToTailwind3({ defaultSettings }: { defaultSettings: RawSettings }) {
  const [rawSettings, setRawSettings] = useSettings(
    "css-to-tailwind",
    defaultSettings
  ) as [RawSettings, React.Dispatch<React.SetStateAction<RawSettings>>];

  const converterConfig = useMemo(() => {
    const config: Partial<TailwindConverterConfig> = {
      remInPx: rawSettings.remInPx ? parseInt(rawSettings.remInPx, 10) : null,
      arbitraryPropertiesIsEnabled: !!rawSettings.arbitraryPropertiesIsEnabled
    };

    if (isNaN(config["remInPx"] as number)) {
      toast.error(
        "Invalid `REM in PIXELS` value (only `number` or `null` allowed). Fallback to `null` value"
      );

      config["remInPx"] = null;
    }

    try {
      config["tailwindConfig"] = evalConfig(rawSettings.tailwindConfig || "");
    } catch (e) {
      toast.error(
        "Something went wrong trying to resolve TailwindCSS config. Fallback to default tailwind config",
        {
          description: e.message
        }
      );
    }

    return config;
  }, [rawSettings]);

  const tailwindConverter = useMemo(() => {
    try {
      return new TailwindConverter({
        postCSSPlugins: DEFAULT_POSTCSS_PLUGINS,
        ...converterConfig
      });
    } catch (e) {
      toast.error(
        "Unable to create TailwindConverter. Invalid configuration passed",
        {
          description: e.message
        }
      );

      return new TailwindConverter({ postCSSPlugins: DEFAULT_POSTCSS_PLUGINS });
    }
  }, [converterConfig]);

  const transformer = useCallback<Transformer>(
    async ({ value }) => {
      try {
        return decorateResult(
          (await tailwindConverter.convertCSS(value)).convertedRoot.toString()
        );
      } catch (e) {
        toast.error("Unable to convert CSS", {
          description: e.message
        });

        return "Unable to convert CSS";
      }
    },
    [tailwindConverter]
  );

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="CSS"
      editorLanguage="css"
      editorDefaultValue="css3"
      resultTitle="TailwindCSS 3.x"
      resultLanguage="css"
      settings={rawSettings}
      editorProps={{
        settingElement: ({ open, toggle }) => {
          return (
            <CssToTailwindSettings
              key={`${rawSettings.tailwindConfig}${rawSettings.remInPx}`}
              open={open}
              toggle={toggle}
              onConfirm={async rawSettings => {
                setRawSettings(rawSettings);

                return true;
              }}
              settings={rawSettings}
            />
          );
        }
      }}
    />
  );
}

export default CssToTailwind3;

const DEFAULT_TAILWIND_CONFIG = `module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;

export async function getStaticProps() {
  const stubPaths = [
    path.join(process.cwd(), "node_modules/tailwindcss/stubs/config.simple.js"),
    path.join(
      process.cwd(),
      "node_modules/css-to-tailwindcss/node_modules/tailwindcss/stubs/simpleConfig.stub.js"
    )
  ];
  let rawTailwindConfig = DEFAULT_TAILWIND_CONFIG;
  for (const stubPath of stubPaths) {
    try {
      rawTailwindConfig = await fs.readFile(stubPath, "utf-8");
      break;
    } catch {
      // try next path
    }
  }

  return {
    props: {
      defaultSettings: {
        tailwindConfig: rawTailwindConfig,
        remInPx: "16",
        arbitraryPropertiesIsEnabled: false
      } as RawSettings
    }
  };
}
