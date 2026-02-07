import * as React from "react";
import { useCallback, useEffect, useState } from "react";
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

let graphqlWorker: ReturnType<typeof getWorker> | undefined;

const props = {
  acceptFiles: ".graphql, .gql"
};

export default function GraphqlToComponents() {
  const [output, setOutput] = useState(
    GraphqlTransforms.TO_REACT_APOLLO.toString()
  );

  useEffect(() => {
    graphqlWorker = graphqlWorker || getWorker(GrapqlWorker);
  }, []);

  const transformer = useCallback<Transformer>(
    async ({ value, splitEditorValue }) => {
      if (!graphqlWorker) graphqlWorker = getWorker(GrapqlWorker);
      return graphqlWorker.send({
        type: parseInt(output, 10),
        value,
        document: splitEditorValue ?? ""
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
              <SelectItem value={GraphqlTransforms.TO_REACT_APOLLO.toString()}>
                TypeScript React Apollo
              </SelectItem>
              <SelectItem
                value={GraphqlTransforms.TO_APOLLO_ANGULAR.toString()}
              >
                TypeScript Apollo Angular
              </SelectItem>
              <SelectItem
                value={GraphqlTransforms.TO_STENCIL_APOLLO.toString()}
              >
                TypeScript Stencil Apollo
              </SelectItem>
              <SelectItem value={GraphqlTransforms.TO_URQL.toString()}>
                TypeScript urql
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      editorTitle="GraphQL Schema"
      editorLanguage="graphql"
      editorDefaultValue="graphql1"
      resultLanguage="typescript"
      editorProps={props}
      splitEditorProps={props}
      splitTitle="Document"
      splitLanguage="graphql"
      splitEditorDefaultValue={"graphqlDocument"}
    />
  );
}
