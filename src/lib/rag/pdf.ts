import { extractText, getDocumentProxy } from "unpdf";

// Keeps a single huge PDF (or a pathological plain-text file) from producing
// an unbounded extractedText column and an unbounded chunk count.
export const RAG_MAX_EXTRACTED_TEXT_LENGTH = 500_000;

export interface ExtractedPdfText {
  text: string;
  pageCount: number;
  truncated: boolean;
}

export async function extractPdfText(
  buffer: ArrayBuffer | Uint8Array,
): Promise<ExtractedPdfText> {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const pdf = await getDocumentProxy(bytes);
  const { totalPages, text } = await extractText(pdf, { mergePages: true });

  const truncated = text.length > RAG_MAX_EXTRACTED_TEXT_LENGTH;

  return {
    text: truncated ? text.slice(0, RAG_MAX_EXTRACTED_TEXT_LENGTH) : text,
    pageCount: totalPages,
    truncated,
  };
}
