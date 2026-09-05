import Link from "next/link";
import { FolderClosed } from "lucide-react";

import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LibraryProjectGroup } from "@/types/library";

interface LibraryProjectCardProps {
  group: LibraryProjectGroup;
}

export function LibraryProjectCard({ group }: LibraryProjectCardProps) {
  const isEmpty = group.count === 0;
  // Zero-document projects have nothing to browse in the library — send the
  // user to the project itself instead of an empty library detail page.
  const href = isEmpty
    ? `/project/${group.projectId}`
    : `/library/project/${group.projectId}`;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card/90 p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        isEmpty && "border-dashed bg-card/40 text-muted-foreground opacity-70",
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <FolderClosed className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{group.projectName}</p>
        <p className="text-xs text-muted-foreground">
          {group.count} {group.count === 1 ? "document" : "documents"} ·{" "}
          {formatBytes(group.totalBytes)}
        </p>
      </div>
    </Link>
  );
}
