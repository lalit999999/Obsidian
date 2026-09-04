import {
  File,
  FileCode2,
  FileImage,
  FileText,
  FileType,
  Image,
  NotebookPen,
  type LucideIcon,
} from "lucide-react";

import type { SourceKind } from "@/types";

export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export interface SourceTypeUi {
  kind: SourceKind;
  label: string;
  extensions: string[];
  mimeTypes: string[];
  maxBytes: number;
  icon: LucideIcon;
  accentClassName: string;
}

export const SOURCE_TYPES: SourceTypeUi[] = [
  {
    kind: "TEXT",
    label: "Text",
    extensions: [".txt"],
    mimeTypes: ["text/plain"],
    maxBytes: MAX_DOCUMENT_BYTES,
    icon: FileText,
    accentClassName: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
  {
    kind: "MARKDOWN",
    label: "Markdown",
    extensions: [".md", ".markdown"],
    mimeTypes: ["text/markdown"],
    maxBytes: MAX_DOCUMENT_BYTES,
    icon: FileCode2,
    accentClassName: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    kind: "PDF",
    label: "PDF",
    extensions: [".pdf"],
    mimeTypes: ["application/pdf"],
    maxBytes: MAX_DOCUMENT_BYTES,
    icon: FileType,
    accentClassName: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  {
    kind: "DOCX",
    label: "Word",
    extensions: [".docx"],
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxBytes: MAX_DOCUMENT_BYTES,
    icon: File,
    accentClassName: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  {
    kind: "RTF",
    label: "Rich Text",
    extensions: [".rtf"],
    mimeTypes: ["application/rtf", "text/rtf"],
    maxBytes: MAX_DOCUMENT_BYTES,
    icon: NotebookPen,
    accentClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    kind: "ODT",
    label: "OpenDocument",
    extensions: [".odt"],
    mimeTypes: ["application/vnd.oasis.opendocument.text"],
    maxBytes: MAX_DOCUMENT_BYTES,
    icon: FileImage,
    accentClassName: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  },
  {
    kind: "IMAGE",
    label: "Image",
    extensions: [".png", ".jpg", ".jpeg", ".webp"],
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    maxBytes: MAX_IMAGE_BYTES,
    icon: Image,
    accentClassName: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
];

// Legacy binary Word files are explicitly unsupported (see AGENTS.md contract
// C2) — surfaced separately from SOURCE_TYPES so the dialog can give a
// pointed error instead of a generic "unsupported file type" message.
export const LEGACY_DOC_EXTENSION = ".doc";
export const LEGACY_DOC_ERROR_MESSAGE =
  "Legacy .doc files are not supported. Save the file as .docx and upload again.";

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex === -1 ? "" : fileName.slice(dotIndex).toLowerCase();
}

export function matchSourceType(
  fileName: string,
  mimeType: string,
): SourceTypeUi | null {
  const extension = getExtension(fileName);

  const byExtension = SOURCE_TYPES.find((type) =>
    type.extensions.includes(extension),
  );
  if (byExtension) {
    return byExtension;
  }

  if (mimeType) {
    const byMimeType = SOURCE_TYPES.find((type) =>
      type.mimeTypes.includes(mimeType),
    );
    if (byMimeType) {
      return byMimeType;
    }
  }

  return null;
}

export function sourceTypeForKind(kind: SourceKind): SourceTypeUi {
  const sourceType = SOURCE_TYPES.find((type) => type.kind === kind);
  if (!sourceType) {
    throw new Error(`Unknown source kind: ${kind}`);
  }
  return sourceType;
}

export const FILE_ACCEPT_ATTRIBUTE = Array.from(
  new Set(SOURCE_TYPES.flatMap((type) => type.extensions)),
).join(",");
