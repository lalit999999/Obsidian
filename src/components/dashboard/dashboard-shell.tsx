"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { PanelLeft, Plus } from "lucide-react";

import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createProjectAction } from "@/actions/project/project";
import type { User } from "@/types";

interface DashboardShellProps {
  user: Pick<User, "name" | "email" | "image">;
  children: React.ReactNode;
}

const CreateProjectDialogContext = createContext<(() => void) | null>(null);

/** Lets server-rendered descendants (e.g. the empty-state button in ProjectGrid) open the create-project dialog owned by this client shell. */
export function useOpenCreateProjectDialog() {
  const openDialog = useContext(CreateProjectDialogContext);

  if (!openDialog) {
    throw new Error(
      "useOpenCreateProjectDialog must be used within DashboardShell.",
    );
  }

  return openDialog;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const createProject = (input: { name: string; description: string }) => {
    setError(null);
    startTransition(async () => {
      try {
        await createProjectAction(input);
        setDialogOpen(false);
      } catch (creationError) {
        setError(
          creationError instanceof Error
            ? creationError.message
            : "Failed to create project.",
        );
      }
    });
  };

  return (
    <CreateProjectDialogContext.Provider value={() => setDialogOpen(true)}>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar user={user} />
        <main className="flex-1">
          <div className="flex w-full flex-col gap-6 px-6 py-6">
            <div className="flex items-center justify-between rounded-lg border bg-card/90 px-4 py-3 xl:hidden">
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
                    <DashboardSidebar user={user} forceVisible />
                  </SheetContent>
                </Sheet>
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                  <Plus className="size-4" />
                  Project
                </Button>
              </div>
            </div>

            {children}
          </div>

          <CreateProjectDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onCreateProject={createProject}
            isSubmitting={isPending}
            error={error}
          />
        </main>
      </div>
    </CreateProjectDialogContext.Provider>
  );
}
