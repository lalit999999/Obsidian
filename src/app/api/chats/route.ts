import { NextRequest } from "next/server";

import { createChatAction } from "@/actions/chat/chat";
import { requireCurrentUser } from "@/lib/auth";
import { handleRouteError, jsonError, jsonSuccess } from "@/lib/http";
import { getOwnedProject } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { serializeChat } from "@/lib/serializers";

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get("projectId");

    if (!projectId) {
      return jsonError("projectId is required.", 400, "BAD_REQUEST");
    }

    const currentUser = await requireCurrentUser();
    await getOwnedProject(projectId, currentUser.id);

    const chats = await prisma.chat.findMany({
      where: { projectId, userId: currentUser.id },
      include: { _count: { select: { messages: true } } },
    });

    return jsonSuccess({
      chats: chats.map((chat) => ({
        ...serializeChat(chat),
        documentIds: chat.documentIds,
      })),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const chat = await createChatAction(body);

    return jsonSuccess(
      {
        chat: {
          ...serializeChat({ ...chat, _count: { messages: 0 } }),
          documentIds: chat.documentIds,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
