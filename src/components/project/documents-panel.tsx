"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Document } from "@/types";
import { DocumentItem } from "./document-item";
import { UploadDocumentDialog } from "./upload-document-dialog";

interface DocumentsPanelProps {
  documents: Document[];
  onUploadDocument: (file: File) => Promise<void> | void;
  onDeleteDocument: (documentId: string) => Promise<void> | void;
}

export function DocumentsPanel({
  documents,
  onUploadDocument,
  onDeleteDocument,
}: DocumentsPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    if (isUploading) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await onUploadDocument(file);
      setDialogOpen(false);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="flex h-full min-h-105 flex-col overflow-hidden border-border/80 bg-card/90">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-4">
        <div>
          <p className="text-sm text-muted-foreground">Documents</p>
          <h3 className="text-lg font-semibold">Knowledge sources</h3>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Upload className="size-4" />
          Upload
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-3">
          {documents.length ? (
            documents.map((document) => (
              <DocumentItem
                key={document.id}
                {...document}
                onDelete={onDeleteDocument}
              />
            ))
          ) : (
            <div className="rounded-3xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No documents uploaded yet. Use the upload button to add your first
              note.
            </div>
          )}
        </div>
      </ScrollArea>

      <UploadDocumentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isSubmitting={isUploading}
        error={error}
        onUpload={handleUpload}
      />
    </Card>
  );
}
