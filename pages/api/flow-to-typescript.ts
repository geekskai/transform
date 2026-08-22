import type { NextApiRequest, NextApiResponse } from "next";
import { convert } from "@khanacademy/flow-to-ts";
import * as ts from "typescript";
import { validatePostTextInput } from "../../lib/api-input";
import { hasTypescriptSyntaxErrors } from "../../lib/ts-syntax";

export default (req: NextApiRequest, res: NextApiResponse) => {
  const { value, declarationOnly, isTS } = req.body || {};
  const input = validatePostTextInput(req.method, value, "Source code");

  if (input.ok === false) {
    if (input.status === 405) res.setHeader("Allow", "POST");
    res.status(input.status).send(input.message);
    return;
  }

  if (isTS && hasTypescriptSyntaxErrors(input.value)) {
    res.status(400).send("Could not convert the supplied source code");
    return;
  }

  try {
    const tsCode = isTS ? input.value : convert(input.value);

    if (!declarationOnly) {
      res.status(200).send(tsCode);
      return;
    }

    let output = "";

    const options = {
      allowJs: true,
      declaration: true,
      emitDeclarationOnly: true,
      jsx: ts.JsxEmit.React,
      skipDefaultLibCheck: true,
      skipLibCheck: true
    };

    const host = ts.createCompilerHost(options);

    host.getSourceFile = filename => {
      if (filename === "file.ts") {
        return ts.createSourceFile(filename, tsCode, undefined);
      }

      return ts.createSourceFile(filename, "", undefined);
    };

    host.writeFile = (_name, text) => {
      output = text;
    };

    const program = ts.createProgram(["file.ts"], options, host);
    program.emit();

    res.status(200).send(output);
  } catch {
    res.status(400).send("Could not convert the supplied source code");
  }
};
