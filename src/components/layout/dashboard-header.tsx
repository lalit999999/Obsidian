import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface GenericDashboardHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function DashboardHeader({
  title,
  description,
  actions,
  className,
}: GenericDashboardHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
// Create a reusable generic dashboard header.
//
// Props:
// - title.
// - description.
// - optional actions.
//
// Requirements:
// - Use responsive layout.
// - Keep it presentation-focused.
//
// Note:
// Use this component where reuse makes sense.
// Do not force reuse if page-specific headers are clearer.
