"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Download, RotateCcw, Trash2, X } from "lucide-react";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { sourceTypeForKind } from "@/lib/sources/registry";
import type { Document, SourceKind } from "@/types";
import { DocumentStatusBadge } from "./document-status-badge";
import { DocumentPreviewBody } from "./previews/document-preview-body";
import { PlainPreview } from "./previews/plain-preview";

interface DocumentPreviewDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (documentId: string) => Promise<void> | void;
}

interface PreviewState {
  content: string | null;
  previewMarkdown: string | null;
  truncated: boolean;
}

const TAB_LABELS: Record<SourceKind, { primary: string; secondary: string }> =
  {
    TEXT: { primary: "Preview", secondary: "Raw" },
    MARKDOWN: { primary: "Preview", secondary: "Raw" },
    RTF: { primary: "Preview", secondary: "Raw" },
    ODT: { primary: "Preview", secondary: "Raw" },
    DOCX: { primary: "Preview", secondary: "Raw text" },
    PDF: { primary: "Document", secondary: "Extracted text" },
    IMAGE: { primary: "Image", secondary: "Text & analysis" },
  };

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
  const isReady = document?.status === "READY";

  useEffect(() => {
    if (!open || !documentId || !isReady) {
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
        return payload.data as {
          content: string | null;
          previewMarkdown: string | null;
          truncated: boolean;
        };
      })
      .then((data) => {
        if (cancelled) return;
        const state: PreviewState = {
          content: data.content,
          previewMarkdown: data.previewMarkdown,
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
  }, [open, documentId, isReady, refreshKey]);

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

  const sourceType = sourceTypeForKind(document.sourceKind);
  const FileIcon = sourceType.icon;
  const tabLabels = TAB_LABELS[document.sourceKind] ?? TAB_LABELS[sourceType.kind];
  const isTallPreview =
    document.previewKind === "PDF" || document.previewKind === "IMAGE";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0",
          isTallPreview ? "h-[90dvh] sm:max-w-5xl" : "h-[85dvh] sm:max-w-4xl",
        )}
      >
        <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-md",
              sourceType.accentClassName,
            )}
          >
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
              <a href={`/api/documents/${document.id}/raw?download=1`}>
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
                  <AlertDialogTitle>Delete this source?</AlertDialogTitle>
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

        {!isReady ? (
          <NonReadyPanel
            document={document}
            isDeleting={isDeleting}
            onDelete={handleDelete}
          />
        ) : (
          <Tabs defaultValue="primary" className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b px-4 py-2">
              <TabsList>
                <TabsTrigger value="primary">{tabLabels.primary}</TabsTrigger>
                <TabsTrigger value="secondary">
                  {tabLabels.secondary}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="primary"
              className={cn(
                "min-h-0 flex-1 overflow-y-auto",
                isTallPreview ? "p-3" : "px-6 py-5",
              )}
            >
              {isLoading ? (
                <PreviewSkeleton />
              ) : error ? (
                <ErrorPanel message={error} onRetry={handleRetry} />
              ) : (
                <DocumentPreviewBody
                  document={document}
                  content={preview?.content ?? null}
                  previewMarkdown={preview?.previewMarkdown ?? null}
                  truncated={preview?.truncated ?? false}
                />
              )}
            </TabsContent>

            <TabsContent
              value="secondary"
              className="min-h-0 flex-1 overflow-y-auto px-6 py-5"
            >
              {isLoading ? (
                <PreviewSkeleton />
              ) : error ? (
                <ErrorPanel message={error} onRetry={handleRetry} />
              ) : preview?.content ? (
                <PlainPreview
                  content={preview.content}
                  truncated={preview.truncated}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Preview not available for this file type.
                </p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PreviewSkeleton() {
  return (
    <div className="space-y-2.5">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

function ErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-2 text-sm text-destructive">
      <p>{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCcw className="size-3.5" />
        Retry
      </Button>
    </div>
  );
}

function NonReadyPanel({
  document,
  isDeleting,
  onDelete,
}: {
  document: Document;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  if (document.status === "FAILED") {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-start gap-3 overflow-y-auto px-6 py-5">
        <div className="w-full rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {document.error ?? "Processing this source failed."}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-destructive/40 text-destructive hover:bg-destructive/10"
          disabled={isDeleting}
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
          {isDeleting ? "Deleting…" : "Delete this source"}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
      <PreviewSkeleton />
      <p className="text-sm text-muted-foreground">
        Still processing this source…
      </p>
    </div>
  );
}
