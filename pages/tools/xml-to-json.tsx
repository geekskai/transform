import ConversionPanel from "@components/ConversionPanel";
import { convertXmlToCompactJson } from "@/lib/xml-tools";
import { useCallback } from "react";
import * as React from "react";

export default function XmlToJson() {
  const transformer = useCallback(async ({ value }) => {
    return convertXmlToCompactJson(value);
  }, []);

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="XML"
      editorLanguage="xml"
      resultTitle="JSON"
      resultLanguage={"json"}
      responsiveStack
      editorProps={{
        acceptFiles: ".xml,text/xml,application/xml"
      }}
    />
  );
}
