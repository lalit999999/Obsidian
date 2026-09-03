"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LogOut, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/actions/auth/sign-out";
import type { User } from "@/types";

interface DashboardSidebarProps {
  user: Pick<User, "name" | "email" | "image">;
  /** Render as a flex column regardless of viewport, for use inside a mobile Sheet. */
  forceVisible?: boolean;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function DashboardSidebar({ user, forceVisible }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen w-72 shrink-0 flex-col border-r bg-sidebar/70 backdrop-blur",
        forceVisible ? "flex" : "hidden xl:flex",
      )}
    >
      <div className="border-b px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            O
          </span>
          <div>
            <p className="font-semibold">Obsidian AI</p>
            <p className="text-xs text-muted-foreground">Knowledge workspace</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-3xl border bg-background p-3">
          <Avatar className="size-11">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? user.email} />
            <AvatarFallback>
              {(user.name ?? user.email).slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user.name ?? user.email}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="mt-3 w-full justify-start text-muted-foreground"
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </form>
      </div>
    </aside>
  );
}
