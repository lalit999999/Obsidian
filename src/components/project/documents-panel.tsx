"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FileStack, PanelRightClose, Upload } from "lucide-react";

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
  onPreviewDocument?: (documentId: string) => void;
  onCollapse?: () => void;
}

export function DocumentsPanel({
  documents,
  onUploadDocument,
  onDeleteDocument,
  onPreviewDocument,
  onCollapse,
}: DocumentsPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

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
    <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden border-border/80 bg-card/90 py-0">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <FileStack className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Sources</h3>
        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Upload className="size-3.5" />
            Upload
          </Button>
          {onCollapse ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden lg:flex"
              aria-label="Collapse sources panel"
              onClick={onCollapse}
            >
              <PanelRightClose className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-1 p-2">
          {documents.length ? (
            <AnimatePresence initial={false}>
              {documents.map((document) => (
                <motion.div
                  key={document.id}
                  initial={
                    shouldReduceMotion ? false : { opacity: 0, y: -8 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DocumentItem
                    {...document}
                    onDelete={onDeleteDocument}
                    onPreview={onPreviewDocument}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              No documents uploaded yet. Use the upload button to add your
              first note.
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
