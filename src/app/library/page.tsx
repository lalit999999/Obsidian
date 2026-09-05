import { Suspense } from "react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { LibraryView } from "@/components/library/library-view";
import { LibraryViewSkeleton } from "@/components/library/library-view-skeleton";
import { requireCurrentUser } from "@/lib/auth";

export default async function LibraryPage() {
  const currentUser = await requireCurrentUser();

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar user={currentUser} />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
            <p className="text-sm text-muted-foreground">
              Every document across your projects, organized by type or by
              project.
            </p>
          </div>
          <Suspense fallback={<LibraryViewSkeleton />}>
            <LibraryView />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
