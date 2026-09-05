"use client";

import Link from "next/link";

import { SITE } from "@/lib/site";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "/help", label: "Help" },
  { href: "/login", label: "Sign in" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <p className="font-display text-lg">{SITE.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {SITE.description}
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground"
          >
            {links.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            {SITE.SOCIAL_LINKS.map((social) => {
              const SocialIcon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/10 hover:text-foreground"
                >
                  <SocialIcon size={16} weight="regular" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          © 2026 {SITE.name}
        </div>
      </div>
    </footer>
  );
}
