import { NextRequest } from "next/server";

import { createProjectAction } from "@/actions/project/project";
import { requireCurrentUser } from "@/lib/auth";
import { handleRouteError, jsonError, jsonSuccess } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeProject } from "@/lib/serializers";

export async function GET() {
  try {
    const currentUser = await requireCurrentUser();
    const projects = await prisma.project.findMany({
      where: { userId: currentUser.id, deletedAt: null },
      include: { _count: { select: { documents: true, chats: true } } },
    });

    return jsonSuccess({ projects: projects.map(serializeProject) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const project = await createProjectAction(body);

    return jsonSuccess({
      project: serializeProject({
        ...project,
        _count: { documents: 0, chats: 0 },
      }),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
