"use client";

import { FolderPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <Card className="border-dashed border-border/80 bg-card/70">
        <CardHeader>
          <CardTitle>No projects yet</CardTitle>
          <CardDescription>
            Create your first knowledge-base project to start organizing notes
            and chats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={openCreateDialog}>
            <FolderPlus className="size-4" />
            Create your first project
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </section>
  );
}
