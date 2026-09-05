"use client";

import { useEffect, useState } from "react";
import { FileX2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentPreviewDialog } from "@/components/project/document-preview-dialog";
import type { LibraryDocument } from "@/types/library";
import type { SourceKind } from "@/types";
import { LibraryDocumentCard } from "./library-document-card";

interface LibraryDocumentGridProps {
  sourceKind?: SourceKind;
  projectId?: string;
}

function buildUrl(
  sourceKind: SourceKind | undefined,
  projectId: string | undefined,
  cursor: string | null,
) {
  const params = new URLSearchParams();
  if (sourceKind) params.set("sourceKind", sourceKind);
  if (projectId) params.set("projectId", projectId);
  if (cursor) params.set("cursor", cursor);
  const query = params.toString();
  return query ? `/api/documents?${query}` : "/api/documents";
}

export function LibraryDocumentGrid({
  sourceKind,
  projectId,
}: LibraryDocumentGridProps) {
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(buildUrl(sourceKind, projectId, null))
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(
            payload?.error?.message ?? "Failed to load documents.",
          );
        }
        if (!cancelled) {
          setDocuments(payload.data.documents);
          setNextCursor(payload.data.nextCursor);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load documents.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sourceKind, projectId]);

  const loadMore = async () => {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const response = await fetch(buildUrl(sourceKind, projectId, nextCursor));
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(
          payload?.error?.message ?? "Failed to load more documents.",
        );
      }
      setDocuments((current) => [...current, ...payload.data.documents]);
      setNextCursor(payload.data.nextCursor);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load more documents.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    const response = await fetch(`/api/documents/${documentId}`, {
      method: "DELETE",
    });
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload?.error?.message ?? "Failed to delete document.");
    }

    setDocuments((current) => current.filter((doc) => doc.id !== documentId));
    setPreviewDocumentId((current) =>
      current === documentId ? null : current,
    );
  };

  const previewDocument =
    documents.find((doc) => doc.id === previewDocumentId) ?? null;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileX2 />
          </EmptyMedia>
          <EmptyTitle>Couldn't load these documents</EmptyTitle>
          <EmptyDescription>{error}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (documents.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileX2 />
          </EmptyMedia>
          <EmptyTitle>No documents here yet</EmptyTitle>
          <EmptyDescription>
            Nothing matches this view yet — upload a source or check back
            later.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {documents.map((document) => (
          <LibraryDocumentCard
            key={document.id}
            document={document}
            onOpen={() => setPreviewDocumentId(document.id)}
          />
        ))}
      </div>

      {nextCursor ? (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            disabled={isLoadingMore}
            onClick={() => void loadMore()}
          >
            {isLoadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}

      <DocumentPreviewDialog
        document={previewDocument}
        open={previewDocumentId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewDocumentId(null);
          }
        }}
        onDelete={handleDelete}
      />
    </>
  );
}
