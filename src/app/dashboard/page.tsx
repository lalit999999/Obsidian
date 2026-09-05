import { Suspense } from "react";

import { DashboardIntro } from "@/components/dashboard/dashboard-intro";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProjectGrid } from "@/components/dashboard/project-grid";
import { ProjectGridSkeleton } from "@/components/dashboard/project-grid-skeleton";
import { requireCurrentUser, type CurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeProject } from "@/lib/serializers";

async function DashboardContent({ user }: { user: CurrentUser }) {
  const projects = await prisma.project.findMany({
    where: { userId: user.id, deletedAt: null },
    include: { _count: { select: { documents: true, chats: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const serializedProjects = projects.map(serializeProject);

  const statistics = {
    totalProjects: serializedProjects.length,
    totalDocuments: serializedProjects.reduce(
      (sum, project) => sum + project.documentCount,
      0,
    ),
    totalChats: serializedProjects.reduce(
      (sum, project) => sum + project.chatCount,
      0,
    ),
  };

  return (
    <>
      <DashboardIntro user={user} statistics={statistics} />
      <ProjectGrid projects={serializedProjects} />
    </>
  );
}

export default async function DashboardPage() {
  const currentUser = await requireCurrentUser();

  return (
    <DashboardShell user={currentUser}>
      <Suspense fallback={<ProjectGridSkeleton />}>
        <DashboardContent user={currentUser} />
      </Suspense>
    </DashboardShell>
  );
}
