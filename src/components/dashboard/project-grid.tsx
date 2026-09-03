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
import type { Project } from "@/types";
import { ProjectCard } from "./project-card";

interface ProjectGridProps {
  projects: Project[];
  onCreateProject: () => void;
}

export function ProjectGrid({ projects, onCreateProject }: ProjectGridProps) {
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
          <Button onClick={onCreateProject}>
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
// Render the user's projects.
//
// Props:
// - projects array.
// - Optional callback for project interactions.
//
// Requirements:
// - Render ProjectCard for every project.
// - Use a responsive grid.
// - Show an empty state when there are no projects.
//
// Empty state:
// - Explain that the user has no projects yet.
// - Provide a button to create the first project.
//
// Use shadcn components for the empty state.
