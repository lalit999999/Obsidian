"use client";

import { useEffect, useRef, useState } from "react";
import {
  Copy,
  Download,
  File,
  FileCode2,
  FileText,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Markdown } from "@/components/ui/markdown";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Document } from "@/types";
import { DocumentStatusBadge } from "./document-status-badge";

interface DocumentPreviewDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (documentId: string) => Promise<void> | void;
}

interface PreviewState {
  content: string | null;
  truncated: boolean;
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

export function DocumentPreviewDialog({
  document,
  open,
  onOpenChange,
  onDelete,
}: DocumentPreviewDialogProps) {
  const cacheRef = useRef<Map<string, PreviewState>>(new Map());
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const documentId = document?.id ?? null;

  useEffect(() => {
    if (!open || !documentId) {
      return;
    }

    const cached = cacheRef.current.get(documentId);
    if (cached) {
      setPreview(cached);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/api/documents/${documentId}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(
            payload?.error?.message ?? "Failed to load document.",
          );
        }
        return payload.data as { content: string | null; truncated: boolean };
      })
      .then((data) => {
        if (cancelled) return;
        const state: PreviewState = {
          content: data.content,
          truncated: data.truncated,
        };
        cacheRef.current.set(documentId, state);
        setPreview(state);
      })
      .catch((fetchError) => {
        if (cancelled) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load document.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, documentId, refreshKey]);

  const handleRetry = () => {
    if (!documentId) return;
    cacheRef.current.delete(documentId);
    setPreview(null);
    setError(null);
    setRefreshKey((key) => key + 1);
  };

  const handleCopy = async () => {
    if (!preview?.content) return;
    try {
      await navigator.clipboard.writeText(preview.content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy content");
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    setIsDeleting(true);
    try {
      await onDelete(document.id);
      toast.success("Document deleted");
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete document.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!document) {
    return null;
  }

  const FileIcon = getFileIcon(document.fileName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[85dvh] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
      >
        <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <FileIcon className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <DialogTitle className="truncate text-sm font-semibold">
                {document.fileName}
              </DialogTitle>
              <DocumentStatusBadge status={document.status} />
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {formatBytes(document.fileSize)} · {document.chunkCount} chunks
              · created {new Date(document.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Copy content"
              disabled={!preview?.content}
              onClick={handleCopy}
            >
              <Copy className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Download" asChild>
              <a href={document.cloudinaryUrl} download={document.fileName}>
                <Download className="size-4" />
              </a>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete document"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this document?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {document.fileName} and its indexed chunks will be
                    permanently removed. This cannot be undone.
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
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="preview" className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b px-4 py-2">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="raw">Raw</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="preview"
            className="min-h-0 flex-1 overflow-y-auto px-6 py-5"
          >
            {isLoading ? (
              <div className="space-y-2.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-start gap-2 text-sm text-destructive">
                <p>{error}</p>
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  <RotateCcw className="size-3.5" />
                  Retry
                </Button>
              </div>
            ) : preview?.content ? (
              <>
                <Markdown
                  content={preview.content}
                  scale="comfortable"
                  className="max-w-none"
                />
                {preview.truncated ? (
                  <p className="mt-6 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
                    This preview was truncated to the first 1 MB of the file.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Preview not available for this file type.
              </p>
            )}
          </TabsContent>

          <TabsContent
            value="raw"
            className="min-h-0 flex-1 overflow-y-auto px-6 py-5"
          >
            {isLoading ? (
              <div className="space-y-2.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-start gap-2 text-sm text-destructive">
                <p>{error}</p>
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  <RotateCcw className="size-3.5" />
                  Retry
                </Button>
              </div>
            ) : preview?.content ? (
              <pre
                className={cn(
                  "whitespace-pre-wrap font-mono text-xs leading-6 text-foreground",
                )}
              >
                {preview.content}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">
                Preview not available for this file type.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
