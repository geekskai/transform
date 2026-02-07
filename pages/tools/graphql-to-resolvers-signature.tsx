import * as React from "react";
import { useCallback, useState } from "react";
import ConversionPanel, { Transformer } from "@components/ConversionPanel";
import { getWorker } from "@utils/workerWrapper";
import GrapqlWorker from "@workers/graphql.worker";
import { GraphqlTransforms } from "@constants/graphqlTransforms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

let graphqlWorker: any;

const props = {
  acceptFiles: ".graphql, .gql"
};

const langMap: Record<string, string> = {
  [GraphqlTransforms.TO_FLOW_RESOLVERS_SIGNATURE]: "flow",
  [GraphqlTransforms.TO_TYPESCRIPT_RESOLVERS_SIGNATURE]: "typescript",
  [GraphqlTransforms.TO_JAVA_RESOLVERS_SIGNATURE]: "java"
};

export default function GraphqlToResolversSignature() {
  const [output, setOutput] = useState(
    GraphqlTransforms.TO_TYPESCRIPT_RESOLVERS_SIGNATURE.toString(10)
  );

  const transformer = useCallback<Transformer>(
    async ({ value, splitEditorValue }) => {
      graphqlWorker = graphqlWorker || getWorker(GrapqlWorker);

      return graphqlWorker.send({
        type: parseInt(output, 10),
        value,
        document:
          output ===
          GraphqlTransforms.TO_TYPESCRIPT_RESOLVERS_SIGNATURE.toString(10)
            ? splitEditorValue
            : undefined
      });
    },
    [output]
  );

  return (
    <ConversionPanel
      settings={output}
      transformer={transformer}
      resultTitle={
        <div className="w-[240px]">
          <Select value={output} onValueChange={setOutput}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select transform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value={GraphqlTransforms.TO_TYPESCRIPT_RESOLVERS_SIGNATURE.toString()}
              >
                TypeScript Resolvers Signature
              </SelectItem>
              <SelectItem
                value={GraphqlTransforms.TO_FLOW_RESOLVERS_SIGNATURE.toString()}
              >
                Flow Resolvers Signature
              </SelectItem>
              <SelectItem
                value={GraphqlTransforms.TO_JAVA_RESOLVERS_SIGNATURE.toString()}
              >
                JAVA Resolvers Signature
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      editorTitle="GraphQL Schema"
      editorLanguage="graphql"
      editorDefaultValue="graphql1"
      resultLanguage={langMap[output]}
      editorProps={props}
      splitEditorProps={props}
      splitTitle="Documents"
      splitLanguage="graphql"
      splitEditorDefaultValue={"graphqlDocument"}
    />
  );
}
