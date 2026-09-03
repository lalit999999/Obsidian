"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DashboardPageHeaderProps {
  onCreateProject: () => void;
}

export function DashboardHeader({ onCreateProject }: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Your knowledge projects
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Create projects, organize uploaded notes, and open chats that help you
          find answers fast.
        </p>
      </div>
      <Button onClick={onCreateProject}>
        <Plus className="size-4" />
        Create project
      </Button>
    </div>
  );
}
// Create the dashboard top header.
//
// Include:
// - Page title.
// - Short subtitle or breadcrumb if useful.
// - Create Project button.
//
// Requirements:
// - The Create Project button should trigger the
//   CreateProjectDialog.
// - Make the header responsive.
// - Use shadcn Button.
//
// Note:
// Keep state ownership simple. The parent page may control
// the dialog open state.
