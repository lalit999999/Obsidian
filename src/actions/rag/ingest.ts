import { chunkPages, chunkText } from "@/lib/rag/chunker";
import { generateEmbeddings } from "@/lib/rag/embeddings";
import { parseDocumentContent } from "@/lib/rag/parser";
import { storeDocumentVectors } from "@/lib/rag/qdrant-store";
import type { IngestionInput, IngestionResult, TextChunk } from "@/types/rag";

export async function ingestDocument({
  documentId,
  projectId,
  userId,
  fileName,
  sourceKind,
  content,
  pages,
}: IngestionInput): Promise<IngestionResult> {
  if (!documentId || typeof documentId !== "string") {
    throw new Error("A valid documentId is required.");
  }

  if (!projectId || typeof projectId !== "string") {
    throw new Error("A valid projectId is required.");
  }

  if (!userId || typeof userId !== "string") {
    throw new Error("A valid userId is required.");
  }

  if (!fileName || typeof fileName !== "string") {
    throw new Error("A valid fileName is required.");
  }

  if (typeof content !== "string") {
    throw new Error("Document content must be a string.");
  }

  let chunks: TextChunk[];
  if (pages && pages.length > 0) {
    chunks = chunkPages(pages.map((page) => parseDocumentContent(page)));
  } else {
    chunks = chunkText(parseDocumentContent(content));
  }

  if (chunks.length === 0) {
    throw new Error("Chunking produced no sections for ingestion.");
  }

  const texts = chunks.map((chunk) => chunk.content);
  const embeddings = await generateEmbeddings(texts);

  if (embeddings.length !== chunks.length) {
    throw new Error(
      `Embedding count mismatch: expected ${chunks.length} but received ${embeddings.length}.`,
    );
  }

  await storeDocumentVectors({
    embeddings,
    chunks,
    metadata: {
      userId,
      projectId,
      documentId,
      fileName,
      sourceKind,
    },
  });

  return {
    documentId,
    chunkCount: chunks.length,
  };
}
