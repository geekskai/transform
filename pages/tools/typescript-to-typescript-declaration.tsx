import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { useCallback } from "react";
import request from "@utils/request";
import { Alert, AlertTitle } from "@/components/ui/alert";

export default function TypescriptToTypescriptDeclaration() {
  const transformer = useCallback(
    ({ value }) =>
      request("/api/flow-to-typescript", {
        value,
        declarationOnly: true,
        isTS: true
      }),
    []
  );

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="TypeScript"
      editorLanguage="typescript"
      resultTitle="TypeScript"
      resultLanguage="typescript"
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
