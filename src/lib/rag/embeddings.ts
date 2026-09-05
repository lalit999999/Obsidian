import { openaiEmbeddingClient } from "@/lib/openai";
import {
  RAG_EMBEDDING_BATCH_SIZE,
  RAG_EMBEDDING_DIMENSIONS,
  RAG_EMBEDDING_MODEL,
} from "@/lib/rag/constants";

export function getEmbeddingDimensions(
  modelName = RAG_EMBEDDING_MODEL,
): number {
  const normalizedModelName = modelName.includes("/")
    ? modelName.slice(modelName.lastIndexOf("/") + 1)
    : modelName;
  const dimensions = RAG_EMBEDDING_DIMENSIONS[normalizedModelName];

  if (!dimensions) {
    throw new Error(
      `Unsupported embedding model: ${modelName}. Add a vector dimension mapping in the RAG constants.`,
    );
  }

  return dimensions;
}

function assertValidTexts(texts: string[]): string[] {
  if (!Array.isArray(texts)) {
    throw new Error("Embedding input must be an array of strings.");
  }

  if (texts.length === 0) {
    throw new Error("No texts were provided for embedding generation.");
  }

  return texts.map((text, index) => {
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
}

/**
 * Embeds a single batch in one API call, with no internal looping. Callers
 * that need to embed more than RAG_EMBEDDING_BATCH_SIZE texts at once and
 * want each batch independently retriable (e.g. an Inngest step per batch)
 * should call this directly instead of generateEmbeddings, which loops
 * batches internally and would defeat that independence.
 */
export async function generateEmbeddingBatch(
  texts: string[],
): Promise<number[][]> {
  const validTexts = assertValidTexts(texts);

  try {
    const response = await openaiEmbeddingClient.embeddings.create({
      model: RAG_EMBEDDING_MODEL,
      input: validTexts,
    });

    const batchEmbeddings = response.data.map((item) => item.embedding);

    if (batchEmbeddings.length !== validTexts.length) {
      throw new Error(
        `Embedding batch mismatch: expected ${validTexts.length} embeddings but received ${batchEmbeddings.length}.`,
      );
    }

    return batchEmbeddings;
  } catch (error) {
    console.error(
      "[openai] embeddings.create failed:",
      error instanceof Error && "error" in error
        ? (error as { error: unknown }).error
        : error,
    );
    const message =
      error instanceof Error ? error.message : "Unknown embedding generation error";
    throw new Error(`Failed to generate embeddings for batch: ${message}`);
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const validTexts = assertValidTexts(texts);
  const embeddings: number[][] = new Array(validTexts.length);

  for (let i = 0; i < validTexts.length; i += RAG_EMBEDDING_BATCH_SIZE) {
    const batch = validTexts.slice(i, i + RAG_EMBEDDING_BATCH_SIZE);
    const batchEmbeddings = await generateEmbeddingBatch(batch);

    for (let j = 0; j < batch.length; j += 1) {
      embeddings[i + j] = batchEmbeddings[j];
    }
  }

  return embeddings;
}
