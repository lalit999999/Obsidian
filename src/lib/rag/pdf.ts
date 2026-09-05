import { extractText, getDocumentProxy } from "unpdf";

export interface ExtractedPdf {
  text: string;
  pageCount: number;
}

export async function extractPdfText(
  buffer: Uint8Array,
): Promise<ExtractedPdf> {
  const pdf = await getDocumentProxy(buffer);
  const { text, totalPages } = await extractText(pdf, { mergePages: true });

  return { text, pageCount: totalPages };
}
