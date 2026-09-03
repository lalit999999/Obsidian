import { generateKnowledgeAnswer } from "@/actions/ai/agent";
import { formatRetrievedChunks } from "@/actions/ai/prompts";
import { retrieveRelevantChunks } from "@/actions/rag/retrieve";
import type { ChatMessageSource } from "@/types/chat";

export interface GenerateChatResponseInput {
  userId: string;
  projectId: string;
  chatId: string;
  question: string;
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
}: GenerateChatResponseInput): Promise<GenerateChatResponseResult> {
  const relevantChunks = await retrieveRelevantChunks({
    query: question,
    userId,
    projectId,
  });

  const context = formatRetrievedChunks(relevantChunks);
  const assistantResult = await generateKnowledgeAnswer({
    question,
    context,
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
