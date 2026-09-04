import { ensureKnowledgeBaseCollection } from "@/lib/rag/collection";
import { RAG_DEFAULT_RETRIEVAL_LIMIT } from "@/lib/rag/constants";
import { generateEmbeddings } from "@/lib/rag/embeddings";
import { searchSimilarChunks } from "@/lib/rag/qdrant-store";
import type { RetrievedChunkResult, RetrievalInput } from "@/types/rag";

export async function retrieveRelevantChunks({
  query,
  userId,
  projectId,
  limit = RAG_DEFAULT_RETRIEVAL_LIMIT,
}: RetrievalInput): Promise<RetrievedChunkResult[]> {
  if (typeof query !== "string") {
    throw new Error("Query must be a string.");
  }

  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    throw new Error("Query cannot be empty.");
  }

  if (!userId || typeof userId !== "string") {
    throw new Error("A valid userId is required.");
  }

  if (!projectId || typeof projectId !== "string") {
    throw new Error("A valid projectId is required.");
  }

  await ensureKnowledgeBaseCollection();

  const [queryEmbedding] = await generateEmbeddings([trimmedQuery]);

  return searchSimilarChunks({
    queryEmbedding,
    userId,
    projectId,
    limit,
  });
}
