import { NextRequest } from "next/server";

import { requireCurrentUser } from "@/lib/auth";
import { handleRouteError, jsonSuccess } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeLibraryDocument, toIsoString } from "@/lib/serializers";
import { parseLibraryQuery } from "@/lib/validations";
import { SOURCE_KINDS } from "@/types";
import type {
  LibraryDocumentPage,
  LibraryProjectGroup,
  LibraryTypeGroup,
} from "@/types/library";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireCurrentUser();
    const query = parseLibraryQuery(request.nextUrl.searchParams);

    if (query.groupBy === "type") {
      const groups = await prisma.document.groupBy({
        by: ["sourceKind"],
        where: {
          userId: currentUser.id,
          deletedAt: null,
          project: { deletedAt: null },
        },
        _count: true,
        _sum: { fileSize: true },
        _max: { createdAt: true },
      });

      const bySourceKind = new Map(groups.map((group) => [group.sourceKind, group]));

      const result: LibraryTypeGroup[] = SOURCE_KINDS.map((sourceKind) => {
        const group = bySourceKind.get(sourceKind);
        return {
          sourceKind,
          count: group?._count ?? 0,
          totalBytes: group?._sum.fileSize ?? 0,
          latestAt: group?._max.createdAt
            ? toIsoString(group._max.createdAt)
            : null,
        };
      });

      return jsonSuccess({ groups: result });
    }

    if (query.groupBy === "project") {
      const [projects, docGroups] = await Promise.all([
        prisma.project.findMany({
          where: { userId: currentUser.id, deletedAt: null },
          include: {
            _count: { select: { documents: { where: { deletedAt: null } } } },
          },
        }),
        prisma.document.groupBy({
          by: ["projectId"],
          where: {
            userId: currentUser.id,
            deletedAt: null,
            project: { deletedAt: null },
          },
          _sum: { fileSize: true },
          _max: { createdAt: true },
        }),
      ]);

      const byProjectId = new Map(docGroups.map((group) => [group.projectId, group]));

      const result: LibraryProjectGroup[] = projects
        .map((project) => {
          const group = byProjectId.get(project.id);
          return {
            projectId: project.id,
            projectName: project.name,
            count: project._count.documents,
            totalBytes: group?._sum.fileSize ?? 0,
            latestAt: group?._max.createdAt
              ? toIsoString(group._max.createdAt)
              : null,
          };
        })
        .sort((a, b) => {
          if (b.count !== a.count) {
            return b.count - a.count;
          }
          return a.projectName.localeCompare(b.projectName);
        });

      return jsonSuccess({ groups: result });
    }

    const documents = await prisma.document.findMany({
      where: {
        userId: currentUser.id,
        deletedAt: null,
        project: { deletedAt: null },
        ...(query.sourceKind ? { sourceKind: query.sourceKind } : {}),
        ...(query.projectId ? { projectId: query.projectId } : {}),
      },
      include: { project: { select: { name: true } } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: query.limit + 1,
      ...(query.cursor
        ? { cursor: { id: query.cursor }, skip: 1 }
        : {}),
    });

    const hasMore = documents.length > query.limit;
    const page = hasMore ? documents.slice(0, query.limit) : documents;

    const result: LibraryDocumentPage = {
      documents: page.map(serializeLibraryDocument),
      nextCursor: hasMore ? page[page.length - 1].id : null,
    };

    return jsonSuccess(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
