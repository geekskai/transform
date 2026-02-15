import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { useCallback } from "react";
import { parse } from "@iarna/toml";

const SAMPLE_TOML = `[database]
server = "192.168.1.1"
ports = [8000, 8001, 8002]
enabled = true
`;

export default function CheckToml() {
  const transformer = useCallback(async ({ value }) => {
    if (!value || !value.trim()) return "";

    try {
      parse(value);
      return "✓ Valid TOML syntax";
    } catch (error) {
      return `✕ Invalid TOML\\n\\n${error instanceof Error ? error.message : "Invalid TOML syntax."}`;
    }
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Check TOML files instantly. Everything runs{" "}
          <strong>locally in your browser</strong> for privacy.
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1">
            Auto-validate on paste or typing
          </span>
        </div>
      </div>

      <ConversionPanel
        transformer={transformer}
        editorTitle="TOML"
        editorLanguage="toml"
        editorDefaultValue={SAMPLE_TOML}
        resultTitle="Validation Result"
        resultLanguage="text"
        editorProps={{
          acceptFiles: ".toml"
        }}
      />
    </section>
  );
}
