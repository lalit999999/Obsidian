import { EMBEDDING_THROTTLE, PER_USER_INGEST_CONCURRENCY } from "@/inngest/concurrency";
import { inngest } from "@/inngest/client";
import { documentUploaded } from "@/inngest/events";
import { prisma } from "@/lib/prisma";
import { RAG_EMBEDDING_BATCH_SIZE } from "@/lib/rag/constants";
import { chunkText } from "@/lib/rag/chunker";
import { generateEmbeddingBatch } from "@/lib/rag/embeddings";
import { normalizeExtractedText } from "@/lib/rag/parser";
import { extractPdfText, RAG_MAX_EXTRACTED_TEXT_LENGTH } from "@/lib/rag/pdf";
import { storeDocumentVectors } from "@/lib/rag/qdrant-store";

export const ingestDocumentFunction = inngest.createFunction(
  {
    id: "ingest-document",
    concurrency: PER_USER_INGEST_CONCURRENCY,
    throttle: EMBEDDING_THROTTLE,
    retries: 3,
    triggers: [{ event: documentUploaded }],
    onFailure: async ({ event, error }) => {
      const { documentId } = event.data.event.data;

      await prisma.document.updateMany({
        where: { id: documentId },
        data: {
          status: "FAILED",
          error: error.message,
        },
      });
    },
  },
  async ({ event, step }) => {
    const { documentId } = event.data;

    const document = await step.run("mark-processing", async () => {
      return prisma.document.update({
        where: { id: documentId },
        data: {
          status: "PROCESSING",
          processingStartedAt: new Date(),
          ingestAttempts: { increment: 1 },
        },
      });
    });

    const extraction = await step.run("extract-text", async () => {
      const response = await fetch(document.cloudinaryUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch document asset: ${response.status}`,
        );
      }

      let text: string;
      let pageCount: number | null = null;
      let textTruncated = false;

      if (document.sourceKind === "PDF") {
        const buffer = await response.arrayBuffer();
        const extracted = await extractPdfText(buffer);
        text = normalizeExtractedText(extracted.text);
        pageCount = extracted.pageCount;
        textTruncated = extracted.truncated;
      } else {
        const raw = await response.text();
        const truncated = raw.length > RAG_MAX_EXTRACTED_TEXT_LENGTH;
        text = normalizeExtractedText(
          truncated ? raw.slice(0, RAG_MAX_EXTRACTED_TEXT_LENGTH) : raw,
        );
        textTruncated = truncated;
      }

      await prisma.document.update({
        where: { id: documentId },
        data: { extractedText: text, pageCount, textTruncated },
      });

      return { text, pageCount, textTruncated };
    });

    const chunks = chunkText(extraction.text);
    const texts = chunks.map((chunk) => chunk.content);
    const embeddings: number[][] = new Array(texts.length);

    for (let i = 0; i < texts.length; i += RAG_EMBEDDING_BATCH_SIZE) {
      const batch = texts.slice(i, i + RAG_EMBEDDING_BATCH_SIZE);
      const batchEmbeddings = await step.run(`embed-batch-${i}`, async () => {
        return generateEmbeddingBatch(batch);
      });

      for (let j = 0; j < batch.length; j += 1) {
        embeddings[i + j] = batchEmbeddings[j];
      }
    }

    await step.run("store-vectors", async () => {
      await storeDocumentVectors({
        embeddings,
        chunks,
        metadata: {
          userId: document.userId,
          projectId: document.projectId,
          documentId: document.id,
          fileName: document.fileName,
          sourceKind: document.sourceKind,
        },
      });
    });

    await step.run("finalize", async () => {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: "READY",
          chunkCount: chunks.length,
          processedAt: new Date(),
          error: null,
        },
      });
    });
  },
);
