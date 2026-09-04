"use client";

import { useState } from "react";
import { Download, Eye, File, FileCode2, FileText, MoreVertical, Trash2 } from "lucide-react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatBytes } from "@/lib/format";
import type { Document } from "@/types";
import { DocumentStatusBadge } from "./document-status-badge";

interface DocumentItemProps extends Document {
  onDelete?: (documentId: string) => Promise<void> | void;
  onPreview?: (documentId: string) => void;
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
  cloudinaryUrl,
  status,
  createdAt,
  error,
  onDelete,
  onPreview,
}: DocumentItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const FileIcon = getFileIcon(fileName);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete?.(id);
      setDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group relative flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted/50">
      <button
        type="button"
        onClick={() => onPreview?.(id)}
        aria-label={`Open preview for ${fileName}`}
        className="absolute inset-0 rounded-md transition-transform active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:active:scale-100"
      />

      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <FileIcon className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{fileName}</p>
          <DocumentStatusBadge status={status} />
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-1.5 text-xs text-muted-foreground">
          <span>{formatBytes(fileSize)}</span>
          <span>·</span>
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>
        {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
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
              <a href={cloudinaryUrl} download={fileName}>
                <Download className="mr-2 size-4" />
                Download
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
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
            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              {fileName} and its indexed chunks will be permanently removed.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
