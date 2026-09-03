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
  onUpload: (file: File) => void;
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  onUpload,
}: UploadDocumentDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setError(null);
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
      setError(validationError);
      return;
    }

    onUpload(file as File);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>
            Choose a Markdown or text file. Processing is simulated in the
            frontend.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            type="file"
            accept=".md,.txt"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0] ?? null;
              setFile(selectedFile);
              setError(validateFile(selectedFile));
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
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              <Upload className="size-4" />
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
// Create the document upload dialog.
//
// Requirements:
// - Use shadcn Dialog.
// - Add a file input.
// - Accept only:
//   .md
//   .txt
//
// UI states:
// - No file selected.
// - File selected.
// - Invalid file type.
// - Mock uploading/processing.
//
// Behavior:
// - Validate the selected file type on the frontend.
// - On successful mock upload, call a callback with
//   the document information.
// - Simulate PROCESSING and optionally transition to READY.
//
// Important:
// - Do not perform a real upload.
// - No Cloudinary/backend integration in Part 1.
