import type { RetrievedChunkResult } from "@/types/rag";

export const KNOWLEDGE_ASSISTANT_SYSTEM_PROMPT = `You are Obsidian AI, a focused knowledge assistant for uploaded project documents.

Use only the supplied context when answering. If the answer is not present in the provided material, say so clearly and briefly explain what was missing.

Rules:
- Answer directly and concisely.
- Do not invent details or claim unsupported facts.
- Prefer citations to the provided context when useful.
- If the context is insufficient, say that the uploaded knowledge base does not contain the answer.`;

export function formatRetrievedChunks(chunks: RetrievedChunkResult[]): string {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return "No relevant context was retrieved.";
  }

  return chunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1}]\nFile: ${chunk.fileName}\nChunk: ${chunk.chunkIndex}\nScore: ${chunk.score.toFixed(4)}\n\n${chunk.content}`,
    )
    .join("\n\n----------------\n\n");
}

export function buildKnowledgeAssistantMessages({
  question,
  context,
}: {
  question: string;
  context: string;
}) {
  return [
    {
      role: "system" as const,
      content: KNOWLEDGE_ASSISTANT_SYSTEM_PROMPT,
    },
    {
      role: "user" as const,
      content: `Question:\n${question}\n\nRetrieved context:\n${context}`,
    },
  ];
}
