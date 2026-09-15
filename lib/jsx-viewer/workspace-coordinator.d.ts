export type PreviewStatus = "starting" | "updating" | "ready" | "error";

export type SourceChangeKind =
  | "unchanged"
  | "user-edit"
  | "await-programmatic"
  | "programmatic-applied";

export function classifySourceChange(args: {
  activeSource: string;
  lastObservedSource: string;
  pendingProgrammaticSource: string | null;
}): SourceChangeKind;
