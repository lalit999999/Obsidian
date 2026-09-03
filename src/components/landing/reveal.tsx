"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in milliseconds, applied once the section enters view. */
  delayMs?: number;
  /** Direction the content slides in from. */
  from?: "up" | "left" | "right";
  /** Element type to render (defaults to "div"). Use "li" inside a list, for example. */
  as?: ElementType;
}

const HIDDEN_TRANSFORM: Record<NonNullable<RevealProps["from"]>, string> = {
  up: "translate-y-4",
  left: "-translate-x-4",
  right: "translate-x-4",
};

export function Reveal({
  children,
  className,
  delayMs = 0,
  from = "up",
  as: Component = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none",
        visible
          ? "translate-x-0 translate-y-0 opacity-100"
          : cn("opacity-0", HIDDEN_TRANSFORM[from]),
        className,
      )}
    >
      {children}
    </Component>
  );
}
