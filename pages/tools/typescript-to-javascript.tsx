import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { useCallback } from "react";
import request from "@utils/request";
import { Alert, AlertTitle } from "@/components/ui/alert";

export default function TypescriptToJavascript() {
  const transformer = useCallback(
    ({ value }) =>
      request("/api/typescript-to-javascript", value, "plain/text"),
    []
  );

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="TypeScript"
      editorLanguage="typescript"
      editorDefaultValue="typescript"
      resultTitle="JavaScript"
      resultLanguage={"javascript"}
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
