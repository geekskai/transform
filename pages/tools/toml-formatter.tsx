import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { useCallback } from "react";
import prettier from "prettier/standalone";
import prettierPluginToml from "prettier-plugin-toml";

const SAMPLE_TOML = `# Sample TOML (Prettier keeps comments)
[server]
port=8080
host="localhost"

[database]
enabled=true
pool_size=5
timeout=30
`;

export default function TomlFormatter() {
  const transformer = useCallback(async ({ value }) => {
    if (!value || !value.trim()) return "";

    try {
      return await prettier.format(value, {
        parser: "toml",
        plugins: [prettierPluginToml],
        tabWidth: 2,
        printWidth: 80
      });
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Unable to format TOML."
      );
    }
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Format TOML configs instantly with <strong>Prettier</strong>. Everything
          runs <strong>locally in your browser</strong> for privacy.
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1">
            Auto-format on paste or typing
          </span>
        </div>
      </div>

      <ConversionPanel
        transformer={transformer}
        editorTitle="TOML"
        editorLanguage="toml"
        editorDefaultValue={SAMPLE_TOML}
        resultTitle="Formatted TOML"
        resultLanguage="toml"
        editorProps={{
          acceptFiles: ".toml"
        }}
      />
    </section>
  );
}
