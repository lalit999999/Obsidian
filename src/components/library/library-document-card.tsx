import Link from "next/link";

import { formatBytes } from "@/lib/format";
import { sourceTypeForKind } from "@/lib/sources/registry";
import type { LibraryDocument } from "@/types/library";
import { DocumentStatusBadge } from "@/components/project/document-status-badge";

interface LibraryDocumentCardProps {
  document: LibraryDocument;
  onOpen: () => void;
}

export function LibraryDocumentCard({
  document,
  onOpen,
}: LibraryDocumentCardProps) {
  const sourceType = sourceTypeForKind(document.sourceKind);
  const Icon = sourceType.icon;

  return (
    <div className="group relative flex flex-col gap-3 rounded-lg border bg-card/90 p-4 transition-colors hover:bg-muted/50">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open preview for ${document.fileName}`}
        className="absolute inset-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      />

      <div className="relative z-10 flex items-start gap-3">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-md ${sourceType.accentClassName}`}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" title={document.fileName}>
            {document.fileName}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
            <span>{formatBytes(document.fileSize)}</span>
            <span>·</span>
            <span>{new Date(document.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between gap-2">
        <DocumentStatusBadge status={document.status} />
        <Link
          href={`/project/${document.projectId}`}
          onClick={(event) => event.stopPropagation()}
          className="relative z-10 truncate text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {document.projectName}
        </Link>
      </div>
    </div>
  );
}
