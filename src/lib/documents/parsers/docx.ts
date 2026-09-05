import mammoth from "mammoth";

import { ValidationError } from "@/lib/errors";
import {
  MAX_EXTRACTED_TEXT_CHARS,
  normalizeExtractedText,
  truncateAtWhitespaceBoundary,
} from "@/lib/documents/normalize";
import type { ExtractionResult } from "@/lib/documents/types";

interface MammothMarkdownResult {
  value: string;
  messages: Array<{ type: string; message: string }>;
}

// mammoth@1.12.2 ships a working `convertToMarkdown` at runtime, but its
// shipped .d.ts (node_modules/mammoth/lib/index.d.ts) does not declare it —
// only convertToHtml/extractRawText/embedStyleMap/images are typed. We
// feature-detect it so a future installed version without it (the documented
// possibility) falls back cleanly instead of a hard type error.
interface MammothWithMarkdown {
  convertToMarkdown?: (
    input: { buffer: Buffer },
    options?: { convertImage?: unknown },
  ) => Promise<MammothMarkdownResult>;
}

export async function extractDocx(
  bytes: Uint8Array,
  fileName: string,
): Promise<ExtractionResult> {
  const buffer = Buffer.from(bytes);

  const rawTextResult = await mammoth
    .extractRawText({ buffer })
    .catch(() => {
      throw new ValidationError(`Could not read ${fileName} as a .docx file.`);
    });

  if (rawTextResult.messages.length > 0) {
    console.warn(`[mammoth] extractRawText ${fileName}:`, rawTextResult.messages);
  }

  const normalized = normalizeExtractedText(rawTextResult.value);
  if (!normalized) {
    throw new ValidationError(
      `No readable text could be extracted from ${fileName}.`,
    );
  }

  let previewMarkdown: string | null = null;
  const convertToMarkdown = (mammoth as unknown as MammothWithMarkdown)
    .convertToMarkdown;

  if (typeof convertToMarkdown === "function") {
    try {
      const markdownResult = await convertToMarkdown(
        { buffer },
        {
          // Drop images entirely rather than inlining base64 data URIs into
          // the stored markdown preview.
          convertImage: mammoth.images.imgElement(() =>
            Promise.resolve({ src: "" }),
          ),
        },
      );

      if (markdownResult.messages.length > 0) {
        console.warn(
          `[mammoth] convertToMarkdown ${fileName}:`,
          markdownResult.messages,
        );
      }

      previewMarkdown = markdownResult.value.trim() || null;
    } catch (error) {
      console.warn(
        `[mammoth] convertToMarkdown failed for ${fileName}, falling back to raw text:`,
        error,
      );
    }
  } else {
    // Documented fallback path: convertToMarkdown is not part of the
    // installed version's typed API. Use convertToHtml only to surface
    // conversion messages; previewMarkdown stays null and previewKind
    // (fixed to MARKDOWN by the registry for .docx) renders the raw text.
    const htmlResult = await mammoth.convertToHtml({ buffer }).catch(() => null);
    if (htmlResult && htmlResult.messages.length > 0) {
      console.warn(`[mammoth] convertToHtml ${fileName}:`, htmlResult.messages);
    }
  }

  const { text, truncated } = truncateAtWhitespaceBoundary(
    normalized,
    MAX_EXTRACTED_TEXT_CHARS,
  );

  return {
    text,
    previewMarkdown,
    pages: null,
    pageCount: null,
    truncated,
  };
}
