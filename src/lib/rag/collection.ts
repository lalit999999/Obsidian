import { qdrantClient } from "@/lib/qdrant";
import { RAG_COLLECTION_NAME, RAG_EMBEDDING_MODEL } from "@/lib/rag/constants";
import { getEmbeddingDimensions } from "@/lib/rag/embeddings";

export async function ensureKnowledgeBaseCollection(): Promise<void> {
  const exists = await qdrantClient.collectionExists(RAG_COLLECTION_NAME);

  if (exists.exists) {
    return;
  }

  const vectorSize = getEmbeddingDimensions(RAG_EMBEDDING_MODEL);

  await qdrantClient.createCollection(RAG_COLLECTION_NAME, {
    vectors: {
      size: vectorSize,
      distance: "Cosine",
    },
  });
}
