import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AppSidebarProps {
  brand: ReactNode;
  navigation: ReactNode;
  footer: ReactNode;
  className?: string;
}

export function AppSidebar({
  brand,
  navigation,
  footer,
  className,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden h-full w-72 flex-col border-r bg-sidebar/80 backdrop-blur lg:flex",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b px-5 py-5">{brand}</div>
      <div className="flex-1 overflow-y-auto px-3 py-4">{navigation}</div>
      <div className="border-t px-4 py-4">{footer}</div>
    </aside>
  );
}
// Create a reusable application sidebar shell.
//
// This component can be used as a generic wrapper
// around sidebar navigation.
//
// Requirements:
// - Support logo area.
// - Support navigation content.
// - Support bottom user/account section.
// - Be responsive.
//
// Important:
// - Use this only if it reduces duplication between
//   DashboardSidebar and other application layouts.
// - Do not over-engineer it.
