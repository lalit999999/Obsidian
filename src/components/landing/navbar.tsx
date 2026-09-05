"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#cta", label: "Start" },
  { href: "/help", label: "Help" },
];

interface NavbarProps {
  isSignedIn?: boolean;
}

const FLOAT_THRESHOLD_PX = 80;

export function Navbar({ isSignedIn = false }: NavbarProps) {
  const [floating, setFloating] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progressScaleX = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => setFloating(window.scrollY > FLOAT_THRESHOLD_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = links
      .map((link) => document.querySelector(link.href))
      .filter((el): el is Element => Boolean(el));

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (mostVisible) {
          setActiveHref(`#${mostVisible.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const layoutTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 300, damping: 30 };

  return (
    <motion.header
      layout
      transition={layoutTransition}
      className={cn(
        "fixed inset-x-0 z-40",
        floating
          ? "top-4 mx-auto w-[calc(100%-2rem)] max-w-3xl rounded-full border bg-background/70 shadow-lg shadow-black/6 backdrop-blur-xl"
          : "top-0 w-full border-b border-transparent bg-transparent",
      )}
    >
      <div
        className={cn(
          "mx-auto flex items-center justify-between px-4 transition-[padding,height] duration-300",
          floating
            ? "h-12"
            : "h-16 max-w-7xl sm:px-6 lg:px-8",
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="flex size-7 items-center justify-center rounded-md border border-primary bg-primary/10 text-sm font-semibold text-primary">
            O
          </span>
          <span className={floating ? "hidden sm:inline" : undefined}>
            Obsidian
          </span>
        </Link>

        <nav
          aria-label="Section"
          className="hidden items-center gap-1 text-sm md:flex"
        >
          {links.map((link) => {
            const active = activeHref === link.href;
            const className = cn(
              "relative rounded-full px-3 py-1.5 transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            );
            const content = (
              <>
                {active ? (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-muted"
                    transition={layoutTransition}
                  />
                ) : null}
                <span className="relative">{link.label}</span>
              </>
            );

            return link.href.startsWith("#") ? (
              <a key={link.href} href={link.href} className={className}>
                {content}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className={className}>
                {content}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ModeToggle />
          {isSignedIn ? (
            <Button size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon-sm">
                <Menu className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,100vw)]">
              <SheetHeader>
                <SheetTitle>Obsidian</SheetTitle>
              </SheetHeader>
              <nav aria-label="Section" className="mt-4 flex flex-col gap-1 px-6">
                {links.map((link) =>
                  link.href.startsWith("#") ? (
                    <a
                      key={link.href}
                      href={link.href}
                      className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </nav>
              <div className="mt-4 flex flex-col gap-2 px-6">
                {isSignedIn ? (
                  <Button asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline">
                    <Link href="/login">Sign in</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div
        className={cn(
          "absolute bottom-0 h-0.5 overflow-hidden",
          floating ? "inset-x-3 rounded-full bg-border/50" : "inset-x-0 bg-transparent",
        )}
      >
        <motion.div
          className="h-full origin-left bg-primary"
          style={{ scaleX: progressScaleX }}
        />
      </div>
    </motion.header>
  );
}
