"use client";

import { FolderPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOpenCreateProjectDialog } from "@/components/dashboard/dashboard-shell";
import type { Project } from "@/types";
import { ProjectCard } from "./project-card";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const openCreateDialog = useOpenCreateProjectDialog();

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h2 className="text-lg font-semibold">
          Create your first project to get started
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Projects group your uploaded notes with the chats that answer
          questions about them.
        </p>
        <Button onClick={openCreateDialog} className="mt-2">
          <FolderPlus className="size-4" />
          Create your first project
        </Button>
      </div>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} index={index} />
      ))}
    </section>
  );
}
