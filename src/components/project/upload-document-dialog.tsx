"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: string | null;
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

  useEffect(() => {
    if (!open) {
      setFile(null);
      setClientError(null);
    }
  }, [open]);

  const validateFile = (selectedFile: File | null) => {
    if (!selectedFile) {
      return "Please choose a file.";
    }

    const valid =
      selectedFile.name.endsWith(".md") || selectedFile.name.endsWith(".txt");
    return valid ? null : "Only .md and .txt files are supported.";
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateFile(file);

    if (validationError) {
      setClientError(validationError);
      return;
    }

    void onUpload(file as File);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>
            Choose a Markdown or text file to upload into the project knowledge
            base.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            type="file"
            accept=".md,.txt"
            disabled={isSubmitting}
            onChange={(event) => {
              const selectedFile = event.target.files?.[0] ?? null;
              setFile(selectedFile);
              setClientError(validateFile(selectedFile));
            }}
          />
          {file ? (
            <div className="flex items-center justify-between rounded-2xl border bg-muted/40 px-3 py-2 text-sm">
              <span className="truncate">{file.name}</span>
              <Badge variant="secondary">Ready to upload</Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No file selected.</p>
          )}
          {clientError || error ? (
            <p className="text-sm text-destructive">{clientError ?? error}</p>
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
            <Button type="submit" disabled={isSubmitting}>
              <Upload className="size-4" />
              {isSubmitting ? "Uploading" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
