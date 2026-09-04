"use client";

import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  MessagesSquare,
  PanelLeft,
  PanelRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Project } from "@/types";

interface ProjectHeaderProps {
  project: Project;
  onOpenChats?: () => void;
  onOpenDocuments?: () => void;
}

export function ProjectHeader({
  project,
  onOpenChats,
  onOpenDocuments,
}: ProjectHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-1">
      <Button
        variant="ghost"
        size="icon"
        asChild
        aria-label="Back to dashboard"
      >
        <Link href="/dashboard">
          <ArrowLeft className="size-4" />
        </Link>
      </Button>

      <h1 className="min-w-0 shrink-0 truncate text-base font-semibold">
        {project.name}
      </h1>

      {project.description ? (
        <p className="hidden min-w-0 flex-1 truncate text-sm text-muted-foreground md:block">
          {project.description}
        </p>
      ) : (
        <div className="min-w-0 flex-1" />
      )}

      <div className="flex shrink-0 items-center gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs text-muted-foreground">
          <FileText className="size-3.5 text-primary" />
          {project.documentCount}
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs text-muted-foreground">
          <MessagesSquare className="size-3.5 text-primary" />
          {project.chatCount}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          aria-label="Open chats"
          onClick={onOpenChats}
        >
          <PanelLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          aria-label="Open documents"
          onClick={onOpenDocuments}
        >
          <PanelRight className="size-4" />
        </Button>
      </div>
    </header>
  );
}
