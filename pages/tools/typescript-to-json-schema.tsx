import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { useCallback } from "react";
import request from "@utils/request";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function TypescriptToJsonSchema() {
  const transformer = useCallback(async ({ value }) => {
    const x = await request(
      "/api/typescript-to-json-schema",
      value,
      "text/plain"
    );
    return JSON.stringify(x, null, 2);
  }, []);

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="TypeScript"
      editorLanguage="typescript"
      editorDefaultValue="typeScriptInterface"
      resultTitle="JSON Schema"
      resultLanguage={"json"}
      resultEditorProps={{
        topNotifications: () => (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertTitle>This code is converted on the server.</AlertTitle>
          </Alert>
        )
      }}
    />
  );
}
