"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FileCode2, FileText, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/format";

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: string | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function validateFile(selectedFile: File): string | null {
  const isTextFile =
    selectedFile.name.endsWith(".md") || selectedFile.name.endsWith(".txt");

  if (!isTextFile) {
    return "Only .md and .txt files are supported.";
  }

  if (selectedFile.size > MAX_FILE_SIZE) {
    return `File is too large (${formatBytes(selectedFile.size)}). Max size is ${formatBytes(MAX_FILE_SIZE)}.`;
  }

  return null;
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  onUpload,
  isSubmitting,
  error,
}: UploadDocumentDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setClientError(null);
      setIsDragging(false);
    }
  }, [open]);

  const handleSelectFile = (selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    setClientError(validationError);
    setFile(validationError ? null : selectedFile);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setClientError("Please choose a file.");
      return;
    }

    void onUpload(file);
  };

  const FileIcon = file?.name.endsWith(".md") ? FileCode2 : FileText;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>
            Choose a Markdown or text file to upload into the project
            knowledge base.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {file ? (
            <div className="flex items-center gap-3 rounded-md border bg-muted/40 px-3 py-2.5 text-sm">
              <FileIcon className="size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove selected file"
                disabled={isSubmitting}
                onClick={() => {
                  setFile(null);
                  setClientError(null);
                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <label
              htmlFor={inputId}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                const droppedFile = event.dataTransfer.files?.[0];
                if (droppedFile) {
                  handleSelectFile(droppedFile);
                }
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/40",
              )}
            >
              <Upload className="size-5 text-muted-foreground" />
              <p className="text-sm font-medium">
                Drag a file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                .md or .txt, up to {formatBytes(MAX_FILE_SIZE)}
              </p>
              <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept=".md,.txt"
                disabled={isSubmitting}
                className="sr-only"
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0];
                  if (selectedFile) {
                    handleSelectFile(selectedFile);
                  }
                }}
              />
            </label>
          )}

          {clientError || error ? (
            <p className="text-sm text-destructive">{clientError ?? error}</p>
          ) : null}

          {isSubmitting ? (
            <div
              className="h-1 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Uploading"
            >
              <div className="h-full w-1/3 rounded-full bg-primary motion-safe:animate-[progress-indeterminate_1.2s_ease-in-out_infinite] motion-reduce:w-full motion-reduce:animate-none" />
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !file}>
              <Upload className="size-4" />
              {isSubmitting ? "Uploading…" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
