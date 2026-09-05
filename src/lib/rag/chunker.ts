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

/**
 * Chunks each page independently (so a chunk never spans a page boundary)
 * while keeping chunkIndex sequential across the whole document.
 */
export function chunkPages(
  pages: string[],
  chunkSize = RAG_CHUNK_SIZE,
  chunkOverlap = RAG_CHUNK_OVERLAP,
): TextChunk[] {
  if (!Array.isArray(pages)) {
    throw new Error("Pages must be provided as an array.");
  }

  const chunks: TextChunk[] = [];
  let chunkIndex = 0;

  for (let pageNumber = 1; pageNumber <= pages.length; pageNumber += 1) {
    const pageText = pages[pageNumber - 1];
    if (typeof pageText !== "string" || !pageText.trim()) {
      continue;
    }

    let pageChunks: TextChunk[];
    try {
      pageChunks = chunkText(pageText, chunkSize, chunkOverlap);
    } catch {
      continue;
    }

    for (const chunk of pageChunks) {
      chunks.push({ content: chunk.content, chunkIndex, page: pageNumber });
      chunkIndex += 1;
    }
  }

  if (chunks.length === 0) {
    throw new Error("Chunking produced no valid chunks.");
  }

  return chunks;
}
