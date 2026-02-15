import prettier from "prettier/standalone";
import { prettierParsers, supportedLanguages } from "@utils/prettier";

const plugins = [
  require("prettier/plugins/babel"),
  require("prettier/plugins/estree"),
  require("prettier/plugins/html"),
  require("prettier/plugins/postcss"),
  require("prettier/plugins/markdown"),
  require("prettier/plugins/yaml"),
  require("prettier/plugins/graphql"),
  require("prettier/plugins/typescript"),
  require("prettier/plugins/flow")
];

export async function prettify(language: string, value: string) {
  let result;

  if (!supportedLanguages.includes(language)) return value;

  if (language === "json") {
    result = JSON.stringify(JSON.parse(value), null, 2);
  } else {
    result = prettier.format(value, {
      parser: prettierParsers[language] || language,
      plugins,
      semi: false
    });
  }

  return result;
}
