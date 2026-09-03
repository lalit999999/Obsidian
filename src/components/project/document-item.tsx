import {
  CircleAlert,
  File,
  FileCode2,
  FileText,
  LoaderCircle,
  MoreVertical,
  Pencil,
  Trash2,
  Clock3,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Document, DocumentStatus } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentItemProps extends Document {
  onDelete?: (documentId: string) => void;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

function getStatusConfig(status: DocumentStatus) {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending",
        className: "bg-secondary text-secondary-foreground",
        icon: Clock3,
      };
    case "PROCESSING":
      return {
        label: "Processing",
        className: "bg-primary/10 text-primary",
        icon: LoaderCircle,
      };
    case "READY":
      return {
        label: "Ready",
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        icon: FileText,
      };
    case "FAILED":
      return {
        label: "Failed",
        className: "bg-destructive/10 text-destructive",
        icon: CircleAlert,
      };
  }
}

function getFileIcon(fileName: string) {
  if (fileName.endsWith(".md")) {
    return FileCode2;
  }

  if (fileName.endsWith(".txt")) {
    return FileText;
  }

  return File;
}

export function DocumentItem({
  id,
  fileName,
  fileSize,
  status,
  createdAt,
  error,
  onDelete,
}: DocumentItemProps) {
  const statusConfig = getStatusConfig(status);
  const FileIcon = getFileIcon(fileName);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border bg-background px-3 py-3">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FileIcon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium">{fileName}</p>
            <Badge className={cn("rounded-full", statusConfig.className)}>
              <StatusIcon
                className={cn(
                  "mr-1 size-3.5",
                  status === "PROCESSING" ? "animate-spin" : undefined,
                )}
              />
              {statusConfig.label}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{formatBytes(fileSize)}</span>
            <span>Created {new Date(createdAt).toLocaleDateString()}</span>
          </div>
          {error ? (
            <p className="mt-2 text-xs text-destructive">{error}</p>
          ) : null}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Pencil className="mr-2 size-4" />
            View details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete?.(id)}
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
// Create a reusable document list item.
//
// Props:
// - id.
// - fileName.
// - fileSize.
// - status.
// - createdAt.
// - optional error.
//
// Requirements:
// - Display an icon based on file type.
// - Display the document name.
// - Display readable file size.
// - Display status using shadcn Badge.
//
// Status UI:
// - PENDING: neutral.
// - PROCESSING: loading indicator.
// - READY: success-style indicator.
// - FAILED: destructive/error-style indicator.
//
// Include a DropdownMenu with frontend-only actions:
// - View details.
// - Delete.
//
// Keep this component reusable and fully typed.
