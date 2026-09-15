export interface PreviewSourcePreparation {
  code: string;
  error: string | null;
}

export function preparePreviewSource(source: string): PreviewSourcePreparation;
