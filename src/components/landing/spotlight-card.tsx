"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}

export function SpotlightCard({
  children,
  className,
  as: Component = "div",
}: SpotlightCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--spotlight-x",
      `${event.clientX - rect.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--spotlight-y",
      `${event.clientY - rect.top}px`,
    );
  };

  return (
    <Component
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border/80 bg-card/60 transition-colors hover:border-primary/40",
        className,
      )}
    >
      {!shouldReduceMotion ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), color-mix(in oklch, var(--primary) 12%, transparent), transparent 70%)",
          }}
        />
      ) : null}
      <div className="relative">{children}</div>
    </Component>
  );
}
