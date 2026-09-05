"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FileStack, PanelRightClose, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Document } from "@/types";
import { DocumentItem } from "./document-item";
import { AddSourceDialog } from "./add-source-dialog";

interface DocumentsPanelProps {
  documents: Document[];
  selectedDocumentIds: string[];
  onToggleSelect: (documentId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onAddFileSource: (file: File) => Promise<Document>;
  onAddTextSource: (input: {
    title: string;
    text: string;
  }) => Promise<Document>;
  onDeleteDocument: (documentId: string) => Promise<void> | void;
  onPreviewDocument?: (documentId: string) => void;
  onCollapse?: () => void;
}

export function DocumentsPanel({
  documents,
  selectedDocumentIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onAddFileSource,
  onAddTextSource,
  onDeleteDocument,
  onPreviewDocument,
  onCollapse,
}: DocumentsPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const readyDocuments = documents.filter((doc) => doc.status === "READY");
  const selectedCount = selectedDocumentIds.length;
  const showSelectionBar = readyDocuments.length >= 2;

  return (
    <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden border-border/80 bg-card/90 py-0">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <FileStack className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Sources</h3>
        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="size-3.5" />
            Add source
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

      {showSelectionBar ? (
        <div className="flex shrink-0 items-center gap-2 border-b bg-muted/30 px-3 py-1.5 text-xs">
          <span className="text-muted-foreground">
            {selectedCount > 0
              ? `${selectedCount} of ${readyDocuments.length} selected`
              : `${readyDocuments.length} sources`}
          </span>
          {selectedCount > 0 ? (
            <Badge className="bg-primary/10 text-primary">Scoped</Badge>
          ) : null}
          <div className="ml-auto flex items-center gap-1">
            {selectedCount < readyDocuments.length ? (
              <Button variant="ghost" size="xs" onClick={onSelectAll}>
                Select all
              </Button>
            ) : null}
            {selectedCount > 0 ? (
              <Button variant="ghost" size="xs" onClick={onClearSelection}>
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

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
                    selected={selectedDocumentIds.includes(document.id)}
                    onToggleSelect={onToggleSelect}
                    onDelete={onDeleteDocument}
                    onPreview={onPreviewDocument}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              No sources added yet. Use &ldquo;Add source&rdquo; to upload a
              file or paste a note.
            </div>
          )}
        </div>
      </ScrollArea>

      <AddSourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddFileSource={onAddFileSource}
        onAddTextSource={onAddTextSource}
      />
    </Card>
  );
}
