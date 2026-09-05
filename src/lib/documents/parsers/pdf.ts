import { extractText as unpdfExtractText, getDocumentProxy } from "unpdf";

import { ValidationError } from "@/lib/errors";
import {
  MAX_EXTRACTED_TEXT_CHARS,
  normalizeExtractedText,
  truncateAtWhitespaceBoundary,
} from "@/lib/documents/normalize";
import type { ExtractionResult } from "@/lib/documents/types";

export async function extractPdf(
  bytes: Uint8Array,
  fileName: string,
): Promise<ExtractionResult> {
  const pdf = await getDocumentProxy(bytes).catch(() => {
    throw new ValidationError(`Could not read ${fileName} as a PDF file.`);
  });

  const { text } = await unpdfExtractText(pdf, { mergePages: false });
  const pageTexts = Array.isArray(text) ? text : [text];
  const normalizedPages = pageTexts.map((page) => normalizeExtractedText(page));
  const combined = normalizedPages.filter(Boolean).join("\n\n").trim();

  if (pageTexts.length > 1 && combined.length < 40) {
    throw new ValidationError(
      "This PDF appears to be a scanned image with no embedded text. Upload the pages as images to run OCR instead.",
    );
  }

  if (!combined) {
    throw new ValidationError(
      `No readable text could be extracted from ${fileName}.`,
    );
  }

  const { text: truncatedText, truncated } = truncateAtWhitespaceBoundary(
    combined,
    MAX_EXTRACTED_TEXT_CHARS,
  );

  return {
    text: truncatedText,
    previewMarkdown: null,
    pages: normalizedPages,
    pageCount: normalizedPages.length,
    truncated,
  };
}
