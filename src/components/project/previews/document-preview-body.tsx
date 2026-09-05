import type { Document } from "@/types";
import { MarkdownPreview } from "./markdown-preview";
import { PlainPreview } from "./plain-preview";
import { PdfPreview } from "./pdf-preview";
import { ImagePreview } from "./image-preview";

interface DocumentPreviewBodyProps {
  document: Document;
  content: string | null;
  previewMarkdown: string | null;
  truncated: boolean;
}

export function DocumentPreviewBody({
  document,
  content,
  previewMarkdown,
  truncated,
}: DocumentPreviewBodyProps) {
  switch (document.previewKind) {
    case "MARKDOWN": {
      const markdownContent = previewMarkdown ?? content;
      if (!markdownContent) {
        return <NoPreviewAvailable />;
      }
      return (
        <MarkdownPreview content={markdownContent} truncated={truncated} />
      );
    }
    case "PLAIN": {
      if (!content) {
        return <NoPreviewAvailable />;
      }
      return <PlainPreview content={content} truncated={truncated} />;
    }
    case "PDF":
      return (
        <PdfPreview documentId={document.id} fileName={document.fileName} />
      );
    case "IMAGE":
      return (
        <ImagePreview documentId={document.id} fileName={document.fileName} />
      );
    default:
      return <NoPreviewAvailable />;
  }
}

function NoPreviewAvailable() {
  return (
    <p className="text-sm text-muted-foreground">
      Preview not available for this file type.
    </p>
  );
}
