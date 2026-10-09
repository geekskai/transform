import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { useCallback, useRef, useState } from "react";
import { EditorPanelProps } from "@components/EditorPanel";
import Form, { InputType } from "@components/Form";

interface Settings {
  generateContractCode: boolean;
}

export default function CadenceToGo() {
  const generatorRef =
    useRef<(source: string, ignoreContractGeneration: boolean) => string>();
  const [settings, setSettings] = useState<Settings>({
    generateContractCode: false
  });
  const transformer = useCallback(
    async ({ value }) => {
      if (!generatorRef.current) {
        const { newEasiGen } = await import("@lemonneko/easi-gen");
        generatorRef.current = await newEasiGen();
      }
      const generated = generatorRef.current(
        value,
        !settings.generateContractCode
      );
      return generated;
    },
    [settings]
  );

  const outputSettingsElement = useCallback<EditorPanelProps["settingElement"]>(
    ({ open, toggle }) => {
      return (
        <Form<Partial<Settings>>
          initialValues={settings}
          open={open}
          toggle={toggle}
          title={"Output Settings"}
          onSubmit={setSettings as any}
          formsFields={[
            {
              key: "generateContractCode",
              type: InputType.SWITCH,
              label: "Generate Interaction Code With Functions"
            }
          ]}
        />
      );
    },
    [settings]
  );

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="Cadence types"
      editorLanguage="text"
      editorDefaultValue="cadence"
      resultTitle="Go types"
      resultLanguage={"go"}
      settings={settings}
      resultSettingsElement={outputSettingsElement}
      deferTransformUntilUserInput
    />
  );
}
