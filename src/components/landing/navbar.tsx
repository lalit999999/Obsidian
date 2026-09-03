"use client";

import Link from "next/link";
import { Menu, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
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

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <Sparkles className="size-4" />
          </span>
          <span>Obsidian AI</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Get started</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon-sm" className="md:hidden">
              <Menu className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(22rem,100vw)]">
            <SheetHeader>
              <SheetTitle>Obsidian AI</SheetTitle>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  {link.label}
                </a>
              ))}
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Get started</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
// Create the landing page navigation bar.
//
// Requirements:
// - Add the application logo/name on the left.
// - Add navigation links for the landing page sections.
// - Add Login and Get Started actions on the right.
// - Use shadcn Button components.
// - The Get Started button should navigate to /login.
// - Make the navbar responsive.
// - On smaller screens, use a simple mobile navigation solution.
//
// Design:
// - Clean, minimal, modern.
// - Pink should be used for the primary action.
// - Keep the navbar consistent with the rest of the application.
