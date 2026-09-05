import { NextRequest } from "next/server";

import { generateChatResponse } from "@/actions/ai/chat";
import { requireCurrentUser } from "@/lib/auth";
import { handleRouteError, jsonError, jsonSuccess } from "@/lib/http";
import { checkAiRateLimit } from "@/lib/rate-limit";
import { prisma, type Prisma } from "@/lib/prisma";
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
      where: {
        id: chatId,
        userId: currentUser.id,
        project: { deletedAt: null },
      },
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
    const { content, documentIds: requestedDocumentIds } =
      parseChatMessageInput(body);

    // Resolution order per AGENTS.md C7: an explicit body value wins, else
    // fall back to the chat's persisted scope. Ids that no longer belong to
    // this user/project or aren't READY (a source can be deleted or still be
    // processing mid-conversation) are silently dropped — if that empties a
    // non-empty request, the resulting [] already means "whole project" per
    // the C6 filter semantics, so no separate fallback branch is needed.
    const requestedScope = requestedDocumentIds ?? chat.documentIds;
    let scopedDocumentIds: string[] = [];

    if (requestedScope.length > 0) {
      const validDocuments = await prisma.document.findMany({
        where: {
          id: { in: requestedScope },
          projectId: chat.projectId,
          userId: currentUser.id,
          status: "READY",
          deletedAt: null,
        },
        select: { id: true },
      });
      scopedDocumentIds = validDocuments.map((doc) => doc.id);
    }

    await prisma.chat.update({
      where: { id: chat.id },
      data: { documentIds: scopedDocumentIds },
    });

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
      documentIds: scopedDocumentIds,
    });

    const assistantMessageRecord = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "ASSISTANT",
        content: aiResult.answer,
        sources: aiResult.sources as unknown as Prisma.InputJsonValue,
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
      scopedDocumentIds,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
