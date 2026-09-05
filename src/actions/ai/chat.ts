import { generateKnowledgeAnswer } from "@/actions/ai/agent";
import { formatRetrievedChunks } from "@/actions/ai/prompts";
import { retrieveRelevantChunks } from "@/actions/rag/retrieve";
import { prisma } from "@/lib/prisma";
import { HYDE_MAX_DOCUMENTS } from "@/lib/rag/constants";
import { buildHydeQuery, generateHypotheticalDocument } from "@/lib/rag/hyde";
import { getUserSettings } from "@/lib/settings";
import type { AnswerPayload, ChatMessageSource } from "@/types/chat";

export interface GenerateChatResponseInput {
  userId: string;
  projectId: string;
  chatId: string;
  question: string;
  documentIds?: string[];
}

export interface GenerateChatResponseResult {
  answer: string;
  blocks: AnswerPayload | null;
  sources: ChatMessageSource[];
  context: string;
  hydeUsed: boolean;
}

export async function generateChatResponse({
  userId,
  projectId,
  chatId,
  question,
  documentIds,
}: GenerateChatResponseInput): Promise<GenerateChatResponseResult> {
  const [project, documents, settings] = await Promise.all([
    prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { name: true },
    }),
    prisma.document.findMany({
      where: {
        projectId,
        userId,
        status: "READY",
        ...(documentIds && documentIds.length > 0
          ? { id: { in: documentIds } }
          : {}),
      },
      select: { fileName: true, sourceKind: true },
      orderBy: { createdAt: "desc" },
      take: HYDE_MAX_DOCUMENTS,
    }),
    getUserSettings(userId),
  ]);

  const hypothetical = settings.hydeEnabled
    ? await generateHypotheticalDocument({
        question,
        projectName: project?.name ?? "",
        documents,
      })
    : null;

  const relevantChunks = await retrieveRelevantChunks({
    query: buildHydeQuery(question, hypothetical),
    userId,
    projectId,
    documentIds,
    limit: settings.retrievalLimit,
  });

  const context = formatRetrievedChunks(relevantChunks);
  const isScoped = Boolean(documentIds && documentIds.length > 0);
  const assistantResult = await generateKnowledgeAnswer({
    question,
    context,
    isScoped,
    scopedSourceCount: documentIds?.length ?? 0,
    sources: relevantChunks,
  });

  return {
    answer: assistantResult.answer,
    blocks: assistantResult.blocks,
    context,
    sources: relevantChunks.map((chunk) => ({
      documentId: chunk.documentId,
      fileName: chunk.fileName,
      chunkIndex: chunk.chunkIndex,
      score: chunk.score,
    })),
    hydeUsed: Boolean(hypothetical),
  };
}
