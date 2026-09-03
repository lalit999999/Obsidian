import { NextRequest } from "next/server";

import {
  deleteProjectAction,
  updateProjectAction,
} from "@/actions/project/project";
import { requireCurrentUser } from "@/lib/auth";
import { handleRouteError, jsonSuccess } from "@/lib/http";
import { getOwnedProject } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { parseUpdateProjectInput } from "@/lib/validations";
import { serializeProject } from "@/lib/serializers";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const currentUser = await requireCurrentUser();
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: currentUser.id },
      include: { _count: { select: { documents: true, chats: true } } },
    });

    if (!project) {
      return jsonSuccess({ project: null }, { status: 404 });
    }

    return jsonSuccess({ project: serializeProject(project) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const project = await updateProjectAction(projectId, body);

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

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    await deleteProjectAction(projectId);
    return jsonSuccess({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
