"use client";

import { Layers, X } from "lucide-react";

import type { Document } from "@/types";

interface ChatScopeBarProps {
  documents: Document[];
  selectedDocumentIds: string[];
  onClear: () => void;
  onOpenSource?: (documentId: string) => void;
}

const MAX_VISIBLE_CHIPS = 3;

export function ChatScopeBar({
  documents,
  selectedDocumentIds,
  onClear,
  onOpenSource,
}: ChatScopeBarProps) {
  if (selectedDocumentIds.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl items-center gap-1.5 px-4 pb-1.5 text-xs text-muted-foreground">
        <Layers className="size-3.5" />
        <span>All sources</span>
      </div>
    );
  }

  const scopedDocuments = selectedDocumentIds
    .map((id) => documents.find((document) => document.id === id))
    .filter((document): document is Document => Boolean(document));

  const visible = scopedDocuments.slice(0, MAX_VISIBLE_CHIPS);
  const remaining = scopedDocuments.length - visible.length;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-1.5 px-4 pb-1.5 text-xs">
      <span className="shrink-0 text-muted-foreground">Scoped to</span>
      {visible.map((document) => (
        <button
          key={document.id}
          type="button"
          onClick={() => onOpenSource?.(document.id)}
          className="inline-flex max-w-40 items-center gap-1 truncate rounded-full border bg-muted/40 px-2 py-0.5 font-medium transition-colors hover:bg-muted"
        >
          <span className="truncate">{document.fileName}</span>
        </button>
      ))}
      {remaining > 0 ? (
        <span className="text-muted-foreground">+{remaining} more</span>
      ) : null}
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear source scope"
        className="ml-auto inline-flex shrink-0 items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-3.5" />
        Clear
      </button>
    </div>
  );
}
