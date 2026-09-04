"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
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
  /** Render as a flex column at full width regardless of viewport, for use inside a mobile Sheet. Resize/collapse is disabled in this mode. */
  forceVisible?: boolean;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: UserRound },
];

const STORAGE_KEY = "obsidian:sidebar-width";
const MIN_WIDTH = 180;
const DEFAULT_WIDTH = 288;
const COLLAPSED_WIDTH = 64;
const COLLAPSE_SNAP_THRESHOLD = MIN_WIDTH - 40;
const MAX_WIDTH_RATIO = 0.4;
const ARROW_KEY_STEP = 16;
const ARROW_KEY_STEP_LARGE = 40;

function clampWidth(width: number) {
  const maxWidth =
    typeof window !== "undefined"
      ? window.innerWidth * MAX_WIDTH_RATIO
      : DEFAULT_WIDTH * 2;
  return Math.min(Math.max(width, MIN_WIDTH), Math.max(maxWidth, MIN_WIDTH));
}

export function DashboardSidebar({ user, forceVisible }: DashboardSidebarProps) {
  const pathname = usePathname();
  const asideRef = useRef<HTMLElement>(null);
  const asideId = useId();
  const dragState = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(
    null,
  );

  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [collapsed, setCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (forceVisible) {
      return;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "collapsed") {
        setCollapsed(true);
      } else if (stored) {
        const parsed = Number(stored);
        if (!Number.isNaN(parsed)) {
          setWidth(clampWidth(parsed));
        }
      }
    } catch {
      // localStorage unavailable — fall back to the default width.
    }
  }, [forceVisible]);

  const persist = useCallback((next: { width: number } | { collapsed: true }) => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        "collapsed" in next ? "collapsed" : String(Math.round(next.width)),
      );
    } catch {
      // Ignore write failures (private browsing, storage full, etc.).
    }
  }, []);

  const applyWidth = useCallback((px: number) => {
    if (asideRef.current) {
      asideRef.current.style.width = `${px}px`;
    }
  }, []);

  const commitWidth = useCallback(
    (px: number) => {
      const clamped = clampWidth(px);
      setCollapsed(false);
      setWidth(clamped);
      applyWidth(clamped);
      persist({ width: clamped });
    },
    [applyWidth, persist],
  );

  const commitCollapsed = useCallback(() => {
    setCollapsed(true);
    applyWidth(COLLAPSED_WIDTH);
    persist({ collapsed: true });
  }, [applyWidth, persist]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: collapsed ? MIN_WIDTH : width,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId) {
      return;
    }

    const proposedWidth =
      dragState.current.startWidth + (event.clientX - dragState.current.startX);

    applyWidth(
      proposedWidth < COLLAPSE_SNAP_THRESHOLD
        ? COLLAPSED_WIDTH
        : clampWidth(proposedWidth),
    );
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId) {
      return;
    }

    const proposedWidth =
      dragState.current.startWidth + (event.clientX - dragState.current.startX);
    dragState.current = null;
    setIsDragging(false);

    if (proposedWidth < COLLAPSE_SNAP_THRESHOLD) {
      commitCollapsed();
    } else {
      commitWidth(proposedWidth);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? ARROW_KEY_STEP_LARGE : ARROW_KEY_STEP;
    const current = collapsed ? MIN_WIDTH : width;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const next = current - step;
      if (next < COLLAPSE_SNAP_THRESHOLD) {
        commitCollapsed();
      } else {
        commitWidth(next);
      }
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      commitWidth(current + step);
    }
  };

  const handleDoubleClick = () => {
    commitWidth(DEFAULT_WIDTH);
  };

  const effectiveWidth = collapsed ? COLLAPSED_WIDTH : width;

  return (
    <>
      <aside
        id={forceVisible ? undefined : asideId}
        ref={forceVisible ? undefined : asideRef}
        style={forceVisible ? undefined : { width: effectiveWidth }}
        className={cn(
          "relative h-screen shrink-0 flex-col border-r bg-sidebar/70 backdrop-blur",
          forceVisible ? "flex w-full" : "hidden xl:flex",
          !forceVisible && !isDragging && "transition-[width] duration-150 ease-out",
        )}
      >
        <div className="flex items-center gap-3 border-b px-5 py-5">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
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
            const active = pathname === item.href;
            const showLabel = forceVisible || !collapsed;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={showLabel ? undefined : item.label}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                  !showLabel && "justify-center px-0",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {showLabel ? item.label : null}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <div
            className={cn(
              "flex items-center gap-3 rounded-3xl border bg-background p-3",
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
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="ghost"
              title={!forceVisible && collapsed ? "Logout" : undefined}
              className={cn(
                "mt-3 w-full text-muted-foreground",
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
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            aria-valuenow={Math.round(effectiveWidth)}
            aria-valuemin={COLLAPSED_WIDTH}
            aria-valuemax={Math.round(
              typeof window === "undefined"
                ? DEFAULT_WIDTH * 2
                : window.innerWidth * MAX_WIDTH_RATIO,
            )}
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={handleKeyDown}
            onDoubleClick={handleDoubleClick}
            className="absolute inset-y-0 -right-1 z-10 hidden w-2 cursor-col-resize touch-none select-none rounded-full outline-none hover:bg-primary/20 focus-visible:bg-primary/30 xl:block"
          />
        )}
      </aside>
      {isDragging ? (
        <style>{"* { user-select: none !important; }"}</style>
      ) : null}
    </>
  );
}
