import Link from "next/link";

import { formatBytes } from "@/lib/format";
import { sourceTypeForKind } from "@/lib/sources/registry";
import { cn } from "@/lib/utils";
import type { LibraryTypeGroup } from "@/types/library";

interface LibraryTypeCardProps {
  group: LibraryTypeGroup;
}

export function LibraryTypeCard({ group }: LibraryTypeCardProps) {
  const sourceType = sourceTypeForKind(group.sourceKind);
  const Icon = sourceType.icon;
  const isEmpty = group.count === 0;

  const content = (
    <>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md",
          sourceType.accentClassName,
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{sourceType.label}</p>
        <p className="text-xs text-muted-foreground">
          {group.count} {group.count === 1 ? "document" : "documents"} ·{" "}
          {formatBytes(group.totalBytes)}
        </p>
      </div>
    </>
  );

  if (isEmpty) {
    return (
      <div
        aria-disabled="true"
        className="flex items-center gap-3 rounded-lg border border-dashed bg-card/40 p-4 text-muted-foreground opacity-60"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/library/type/${group.sourceKind}`}
      className="flex items-center gap-3 rounded-lg border bg-card/90 p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {content}
    </Link>
  );
}
