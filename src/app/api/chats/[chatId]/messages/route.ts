import { NextRequest } from "next/server";

import { generateChatResponse } from "@/actions/ai/chat";
import { requireCurrentUser } from "@/lib/auth";
import { handleRouteError, jsonError, jsonSuccess } from "@/lib/http";
import { checkAiRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { parseChatMessageInput } from "@/lib/validations";
import { serializeMessage } from "@/lib/serializers";

interface RouteParams {
  params: Promise<{ chatId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { chatId } = await params;
    const currentUser = await requireCurrentUser();
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId: currentUser.id },
      include: { project: true },
    });

    if (!chat || chat.project?.userId !== currentUser.id) {
      return jsonError("Chat not found.", 404, "NOT_FOUND");
    }

    const rateLimit = checkAiRateLimit(currentUser.id);
    if (!rateLimit.allowed) {
      return jsonError(
        "Rate limit exceeded. Please try again later.",
        429,
        "RATE_LIMITED",
      );
    }

    const body = await request.json();
    const { content } = parseChatMessageInput(body);

    const userMessageRecord = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "USER",
        content,
      },
    });

    const aiResult = await generateChatResponse({
      userId: currentUser.id,
      projectId: chat.projectId,
      chatId: chat.id,
      question: content,
    });

    const assistantMessageRecord = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "ASSISTANT",
        content: aiResult.answer,
        sources: aiResult.sources,
      },
    });

    if (chat.title === "New chat") {
      await prisma.chat.update({
        where: { id: chat.id },
        data: { title: content.slice(0, 120) },
      });
    }

    return jsonSuccess({
      userMessage: serializeMessage(userMessageRecord),
      assistantMessage: serializeMessage(assistantMessageRecord),
      sources: aiResult.sources,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
