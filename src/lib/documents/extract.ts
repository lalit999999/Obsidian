import { ValidationError } from "@/lib/errors";
import { lookupSourceType } from "@/lib/documents/registry";
import { extractDocx } from "@/lib/documents/parsers/docx";
import { extractImage } from "@/lib/documents/parsers/image";
import { extractOdt } from "@/lib/documents/parsers/odt";
import { extractPdf } from "@/lib/documents/parsers/pdf";
import { extractRtf } from "@/lib/documents/parsers/rtf";
import { extractPlainText } from "@/lib/documents/parsers/text";
import type { ExtractionResult } from "@/lib/documents/types";

export async function extractDocument(
  bytes: Uint8Array,
  fileName: string,
  mimeType: string,
): Promise<ExtractionResult> {
  const match = lookupSourceType(fileName, mimeType);
  if (!match) {
    throw new ValidationError(`Unsupported file type: ${fileName}.`);
  }

  switch (match.sourceKind) {
    case "TEXT":
    case "MARKDOWN":
      return extractPlainText(bytes, fileName);
    case "PDF":
      return extractPdf(bytes, fileName);
    case "DOCX":
      return extractDocx(bytes, fileName);
    case "RTF":
      return extractRtf(bytes, fileName);
    case "ODT":
      return extractOdt(bytes, fileName);
    case "IMAGE":
      return extractImage(bytes, fileName, mimeType);
    default: {
      const exhaustive: never = match.sourceKind;
      throw new ValidationError(`Unsupported source kind: ${exhaustive}`);
    }
  }
}
