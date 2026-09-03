"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Document, DocumentStatus } from "@/types";
import { DocumentItem } from "./document-item";
import { UploadDocumentDialog } from "./upload-document-dialog";

interface DocumentsPanelProps {
  documents: Document[];
  onUploadDocument: (
    document: Omit<Document, "id" | "createdAt" | "projectId" | "userId">,
    fileName: string,
  ) => void;
  onDeleteDocument: (documentId: string) => void;
}

export function DocumentsPanel({
  documents,
  onUploadDocument,
  onDeleteDocument,
}: DocumentsPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Card className="flex h-full min-h-[420px] flex-col overflow-hidden border-border/80 bg-card/90">
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
        onUpload={(file) => {
          onUploadDocument(
            {
              fileSize: file.size,
              fileName: file.name,
              mimeType:
                file.type ||
                (file.name.endsWith(".md") ? "text/markdown" : "text/plain"),
              status: "PROCESSING" as DocumentStatus,
              error: null,
              chunkCount: 0,
            },
            file.name,
          );
        }}
      />
    </Card>
  );
}
// Create the documents management panel.
//
// Include:
// - Panel heading.
// - Upload Document button.
// - Documents list.
// - UploadDocumentDialog.
//
// Supported frontend MVP file types:
// - .md
// - .txt
//
// Display:
// - File name.
// - File size.
// - Processing status.
// - Optional actions.
//
// Statuses:
// - PENDING
// - PROCESSING
// - READY
// - FAILED
//
// Important:
// - Do not upload files to a real service.
// - Use local state to simulate adding documents.
// - A selected file can be represented in the UI only.
//
// Use shadcn ScrollArea and other shadcn components.
