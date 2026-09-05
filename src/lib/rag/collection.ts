import { qdrantClient } from "@/lib/qdrant";
import { RAG_COLLECTION_NAME, RAG_EMBEDDING_MODEL } from "@/lib/rag/constants";
import { getEmbeddingDimensions } from "@/lib/rag/embeddings";

const PAYLOAD_INDEX_FIELDS = ["userId", "projectId", "documentId"] as const;

let ensured: Promise<void> | null = null;

async function ensurePayloadIndexes(): Promise<void> {
  for (const field_name of PAYLOAD_INDEX_FIELDS) {
    try {
      await qdrantClient.createPayloadIndex(RAG_COLLECTION_NAME, {
        field_name,
        field_schema: "keyword",
        wait: true,
      });
    } catch (error) {
      console.warn(`[qdrant] failed to ensure payload index on ${field_name}:`, error);
    }
  }
}

export async function ensureKnowledgeBaseCollection(): Promise<void> {
  if (ensured) {
    return ensured;
  }

  ensured = (async () => {
    const exists = await qdrantClient.collectionExists(RAG_COLLECTION_NAME);

    if (!exists.exists) {
      const vectorSize = getEmbeddingDimensions(RAG_EMBEDDING_MODEL);

      await qdrantClient.createCollection(RAG_COLLECTION_NAME, {
        vectors: {
          size: vectorSize,
          distance: "Cosine",
        },
      });
    }

    await ensurePayloadIndexes();
  })();

  try {
    await ensured;
  } catch (error) {
    // Don't cache a failed attempt - let the next call retry from scratch.
    ensured = null;
    throw error;
  }
}
