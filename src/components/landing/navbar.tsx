"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
];

interface NavbarProps {
  isSignedIn?: boolean;
}

export function Navbar({ isSignedIn = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors",
        scrolled
          ? "border-b border-border bg-background/90 backdrop-blur"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="flex size-7 items-center justify-center rounded-md border border-primary bg-primary/10 text-sm font-semibold text-primary">
            O
          </span>
          <span>Obsidian</span>
        </Link>

        <nav aria-label="Section" className="hidden items-center gap-8 text-sm md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ModeToggle />
          {isSignedIn ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
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
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    {link.label}
                  </a>
                ))}
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
    </header>
  );
}
