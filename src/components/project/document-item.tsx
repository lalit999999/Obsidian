"use client";

import { useState } from "react";
import { Download, Eye, MoreVertical, RotateCcw, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatBytes } from "@/lib/format";
import { sourceTypeForKind } from "@/lib/sources/registry";
import type { Document } from "@/types";
import { DocumentStatusBadge } from "./document-status-badge";

interface DocumentItemProps extends Document {
  selected?: boolean;
  onToggleSelect?: (documentId: string) => void;
  onDelete?: (documentId: string) => Promise<void> | void;
  onPreview?: (documentId: string) => void;
}

export function DocumentItem({
  id,
  fileName,
  fileSize,
  status,
  createdAt,
  error,
  sourceKind,
  pageCount,
  selected = false,
  onToggleSelect,
  onDelete,
  onPreview,
}: DocumentItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteIntent, setDeleteIntent] = useState<"delete" | "retry">(
    "delete",
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const sourceType = sourceTypeForKind(sourceKind);
  const FileIcon = sourceType.icon;
  const isReady = status === "READY";
  const isRetry = deleteIntent === "retry";

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete?.(id);
      setDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const checkbox = (
    <Checkbox
      checked={selected}
      disabled={!isReady}
      aria-label={
        isReady
          ? selected
            ? `Deselect ${fileName}`
            : `Select ${fileName}`
          : `${fileName} isn't ready to select yet`
      }
      onCheckedChange={() => onToggleSelect?.(id)}
      onClick={(event) => event.stopPropagation()}
    />
  );

  return (
    <div className="group relative flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted/50">
      <button
        type="button"
        onClick={() => onPreview?.(id)}
        aria-label={`Open preview for ${fileName}`}
        className="absolute inset-0 rounded-md transition-transform active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:active:scale-100"
      />

      <div className="relative z-10 shrink-0">
        {isReady ? (
          checkbox
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">{checkbox}</span>
              </TooltipTrigger>
              <TooltipContent side="top">
                Only ready sources can be selected for chat scope.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-md ${sourceType.accentClassName}`}
      >
        <FileIcon className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{fileName}</p>
          <DocumentStatusBadge status={status} />
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-1.5 text-xs text-muted-foreground">
          <span>{formatBytes(fileSize)}</span>
          {pageCount ? (
            <>
              <span>·</span>
              <span>
                {pageCount} {pageCount === 1 ? "page" : "pages"}
              </span>
            </>
          ) : null}
          <span>·</span>
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>
        {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
        {status === "PROCESSING" ? (
          <div
            className="mt-1.5 h-1 w-full max-w-40 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label={`Processing ${fileName}`}
          >
            <div className="h-full w-1/3 rounded-full bg-primary motion-safe:animate-[progress-indeterminate_1.2s_ease-in-out_infinite] motion-reduce:w-full motion-reduce:animate-none" />
          </div>
        ) : null}
      </div>

      <div className="relative z-10 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Document actions">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onPreview?.(id)}>
              <Eye className="mr-2 size-4" />
              Open preview
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/api/documents/${id}/raw?download=1`}>
                <Download className="mr-2 size-4" />
                Download
              </a>
            </DropdownMenuItem>
            {status === "FAILED" ? (
              <DropdownMenuItem
                onClick={() => {
                  setDeleteIntent("retry");
                  setDeleteOpen(true);
                }}
              >
                <RotateCcw className="mr-2 size-4" />
                Retry
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                setDeleteIntent("delete");
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isRetry ? "Retry processing this source?" : "Delete this source?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRetry
                ? `Obsidian doesn't automatically reprocess a failed source yet — this deletes ${fileName} so you can upload it again.`
                : `${fileName} and its indexed chunks will be permanently removed. This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting
                ? "Deleting…"
                : isRetry
                  ? "Delete & re-upload"
                  : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
