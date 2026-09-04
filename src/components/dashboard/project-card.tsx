"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { motion, useReducedMotion } from "motion/react";
import {
  Ellipsis,
  FileText,
  MessagesSquare,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(project.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--spotlight-x",
      `${event.clientX - rect.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--spotlight-y",
      `${event.clientY - rect.top}px`,
    );
  };

  const handleRename = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = renameValue.trim();
    if (!trimmed) {
      setRenameError("Project name is required.");
      return;
    }

    setIsRenaming(true);
    setRenameError(null);

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload?.error?.message ?? "Failed to rename project.");
      }

      setRenameOpen(false);
      toast.success("Project renamed");
      router.refresh();
    } catch (error) {
      setRenameError(
        error instanceof Error ? error.message : "Failed to rename project.",
      );
    } finally {
      setIsRenaming(false);
    }
  };

  const handleNewChat = async () => {
    if (isCreatingChat) {
      return;
    }
    setIsCreatingChat(true);
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload?.error?.message ?? "Failed to create chat.");
      }

      router.push(`/project/${project.id}?chatId=${payload.data.chat.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create chat.",
      );
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload?.error?.message ?? "Failed to delete project.");
      }

      setDeleteOpen(false);
      toast.success("Project deleted");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete project.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        onMouseMove={handleMouseMove}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: shouldReduceMotion ? 0 : index * 0.04,
        }}
        className="group relative overflow-hidden rounded-lg border border-border/80 bg-card/90 p-4 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-primary/40"
      >
        {!shouldReduceMotion ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), color-mix(in oklch, var(--primary) 12%, transparent), transparent 70%)",
            }}
          />
        ) : null}

        <Link
          href={`/project/${project.id}`}
          aria-label={`Open ${project.name}`}
          className="absolute inset-0 z-10 rounded-lg"
        />

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">
              {project.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {project.description}
            </p>
          </div>
          <div className="relative z-20 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="-mt-1 -mr-1"
                  aria-label="Project actions"
                >
                  <Ellipsis className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setRenameValue(project.name);
                    setRenameError(null);
                    setRenameOpen(true);
                  }}
                >
                  <Pencil className="mr-2 size-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isCreatingChat}
                  onClick={handleNewChat}
                >
                  <Plus className="mr-2 size-4" />
                  New chat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <FileText className="size-3.5" />
              {project.documentCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessagesSquare className="size-3.5" />
              {project.chatCount}
            </span>
          </span>
          <span>
            Updated{" "}
            {formatDistanceToNow(new Date(project.updatedAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </motion.div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Choose a new name for &ldquo;{project.name}&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleRename}>
            <div className="space-y-2">
              <Label htmlFor={`rename-${project.id}`}>Project name</Label>
              <Input
                id={`rename-${project.id}`}
                value={renameValue}
                onChange={(event) => setRenameValue(event.target.value)}
                disabled={isRenaming}
                autoFocus
              />
            </div>
            {renameError ? (
              <p className="text-sm text-destructive">{renameError}</p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameOpen(false)}
                disabled={isRenaming}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isRenaming}>
                {isRenaming ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{project.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the project along with its {project.documentCount}{" "}
              document{project.documentCount === 1 ? "" : "s"} and{" "}
              {project.chatCount} chat{project.chatCount === 1 ? "" : "s"}.
              This cannot be undone.
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
    </>
  );
}
