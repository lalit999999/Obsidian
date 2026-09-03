"use client";

import { useMemo, useState } from "react";
import { PanelLeft, Plus } from "lucide-react";

import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { ProjectGrid } from "@/components/dashboard/project-grid";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { mockProjects, mockUser } from "@/lib/mock-data";
import type { Project } from "@/types";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const statistics = useMemo(
    () => ({
      totalProjects: projects.length,
      totalDocuments: projects.reduce(
        (sum, project) => sum + project.documentCount,
        0,
      ),
      totalChats: projects.reduce((sum, project) => sum + project.chatCount, 0),
    }),
    [projects],
  );

  const createProject = (input: { name: string; description: string }) => {
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const nextProject: Project = {
      id: `project-${slug || Date.now()}`,
      name: input.name,
      description: input.description || "A new knowledge-base project.",
      userId: mockUser.id,
      documentCount: 0,
      chatCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((current) => [nextProject, ...current]);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar user={mockUser} />
      <main className="flex-1">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-3xl border bg-card/90 px-4 py-3 xl:hidden">
            <div>
              <p className="text-sm text-muted-foreground">Obsidian AI</p>
              <p className="font-semibold">Dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <PanelLeft className="size-4" />
                    Menu
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[min(22rem,100vw)] p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <DashboardSidebar user={mockUser} />
                </SheetContent>
              </Sheet>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="size-4" />
                Project
              </Button>
            </div>
          </div>

          <DashboardHeader onCreateProject={() => setDialogOpen(true)} />
          <WelcomeSection user={mockUser} statistics={statistics} />
          <ProjectGrid
            projects={projects}
            onCreateProject={() => setDialogOpen(true)}
          />
        </div>

        <CreateProjectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onCreateProject={createProject}
        />
      </main>
    </div>
  );
}
// Build the dashboard page.
//
// Compose:
// - DashboardSidebar
// - DashboardHeader
// - WelcomeSection
// - ProjectGrid
// - CreateProjectDialog
//
// Requirements:
// - Use mock project data from lib/mock-data.ts.
// - The layout should feel like a real SaaS dashboard.
// - Include an action to create a new project.
// - Project cards should navigate to /project/[projectId].
//
// Important:
// - This is frontend-only.
// - Use local React state for interactions.
// - Do not implement database calls.
