import { openaiClient } from "@/lib/openai";
import {
  RAG_EMBEDDING_BATCH_SIZE,
  RAG_EMBEDDING_DIMENSIONS,
  RAG_EMBEDDING_MODEL,
} from "@/lib/rag/constants";

export function getEmbeddingDimensions(
  modelName = RAG_EMBEDDING_MODEL,
): number {
  const dimensions = RAG_EMBEDDING_DIMENSIONS[modelName];

  if (!dimensions) {
    throw new Error(
      `Unsupported embedding model: ${modelName}. Add a vector dimension mapping in the RAG constants.`,
    );
  }

  return dimensions;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!Array.isArray(texts)) {
    throw new Error("Embedding input must be an array of strings.");
  }

  if (texts.length === 0) {
    throw new Error("No texts were provided for embedding generation.");
  }

  const validTexts = texts.map((text, index) => {
    if (typeof text !== "string") {
      throw new Error(`Text at index ${index} is not a string.`);
    }

    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error(
        `Text at index ${index} is empty and cannot be embedded.`,
      );
    }

    return trimmed;
  });

  const embeddings: number[][] = new Array(validTexts.length);

  for (let i = 0; i < validTexts.length; i += RAG_EMBEDDING_BATCH_SIZE) {
    const batch = validTexts.slice(i, i + RAG_EMBEDDING_BATCH_SIZE);

    try {
      const response = await openaiClient.embeddings.create({
        model: RAG_EMBEDDING_MODEL,
        input: batch,
      });

      const batchEmbeddings = response.data.map((item) => item.embedding);

      if (batchEmbeddings.length !== batch.length) {
        throw new Error(
          `Embedding batch mismatch: expected ${batch.length} embeddings but received ${batchEmbeddings.length}.`,
        );
      }

      for (let j = 0; j < batch.length; j += 1) {
        embeddings[i + j] = batchEmbeddings[j];
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown embedding generation error";
      throw new Error(
        `Failed to generate embeddings for batch ${i}: ${message}`,
      );
    }
  }

  return embeddings;
}
