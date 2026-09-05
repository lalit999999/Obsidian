import { env } from "@/lib/env";
import type { RegistryMatch, SourceTypeDefinition } from "@/lib/documents/types";

const DOCUMENT_BASE_MAX_BYTES = 20 * 1024 * 1024;
const IMAGE_BASE_MAX_BYTES = 10 * 1024 * 1024;

// The single source of truth mapping a file extension/MIME type to how it is
// stored (sourceKind), how it is previewed (previewKind), and its size cap.
// Adding a new format means: add a parser, add an entry here, done.
const SOURCE_TYPES: SourceTypeDefinition[] = [
  {
    sourceKind: "TEXT",
    previewKind: "PLAIN",
    label: "Plain text",
    extensions: ["txt"],
    mimeTypes: ["text/plain"],
    maxBytes: DOCUMENT_BASE_MAX_BYTES,
  },
  {
    sourceKind: "MARKDOWN",
    previewKind: "MARKDOWN",
    label: "Markdown",
    extensions: ["md", "markdown"],
    mimeTypes: ["text/markdown"],
    maxBytes: DOCUMENT_BASE_MAX_BYTES,
  },
  {
    sourceKind: "PDF",
    previewKind: "PDF",
    label: "PDF",
    extensions: ["pdf"],
    mimeTypes: ["application/pdf"],
    maxBytes: DOCUMENT_BASE_MAX_BYTES,
  },
  {
    sourceKind: "DOCX",
    previewKind: "MARKDOWN",
    label: "Word document",
    extensions: ["docx"],
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxBytes: DOCUMENT_BASE_MAX_BYTES,
  },
  {
    sourceKind: "RTF",
    previewKind: "PLAIN",
    label: "Rich text",
    extensions: ["rtf"],
    mimeTypes: ["application/rtf", "text/rtf"],
    maxBytes: DOCUMENT_BASE_MAX_BYTES,
  },
  {
    sourceKind: "ODT",
    previewKind: "PLAIN",
    label: "OpenDocument text",
    extensions: ["odt"],
    mimeTypes: ["application/vnd.oasis.opendocument.text"],
    maxBytes: DOCUMENT_BASE_MAX_BYTES,
  },
  {
    sourceKind: "IMAGE",
    previewKind: "IMAGE",
    label: "Image",
    extensions: ["png", "jpg", "jpeg", "webp"],
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    maxBytes: IMAGE_BASE_MAX_BYTES,
  },
];

const LEGACY_DOC_EXTENSIONS = new Set(["doc"]);

export function extensionOf(fileName: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(fileName);
  return match ? match[1].toLowerCase() : "";
}

export function isLegacyDocFile(fileName: string): boolean {
  return LEGACY_DOC_EXTENSIONS.has(extensionOf(fileName));
}

export function lookupSourceType(
  fileName: string,
  mimeType: string,
): RegistryMatch | null {
  const extension = extensionOf(fileName);
  const normalizedMime = (mimeType || "").split(";")[0].trim().toLowerCase();

  const definition =
    SOURCE_TYPES.find((def) => def.extensions.includes(extension)) ??
    SOURCE_TYPES.find((def) => def.mimeTypes.includes(normalizedMime));

  if (!definition) {
    return null;
  }

  return {
    sourceKind: definition.sourceKind,
    previewKind: definition.previewKind,
    label: definition.label,
    maxBytes: Math.min(definition.maxBytes, env.MAX_UPLOAD_BYTES),
  };
}

export function supportedFormatsList(): string[] {
  return SOURCE_TYPES.flatMap((def) => def.extensions.map((ext) => `.${ext}`));
}

export function acceptAttribute(): string {
  return supportedFormatsList().join(",");
}
