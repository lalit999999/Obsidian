import { RAG_CHUNK_OVERLAP, RAG_CHUNK_SIZE } from "@/lib/rag/constants";
import type { TextChunk } from "@/types/rag";

export function chunkText(
  content: string,
  chunkSize = RAG_CHUNK_SIZE,
  chunkOverlap = RAG_CHUNK_OVERLAP,
): TextChunk[] {
  if (typeof content !== "string") {
    throw new Error("Chunk content must be a string.");
  }

  if (chunkSize <= 0) {
    throw new Error("Chunk size must be greater than zero.");
  }

  if (chunkOverlap < 0) {
    throw new Error("Chunk overlap must be zero or greater.");
  }

  if (chunkOverlap >= chunkSize) {
    throw new Error("Chunk overlap must be smaller than the chunk size.");
  }

  const normalized = content.trim();
  if (!normalized) {
    throw new Error("Cannot chunk empty content.");
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    const slice = normalized.slice(start, end).trim();

    if (!slice) {
      start = end;
      continue;
    }

    chunks.push({ content: slice, chunkIndex });
    chunkIndex += 1;

    if (end >= normalized.length) {
      break;
    }

    const nextStart = end - chunkOverlap;
    start = nextStart > start ? nextStart : end;
  }

  if (chunks.length === 0) {
    throw new Error("Chunking produced no valid chunks.");
  }

  return chunks;
}
