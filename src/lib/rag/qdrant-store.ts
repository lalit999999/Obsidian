import { qdrantClient } from "@/lib/qdrant";
import {
  RAG_COLLECTION_NAME,
  RAG_DEFAULT_RETRIEVAL_LIMIT,
} from "@/lib/rag/constants";
import { ensureKnowledgeBaseCollection } from "@/lib/rag/collection";
import type {
  RetrievedChunkResult,
  SearchSimilarChunksInput,
  StoreDocumentVectorsInput,
  TextChunk,
} from "@/types/rag";

export function buildDocumentPointId(
  documentId: string,
  chunkIndex: number,
): string {
  return `${documentId}:${chunkIndex}`;
}

export async function storeDocumentVectors({
  embeddings,
  chunks,
  metadata,
}: StoreDocumentVectorsInput): Promise<void> {
  if (!Array.isArray(embeddings) || !Array.isArray(chunks)) {
    throw new Error("Embeddings and chunks must be provided as arrays.");
  }

  if (embeddings.length !== chunks.length) {
    throw new Error(
      `Embedding and chunk count mismatch: ${embeddings.length} embeddings vs ${chunks.length} chunks.`,
    );
  }

  if (chunks.length === 0) {
    throw new Error("No chunks were provided for vector storage.");
  }

  await ensureKnowledgeBaseCollection();

  const points = chunks.map((chunk: TextChunk, index: number) => {
    const embedding = embeddings[index];

    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error(`Embedding for chunk ${index} is empty or invalid.`);
    }

    return {
      id: buildDocumentPointId(metadata.documentId, chunk.chunkIndex),
      vector: embedding,
      payload: {
        userId: metadata.userId,
        projectId: metadata.projectId,
        documentId: metadata.documentId,
        fileName: metadata.fileName,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
      },
    };
  });

  await qdrantClient.upsert(RAG_COLLECTION_NAME, {
    wait: true,
    points,
  });
}

export async function searchSimilarChunks({
  queryEmbedding,
  userId,
  projectId,
  limit = RAG_DEFAULT_RETRIEVAL_LIMIT,
}: SearchSimilarChunksInput): Promise<RetrievedChunkResult[]> {
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    throw new Error("A valid query embedding is required.");
  }

  if (!userId || !projectId) {
    throw new Error("userId and projectId are required for retrieval.");
  }

  const response = await qdrantClient.query(RAG_COLLECTION_NAME, {
    query: queryEmbedding,
    limit,
    with_payload: true,
    filter: {
      must: [
        { key: "userId", match: { value: userId } },
        { key: "projectId", match: { value: projectId } },
      ],
    },
  });

  return response.points.map((point) => {
    const payload = point.payload as Record<string, unknown> | undefined;

    return {
      content: String(payload?.content ?? ""),
      score: Number(point.score ?? 0),
      documentId: String(payload?.documentId ?? ""),
      fileName: String(payload?.fileName ?? ""),
      chunkIndex: Number(payload?.chunkIndex ?? 0),
    };
  });
}

export async function deleteDocumentVectors(documentId: string): Promise<void> {
  if (!documentId || typeof documentId !== "string") {
    throw new Error(
      "A valid documentId is required to delete document vectors.",
    );
  }

  await qdrantClient.delete(RAG_COLLECTION_NAME, {
    filter: {
      must: [{ key: "documentId", match: { value: documentId } }],
    },
    wait: true,
  });
}
