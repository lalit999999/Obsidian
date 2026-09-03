"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LogOut, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface DashboardSidebarProps {
  user: User;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 shrink-0 flex-col border-r bg-sidebar/70 backdrop-blur xl:flex">
      <div className="border-b px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            O
          </span>
          <div>
            <p className="font-semibold">Obsidian AI</p>
            <p className="text-xs text-muted-foreground">Frontend MVP</p>
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
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="mt-3 w-full justify-start text-muted-foreground"
          disabled
        >
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
// Create the dashboard navigation sidebar.
//
// Navigation items:
// - Dashboard
// - Profile
//
// Include:
// - Application logo/name.
// - Navigation links with icons.
// - User profile preview near the bottom.
// - Logout button as a frontend-only visual action.
//
// Requirements:
// - Highlight the active route.
// - Make the sidebar responsive.
// - On mobile, it can collapse or use a Sheet component.
//
// Use shadcn/ui components where appropriate.
// Use Lucide icons.
//
// Design:
// - Neutral sidebar.
// - Pink accent for the active item.
