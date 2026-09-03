import type { SupportedRagFileExtension } from "@/types/rag";

const SUPPORTED_EXTENSIONS = new Set<SupportedRagFileExtension>(["txt", "md"]);

export function getSupportedRagFileExtension(
  fileName?: string,
): SupportedRagFileExtension | null {
  if (!fileName) {
    return null;
  }

  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension) {
    return null;
  }

  return SUPPORTED_EXTENSIONS.has(extension as SupportedRagFileExtension)
    ? (extension as SupportedRagFileExtension)
    : null;
}

export function parseDocumentContent(
  content: string,
  fileName?: string,
): string {
  if (typeof content !== "string") {
    throw new Error("Document content must be a string.");
  }

  if (fileName) {
    const extension = getSupportedRagFileExtension(fileName);
    if (extension === null) {
      throw new Error(
        `Unsupported file type for RAG ingestion: ${fileName}. Supported types are .txt and .md.`,
      );
    }
  }

  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Document content is empty and cannot be ingested.");
  }

  const normalized = trimmed
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, "    ")
    .replace(/[ \f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!normalized) {
    throw new Error("Document content is empty after normalization.");
  }

  return normalized;
}
