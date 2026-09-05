"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CheckCircle2,
  CircleAlert,
  FileUp,
  Loader2,
  Upload,
  X,
} from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/format";
import {
  FILE_ACCEPT_ATTRIBUTE,
  LEGACY_DOC_ERROR_MESSAGE,
  LEGACY_DOC_EXTENSION,
  SOURCE_TYPES,
  matchSourceType,
  type SourceTypeUi,
} from "@/lib/sources/registry";
import type { Document } from "@/types";

const MAX_TITLE_LENGTH = 120;
const MAX_TEXT_LENGTH = 200_000;

interface AddSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFileSource: (file: File) => Promise<Document>;
  onAddTextSource: (input: {
    title: string;
    text: string;
  }) => Promise<Document>;
}

type FileItemStatus = "queued" | "uploading" | "done" | "error";

interface FileItem {
  id: string;
  file: File;
  sourceType: SourceTypeUi | null;
  clientError: string | null;
  status: FileItemStatus;
  serverError: string | null;
}

function validateFile(file: File): {
  sourceType: SourceTypeUi | null;
  error: string | null;
} {
  if (file.name.toLowerCase().endsWith(LEGACY_DOC_EXTENSION)) {
    return { sourceType: null, error: LEGACY_DOC_ERROR_MESSAGE };
  }

  const sourceType = matchSourceType(file.name, file.type);
  if (!sourceType) {
    return { sourceType: null, error: "This file type isn't supported." };
  }

  if (file.size > sourceType.maxBytes) {
    return {
      sourceType,
      error: `File is too large (${formatBytes(file.size)}). Max size is ${formatBytes(sourceType.maxBytes)}.`,
    };
  }

  return { sourceType, error: null };
}

let fileItemCounter = 0;
function nextFileItemId() {
  fileItemCounter += 1;
  return `file-${fileItemCounter}-${Date.now()}`;
}

export function AddSourceDialog({
  open,
  onOpenChange,
  onAddFileSource,
  onAddTextSource,
}: AddSourceDialogProps) {
  const shouldReduceMotion = useReducedMotion();
  const titleInputId = useId();
  const textareaId = useId();
  const fileInputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isSubmittingText, setIsSubmittingText] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmittingFiles, setIsSubmittingFiles] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setText("");
      setTextError(null);
      setIsSubmittingText(false);
      setFiles([]);
      setIsDragging(false);
      setIsSubmittingFiles(false);
      setActiveTab("upload");
    }
  }, [open]);

  const addFiles = (fileList: FileList | File[]) => {
    const items: FileItem[] = Array.from(fileList).map((file) => {
      const { sourceType, error } = validateFile(file);
      return {
        id: nextFileItemId(),
        file,
        sourceType,
        clientError: error,
        status: "queued",
        serverError: null,
      };
    });

    setFiles((current) => [...current, ...items]);
  };

  const removeFile = (id: string) => {
    setFiles((current) => current.filter((item) => item.id !== id));
  };

  const handleSubmitText = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSubmittingText) {
      return;
    }

    setIsSubmittingText(true);
    setTextError(null);

    try {
      await onAddTextSource({ title: title.trim(), text: trimmed });
      onOpenChange(false);
    } catch (error) {
      setTextError(
        error instanceof Error ? error.message : "Failed to add source.",
      );
    } finally {
      setIsSubmittingText(false);
    }
  };

  const handleSubmitFiles = async () => {
    const validItems = files.filter((item) => !item.clientError);
    if (validItems.length === 0 || isSubmittingFiles) {
      return;
    }

    setIsSubmittingFiles(true);

    for (const item of validItems) {
      setFiles((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, status: "uploading" } : entry,
        ),
      );

      try {
        await onAddFileSource(item.file);
        setFiles((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, status: "done" } : entry,
          ),
        );
      } catch (error) {
        setFiles((current) =>
          current.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  status: "error",
                  serverError:
                    error instanceof Error
                      ? error.message
                      : "Upload failed.",
                }
              : entry,
          ),
        );
      }
    }

    setIsSubmittingFiles(false);

    setFiles((current) => {
      const allSucceeded =
        current.length > 0 &&
        current.every((entry) => !entry.clientError && entry.status === "done");

      if (allSucceeded) {
        queueMicrotask(() => onOpenChange(false));
      }

      return current;
    });
  };

  const titleRemaining = MAX_TITLE_LENGTH - title.length;
  const textRemaining = MAX_TEXT_LENGTH - text.length;
  const hasValidFiles = files.some((item) => !item.clientError);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle>Add source</DialogTitle>
          <DialogDescription>
            Paste text or upload files into this project&rsquo;s knowledge
            base.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "upload" | "paste")}
          className="min-h-0 flex-1 flex-col gap-0 overflow-y-auto"
        >
          <div className="shrink-0 px-4 pt-3">
            <TabsList>
              <TabsTrigger value="upload">Upload file</TabsTrigger>
              <TabsTrigger value="paste">Paste text</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="paste" className="flex-1 space-y-3 px-4 py-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor={titleInputId} className="text-sm font-medium">
                  Title
                </label>
                <span className="text-xs text-muted-foreground">
                  {title.length}/{MAX_TITLE_LENGTH}
                </span>
              </div>
              <Input
                id={titleInputId}
                value={title}
                maxLength={MAX_TITLE_LENGTH}
                placeholder="Untitled note"
                disabled={isSubmittingText}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor={textareaId} className="text-sm font-medium">
                  Content
                </label>
                <span
                  className={cn(
                    "text-xs text-muted-foreground",
                    textRemaining <= 0 && "text-destructive",
                  )}
                >
                  {text.length.toLocaleString()}/
                  {MAX_TEXT_LENGTH.toLocaleString()}
                </span>
              </div>
              <Textarea
                id={textareaId}
                value={text}
                maxLength={MAX_TEXT_LENGTH}
                rows={14}
                placeholder="Paste or write your note here…"
                disabled={isSubmittingText}
                className="min-h-56 font-mono text-xs"
                onChange={(event) => setText(event.target.value)}
              />
              {textRemaining <= 0 ? (
                <p className="text-xs text-destructive">
                  You&rsquo;ve reached the 200,000 character limit.
                </p>
              ) : null}
            </div>

            {textError ? (
              <p className="text-sm text-destructive">{textError}</p>
            ) : null}
          </TabsContent>

          <TabsContent value="upload" className="flex-1 space-y-4 px-4 py-4">
            <label
              htmlFor={fileInputId}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                if (event.dataTransfer.files?.length) {
                  addFiles(event.dataTransfer.files);
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
                Drag files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Select one or more files
              </p>
              <input
                ref={inputRef}
                id={fileInputId}
                type="file"
                multiple
                accept={FILE_ACCEPT_ATTRIBUTE}
                disabled={isSubmittingFiles}
                className="sr-only"
                onChange={(event) => {
                  if (event.target.files?.length) {
                    addFiles(event.target.files);
                  }
                  event.target.value = "";
                }}
              />
            </label>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {SOURCE_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.kind}
                    className="flex items-center gap-2 rounded-md border bg-muted/20 px-2 py-1.5"
                  >
                    <div
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded",
                        type.accentClassName,
                      )}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">
                        {type.label}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        up to {formatBytes(type.maxBytes)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {files.length ? (
              <ul className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {files.map((item) => {
                    const Icon = item.sourceType?.icon ?? FileUp;
                    const errorMessage = item.clientError ?? item.serverError;

                    return (
                      <motion.li
                        key={item.id}
                        initial={
                          shouldReduceMotion ? false : { opacity: 0, y: -6 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md border px-2.5 py-2 text-sm",
                          errorMessage
                            ? "border-destructive/40 bg-destructive/5"
                            : "bg-muted/20",
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-md",
                            item.sourceType?.accentClassName ??
                              "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">
                            {item.file.name}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {formatBytes(item.file.size)}
                          </p>
                          {errorMessage ? (
                            <p className="mt-0.5 text-[11px] text-destructive">
                              {errorMessage}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {item.status === "uploading" ? (
                            <Loader2
                              className="size-3.5 animate-spin text-muted-foreground"
                              aria-label="Uploading"
                            />
                          ) : item.status === "done" ? (
                            <CheckCircle2
                              className="size-3.5 text-emerald-500"
                              aria-label="Uploaded"
                            />
                          ) : errorMessage ? (
                            <CircleAlert
                              className="size-3.5 text-destructive"
                              aria-label="Error"
                            />
                          ) : null}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Remove ${item.file.name}`}
                            disabled={item.status === "uploading"}
                            onClick={() => removeFile(item.id)}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            ) : null}
          </TabsContent>

          <DialogFooter className="shrink-0 border-t px-4 py-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmittingText || isSubmittingFiles}
            >
              Cancel
            </Button>
            {activeTab === "paste" ? (
              <Button
                type="button"
                disabled={isSubmittingText || !text.trim()}
                onClick={handleSubmitText}
              >
                {isSubmittingText ? "Adding…" : "Add source"}
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isSubmittingFiles || !hasValidFiles}
                onClick={handleSubmitFiles}
              >
                <Upload className="size-4" />
                {isSubmittingFiles ? "Uploading…" : "Upload"}
              </Button>
            )}
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
