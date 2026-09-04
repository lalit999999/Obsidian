"use client";

import { useEffect, useState } from "react";
import { animate, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOpenCreateProjectDialog } from "@/components/dashboard/dashboard-shell";
import type { ProjectStatistics, User } from "@/types";

interface DashboardIntroProps {
  user: Pick<User, "name" | "email">;
  statistics: ProjectStatistics;
}

function AnimatedNumber({ value }: { value: number }) {
  const shouldReduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [display, setDisplay] = useState(shouldReduceMotion ? value : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplay(value);
      return;
    }

    const unsubscribe = rounded.on("change", (latest) => setDisplay(latest));
    const controls = animate(count, value, {
      duration: 0.8,
      ease: "easeOut",
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, shouldReduceMotion]);

  return <span>{display}</span>;
}

function firstNameOf(user: Pick<User, "name" | "email">) {
  const source = user.name?.trim() || user.email.split("@")[0];
  return source.split(/\s+/)[0];
}

export function DashboardIntro({ user, statistics }: DashboardIntroProps) {
  const openCreateDialog = useOpenCreateProjectDialog();

  const segments = [
    { label: "projects", value: statistics.totalProjects },
    { label: "documents", value: statistics.totalDocuments },
    { label: "chats", value: statistics.totalChats },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {firstNameOf(user)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&rsquo;s what&rsquo;s happening across your knowledge
            projects.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="sm:shrink-0">
          <Plus className="size-4" />
          Create project
        </Button>
      </div>

      <div className="flex h-16 items-stretch divide-x rounded-lg border bg-card/90">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="flex flex-1 flex-col items-center justify-center gap-0.5"
          >
            <span className="text-xl font-semibold tracking-tight">
              <AnimatedNumber value={segment.value} />
            </span>
            <span className="text-xs text-muted-foreground">
              {segment.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
