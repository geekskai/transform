import ConversionPanel, { Transformer } from "@components/ConversionPanel";
import * as React from "react";
import { useCallback } from "react";
import request from "@utils/request";
import { Alert, AlertTitle } from "@/components/ui/alert";

export default function JsonSchemaToOpenapiSchema() {
  const transformer = useCallback(async ({ value }) => {
    const json = await request(
      "/api/json-schema-to-openapi-schema",
      JSON.parse(value)
    );
    return JSON.stringify(json, null, 2);
  }, []);

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="JSON Schema"
      editorLanguage="json"
      editorDefaultValue="jsonSchema"
      resultTitle="Open API Schema"
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
