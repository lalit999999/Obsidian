import { generateKnowledgeAnswer } from "@/actions/ai/agent";
import { formatRetrievedChunks } from "@/actions/ai/prompts";
import { retrieveRelevantChunks } from "@/actions/rag/retrieve";
import type { ChatMessageSource } from "@/types/chat";

export interface GenerateChatResponseInput {
  userId: string;
  projectId: string;
  chatId: string;
  question: string;
  documentIds?: string[];
}

export interface GenerateChatResponseResult {
  answer: string;
  sources: ChatMessageSource[];
  context: string;
}

export async function generateChatResponse({
  userId,
  projectId,
  chatId,
  question,
  documentIds,
}: GenerateChatResponseInput): Promise<GenerateChatResponseResult> {
  const relevantChunks = await retrieveRelevantChunks({
    query: question,
    userId,
    projectId,
    documentIds,
  });

  const context = formatRetrievedChunks(relevantChunks);
  const isScoped = Boolean(documentIds && documentIds.length > 0);
  const assistantResult = await generateKnowledgeAnswer({
    question,
    context,
    isScoped,
    scopedSourceCount: documentIds?.length ?? 0,
  });

  return {
    answer: assistantResult.answer,
    context,
    sources: relevantChunks.map((chunk) => ({
      documentId: chunk.documentId,
      fileName: chunk.fileName,
      chunkIndex: chunk.chunkIndex,
      score: chunk.score,
    })),
  };
}
