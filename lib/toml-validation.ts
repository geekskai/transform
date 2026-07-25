import { parse } from "@iarna/toml";

type LocatedTomlError = Error & {
  line?: number;
  col?: number;
};

function summarizeParserMessage(message: string): string {
  return (
    message
      .split(/\s+at row \d+, col \d+, pos \d+:/)[0]
      .replace(/^\[ParserError\]\s*/, "")
      .trim() || "Invalid TOML syntax."
  );
}

function formatTomlError(source: string, error: unknown): string {
  if (!(error instanceof Error)) {
    return "✕ Invalid TOML syntax\n\nInvalid TOML syntax.";
  }

  const locatedError = error as LocatedTomlError;
  const summary = summarizeParserMessage(error.message);

  if (
    typeof locatedError.line !== "number" ||
    typeof locatedError.col !== "number"
  ) {
    return `✕ Invalid TOML syntax\n\n${summary}`;
  }

  const sourceLine = source.split(/\r?\n/)[locatedError.line] || "";
  const caretPrefix = sourceLine
    .slice(0, locatedError.col)
    .replace(/[^\t]/g, " ");
  const caretOverflow = " ".repeat(
    Math.max(0, locatedError.col - sourceLine.length)
  );
  const caret = `${caretPrefix}${caretOverflow}^`;

  return [
    "✕ Invalid TOML syntax",
    "",
    `Line ${locatedError.line + 1}, column ${locatedError.col + 1}`,
    summary,
    "",
    sourceLine,
    caret
  ].join("\n");
}

export function validateTomlSource(source: string): string {
  if (!source.trim()) return "";

  try {
    parse(source);
    return "✓ Valid TOML syntax";
  } catch (error) {
    return formatTomlError(source, error);
  }
}
