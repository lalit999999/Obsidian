import { NextRequest } from "next/server";

import { deleteChatAction, renameChatAction } from "@/actions/chat/chat";
import { requireCurrentUser } from "@/lib/auth";
import { handleRouteError, jsonError, jsonSuccess } from "@/lib/http";
import { getOwnedChat } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { serializeChat, serializeMessage } from "@/lib/serializers";

interface RouteParams {
  params: Promise<{ chatId: string }>;
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { chatId } = await params;
    const currentUser = await requireCurrentUser();
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId: currentUser.id },
      include: {
        _count: { select: { messages: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!chat) {
      return jsonError("Chat not found.", 404, "NOT_FOUND");
    }

    return jsonSuccess({
      chat: {
        ...serializeChat(chat),
        messages: (chat.messages ?? []).map(serializeMessage),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { chatId } = await params;
    const body = await request.json();
    const chat = await renameChatAction(chatId, body);

    return jsonSuccess({
      chat: serializeChat({ ...chat, _count: { messages: 0 } }),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  try {
    const { chatId } = await params;
    await deleteChatAction(chatId);
    return jsonSuccess({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
