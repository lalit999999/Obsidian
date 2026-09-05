// Single implementation of extracted-text normalisation, shared by every
// parser in src/lib/documents/parsers/** and re-exported (unchanged) from
// src/lib/rag/parser.ts for the ingestion pipeline.

export const MAX_EXTRACTED_TEXT_CHARS = 2_000_000;

export function normalizeExtractedText(content: string): string {
  if (typeof content !== "string") {
    throw new Error("Document content must be a string.");
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, "    ")
    .replace(/[ \f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Caps text at `maxChars`, cutting at the nearest preceding whitespace
 * boundary (when one exists reasonably close to the limit) instead of
 * mid-word/mid-multibyte-sequence.
 */
export function truncateAtWhitespaceBoundary(
  text: string,
  maxChars: number = MAX_EXTRACTED_TEXT_CHARS,
): { text: string; truncated: boolean } {
  if (text.length <= maxChars) {
    return { text, truncated: false };
  }

  const slice = text.slice(0, maxChars);
  const lastBreak = Math.max(slice.lastIndexOf("\n"), slice.lastIndexOf(" "));
  const cut = lastBreak > maxChars * 0.9 ? lastBreak : maxChars;

  return { text: slice.slice(0, cut).trimEnd(), truncated: true };
}
