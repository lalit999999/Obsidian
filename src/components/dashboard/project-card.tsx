"use client";

import Link from "next/link";
import {
  Ellipsis,
  MessagesSquare,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="group border-border/80 bg-card/90 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <Link
            href={`/project/${project.id}`}
            className="text-lg font-semibold tracking-tight transition-colors hover:text-primary"
          >
            {project.name}
          </Link>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="-mr-2 -mt-2">
              <Ellipsis className="size-4" />
              <span className="sr-only">Open project actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="mr-2 size-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessagesSquare className="mr-2 size-4" />
              New chat
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="rounded-full">
            <FileText className="mr-1 size-3.5" />
            {project.documentCount} documents
          </Badge>
          <Badge variant="secondary" className="rounded-full">
            <MessagesSquare className="mr-1 size-3.5" />
            {project.chatCount} chats
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Updated{" "}
            {new Date(project.updatedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
          <Button asChild variant="outline" size="sm">
            <Link href={`/project/${project.id}`}>Open</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
// Create a reusable project card.
//
// Props should include:
// - Project id.
// - Project name.
// - Description.
// - Document count.
// - Chat count.
// - Updated date.
//
// UI:
// - Project name.
// - Description.
// - Small statistics.
// - Last updated information.
// - Action/menu button.
//
// Behavior:
// - Clicking the main card navigates to /project/[projectId].
// - The menu can contain frontend-only placeholder actions
//   such as Rename and Delete.
//
// Use:
// - shadcn Card.
// - shadcn DropdownMenu.
// - shadcn Button.
//
// Keep the component reusable and typed.
