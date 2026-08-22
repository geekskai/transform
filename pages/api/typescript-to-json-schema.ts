import type { NextApiRequest, NextApiResponse } from "next";
import type { Config } from "ts-json-schema-generator/dist/src/Config";
import * as tsj from "ts-json-schema-generator";
import os from "os";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { validatePostTextInput } from "../../lib/api-input";
import { hasTypescriptSyntaxErrors } from "../../lib/ts-syntax";

const tmpDir = os.tmpdir?.();

export default (req: NextApiRequest, res: NextApiResponse) => {
  const input = validatePostTextInput(
    req.method,
    req.body,
    "TypeScript source"
  );

  if (input.ok === false) {
    if (input.status === 405) res.setHeader("Allow", "POST");
    res.status(input.status).send(input.message);
    return;
  }

  if (hasTypescriptSyntaxErrors(input.value)) {
    res
      .status(400)
      .send("Could not generate a schema from the supplied source");
    return;
  }

  const filePath =
    path.join(tmpDir, crypto.randomBytes(16).toString("hex")) + ".ts";
  let sourceWritten = false;

  try {
    fs.writeFileSync(filePath, input.value, {
      encoding: "utf-8"
    });
    sourceWritten = true;

    const config: Config = {
      path: filePath,
      expose: "all",
      jsDoc: "extended",
      skipTypeCheck: true,
      type: "*"
    };

    const schema = tsj.createGenerator(config).createSchema(config.type);
    res.status(200).send(JSON.stringify(schema, null, 2));
  } catch {
    res
      .status(sourceWritten ? 400 : 500)
      .send(
        sourceWritten
          ? "Could not generate a schema from the supplied source"
          : "Could not process the supplied source"
      );
  } finally {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // The serverless filesystem is temporary; conversion already completed.
      }
    }
  }
};
