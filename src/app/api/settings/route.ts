import { NextRequest } from "next/server";

import { requireCurrentUser } from "@/lib/auth";
import { handleRouteError, jsonSuccess } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getUserSettings, updateUserSettings } from "@/lib/settings";
import { parseUpdateSettingsInput } from "@/lib/validations";
import type { UserUsage } from "@/types/library";

export async function GET() {
  try {
    const currentUser = await requireCurrentUser();

    const [settings, totalProjects, totalDocuments, totalChats, sizeAgg] =
      await Promise.all([
        getUserSettings(currentUser.id),
        prisma.project.count({
          where: { userId: currentUser.id, deletedAt: null },
        }),
        prisma.document.count({
          where: { userId: currentUser.id, deletedAt: null },
        }),
        prisma.chat.count({ where: { userId: currentUser.id } }),
        prisma.document.aggregate({
          where: { userId: currentUser.id, deletedAt: null },
          _sum: { fileSize: true },
        }),
      ]);

    const usage: UserUsage = {
      totalProjects,
      totalDocuments,
      totalChats,
      totalBytes: sizeAgg._sum.fileSize ?? 0,
    };

    return jsonSuccess({ settings, usage });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await requireCurrentUser();
    const body = await request.json();
    const input = parseUpdateSettingsInput(body);
    const settings = await updateUserSettings(currentUser.id, input);

    return jsonSuccess({ settings });
  } catch (error) {
    return handleRouteError(error);
  }
}
