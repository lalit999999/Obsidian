import Link from "next/link";
import { ArrowLeft, FileText, MessagesSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Project } from "@/types";

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Button
          variant="ghost"
          asChild
          className="mb-3 -ml-3 w-fit px-2 text-muted-foreground"
        >
          <Link href="/dashboard">
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
        </Button>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Project workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {project.name}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          {project.description}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5">
          <FileText className="size-4 text-primary" />
          {project.documentCount} documents
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5">
          <MessagesSquare className="size-4 text-primary" />
          {project.chatCount} chats
        </div>
      </div>
    </header>
  );
}
// Create the project workspace header.
//
// Include:
// - Back navigation to /dashboard.
// - Project name.
// - Project description if available.
// - Small project metadata if useful.
//
// Requirements:
// - Use shadcn Button.
// - Use a Lucide back icon.
// - Keep the header compact because the workspace
//   needs maximum vertical space.
