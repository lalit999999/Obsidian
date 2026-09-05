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
import { sourceTypeForKind } from "@/lib/sources/registry";
import { SOURCE_KINDS, type SourceKind } from "@/types";

interface LibraryTypePageProps {
  params: Promise<{ sourceKind: string }>;
}

function isSourceKind(value: string): value is SourceKind {
  return (SOURCE_KINDS as readonly string[]).includes(value);
}

export default async function LibraryTypePage({
  params,
}: LibraryTypePageProps) {
  const { sourceKind: rawSourceKind } = await params;

  if (!isSourceKind(rawSourceKind)) {
    notFound();
  }

  const currentUser = await requireCurrentUser();
  const sourceType = sourceTypeForKind(rawSourceKind);

  const count = await prisma.document.count({
    where: {
      userId: currentUser.id,
      deletedAt: null,
      project: { deletedAt: null },
      sourceKind: rawSourceKind,
    },
  });

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
                <BreadcrumbPage>{sourceType.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {sourceType.label}
            </h1>
            <p className="text-sm text-muted-foreground">
              {count} {count === 1 ? "document" : "documents"}
            </p>
          </div>

          <LibraryDocumentGrid sourceKind={rawSourceKind} />
        </div>
      </main>
    </div>
  );
}
