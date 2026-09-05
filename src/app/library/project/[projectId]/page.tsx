import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { LibraryDocumentGrid } from "@/components/library/library-document-grid";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface LibraryProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function LibraryProjectPage({
  params,
}: LibraryProjectPageProps) {
  const { projectId } = await params;
  const currentUser = await requireCurrentUser();

  const [project, count] = await Promise.all([
    prisma.project.findFirst({
      where: { id: projectId, userId: currentUser.id, deletedAt: null },
      select: { name: true },
    }),
    prisma.document.count({
      where: { projectId, userId: currentUser.id, deletedAt: null },
    }),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar user={currentUser} />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/library">Library</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{project.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {project.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {count} {count === 1 ? "document" : "documents"}
            </p>
          </div>

          <LibraryDocumentGrid projectId={projectId} />
        </div>
      </main>
    </div>
  );
}
