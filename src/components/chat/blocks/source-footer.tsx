"use client";

import { Badge } from "@/components/ui/badge";
import type { ChatMessageSource } from "@/types/chat";

interface SourceFooterProps {
  sources: ChatMessageSource[];
  onOpenSource?: (documentId: string, chunkIndex?: number) => void;
}

export function SourceFooter({ sources, onOpenSource }: SourceFooterProps) {
  if (sources.length === 0) {
    return null;
  }

  const grouped = new Map<string, { fileName: string; count: number }>();
  for (const source of sources) {
    const existing = grouped.get(source.documentId);
    if (existing) {
      existing.count += 1;
    } else {
      grouped.set(source.documentId, {
        fileName: source.fileName,
        count: 1,
      });
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {Array.from(grouped.entries()).map(([documentId, { fileName, count }]) => (
        <Badge
          key={documentId}
          asChild
          variant="secondary"
          className="cursor-pointer rounded-full text-xs hover:bg-secondary/80"
        >
          <button type="button" onClick={() => onOpenSource?.(documentId)}>
            <span className="max-w-40 truncate">{fileName}</span>
            <span className="text-muted-foreground">
              · {count} {count === 1 ? "chunk" : "chunks"}
            </span>
          </button>
        </Badge>
      ))}
    </div>
  );
}
