import { ValidationError } from "@/lib/errors";
import {
  MAX_EXTRACTED_TEXT_CHARS,
  normalizeExtractedText,
  truncateAtWhitespaceBoundary,
} from "@/lib/documents/normalize";
import type { ExtractionResult } from "@/lib/documents/types";

export function extractPlainText(
  bytes: Uint8Array,
  fileName: string,
): ExtractionResult {
  let decoded: string;
  try {
    decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    throw new ValidationError(`Could not decode ${fileName} as UTF-8 text.`);
  }

  const normalized = normalizeExtractedText(decoded);
  if (!normalized) {
    throw new ValidationError(
      `No readable text could be extracted from ${fileName}.`,
    );
  }

  const { text, truncated } = truncateAtWhitespaceBoundary(
    normalized,
    MAX_EXTRACTED_TEXT_CHARS,
  );

  return {
    text,
    previewMarkdown: null,
    pages: null,
    pageCount: null,
    truncated,
  };
}
