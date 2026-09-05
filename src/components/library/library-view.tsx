"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LibraryGroupSection } from "./library-group-section";
import { LibraryProjectCard } from "./library-project-card";
import { LibraryTypeCard } from "./library-type-card";
import { useLibraryGroups } from "./use-library-groups";
import type { LibraryProjectGroup, LibraryTypeGroup } from "@/types/library";

type ViewMode = "type" | "project";

function isViewMode(value: string | null): value is ViewMode {
  return value === "type" || value === "project";
}

export function LibraryView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawView = searchParams.get("view");
  const view = isViewMode(rawView) ? rawView : "type";

  const setView = (next: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    router.replace(`/library?${params.toString()}`, { scroll: false });
  };

  const typeGroups = useLibraryGroups<LibraryTypeGroup>(
    "/api/documents?groupBy=type",
  );
  const projectGroups = useLibraryGroups<LibraryProjectGroup>(
    "/api/documents?groupBy=project",
  );

  return (
    <Tabs value={view} onValueChange={(value) => setView(value as ViewMode)}>
      <TabsList>
        <TabsTrigger value="type">By type</TabsTrigger>
        <TabsTrigger value="project">By project</TabsTrigger>
      </TabsList>
      <TabsContent value="type" className="pt-4">
        <LibraryGroupSection
          groups={typeGroups.groups}
          error={typeGroups.error}
          isLoading={typeGroups.isLoading}
          onRetry={typeGroups.reload}
          isEmpty={(groups) => groups.every((group) => group.count === 0)}
          emptyTitle="No documents yet"
          emptyDescription="Upload a source in one of your projects to see it here."
          getKey={(group) => group.sourceKind}
          renderCard={(group) => <LibraryTypeCard group={group} />}
        />
      </TabsContent>
      <TabsContent value="project" className="pt-4">
        <LibraryGroupSection
          groups={projectGroups.groups}
          error={projectGroups.error}
          isLoading={projectGroups.isLoading}
          onRetry={projectGroups.reload}
          isEmpty={(groups) => groups.length === 0}
          emptyTitle="No projects yet"
          emptyDescription="Create a project to start adding documents."
          getKey={(group) => group.projectId}
          renderCard={(group) => <LibraryProjectCard group={group} />}
        />
      </TabsContent>
    </Tabs>
  );
}
