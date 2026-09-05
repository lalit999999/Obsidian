import type { PreviewKindValue, SourceKindValue } from "@/types/rag";

export interface ExtractionResult {
  text: string;
  previewMarkdown: string | null;
  pages: string[] | null;
  pageCount: number | null;
  truncated: boolean;
}

export interface SourceTypeDefinition {
  sourceKind: SourceKindValue;
  previewKind: PreviewKindValue;
  label: string;
  extensions: string[];
  mimeTypes: string[];
  maxBytes: number;
}

export interface RegistryMatch {
  sourceKind: SourceKindValue;
  previewKind: PreviewKindValue;
  label: string;
  maxBytes: number;
}
