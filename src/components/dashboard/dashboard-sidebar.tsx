"use client";

import { useId } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LibraryBig,
  LifeBuoy,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useResizablePanel } from "@/hooks/use-resizable-panel";
import { signOutAction } from "@/actions/auth/sign-out";
import type { User } from "@/types";

interface DashboardSidebarProps {
  user: Pick<User, "name" | "email" | "image">;
  /** Render as a flex column at full width regardless of viewport, for use inside a mobile Sheet. Resize/collapse is disabled in this mode. */
  forceVisible?: boolean;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/library", label: "Library", icon: LibraryBig },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: LifeBuoy },
];

const STORAGE_KEY = "obsidian:sidebar-width";
const MIN_WIDTH = 180;
const DEFAULT_WIDTH = 288;
const COLLAPSED_WIDTH = 64;
const MAX_WIDTH_RATIO = 0.4;

export function DashboardSidebar({ user, forceVisible }: DashboardSidebarProps) {
  const pathname = usePathname();
  const asideId = useId();

  const { effectiveWidth, collapsed, isDragging, elementRef, handleProps } =
    useResizablePanel<HTMLElement>({
      storageKey: STORAGE_KEY,
      edge: "right",
      defaultWidth: DEFAULT_WIDTH,
      minWidth: MIN_WIDTH,
      // No separate hard ceiling here — the viewport ratio below is the only cap.
      maxWidth: Number.POSITIVE_INFINITY,
      collapsedWidth: COLLAPSED_WIDTH,
      getMaxWidth: () => window.innerWidth * MAX_WIDTH_RATIO,
      ariaLabel: "Resize sidebar",
    });

  return (
    <>
      <aside
        id={forceVisible ? undefined : asideId}
        ref={forceVisible ? undefined : elementRef}
        style={forceVisible ? undefined : { width: effectiveWidth }}
        className={cn(
          "relative h-screen shrink-0 flex-col border-r bg-sidebar/70 backdrop-blur",
          forceVisible ? "flex w-full" : "hidden xl:flex",
          !forceVisible && !isDragging && "transition-[width] duration-150 ease-out",
        )}
      >
        <div className="flex items-center gap-3 border-b px-5 py-5">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              O
            </span>
            {collapsed && !forceVisible ? null : (
              <div className="min-w-0">
                <p className="truncate font-semibold">Obsidian AI</p>
                <p className="truncate text-xs text-muted-foreground">
                  Knowledge workspace
                </p>
              </div>
            )}
          </Link>
        </div>
        <nav className="flex-1 space-y-2 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const showLabel = forceVisible || !collapsed;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={showLabel ? undefined : item.label}
                className={cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  !showLabel && "justify-center px-0",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {active ? (
                  <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary" />
                ) : null}
                <Icon className="size-4 shrink-0" />
                {showLabel ? item.label : null}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg border bg-background p-3",
              !forceVisible && collapsed && "justify-center p-2",
            )}
          >
            <Avatar className="size-11 shrink-0">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? user.email} />
              <AvatarFallback>
                {(user.name ?? user.email).slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!forceVisible && collapsed ? null : (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {user.name ?? user.email}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="border-t p-3">
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="ghost"
              title={!forceVisible && collapsed ? "Logout" : undefined}
              className={cn(
                "w-full text-muted-foreground",
                !forceVisible && collapsed ? "justify-center px-0" : "justify-start",
              )}
            >
              <LogOut className="size-4 shrink-0" />
              {!forceVisible && collapsed ? null : "Logout"}
            </Button>
          </form>
        </div>

        {forceVisible ? null : (
          <div
            {...handleProps}
            className="absolute inset-y-0 -right-1 z-10 hidden w-2 cursor-col-resize touch-none select-none rounded-full outline-none hover:bg-primary/20 focus-visible:bg-primary/30 xl:block"
          />
        )}
      </aside>
      {!forceVisible && isDragging ? (
        <style>{"* { user-select: none !important; }"}</style>
      ) : null}
    </>
  );
}
