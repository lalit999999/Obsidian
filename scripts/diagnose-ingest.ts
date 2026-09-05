/**
 * Obsidian ingest diagnostic.
 *
 * Place at: scripts/diagnose-ingest.ts
 * Run with: bunx tsx scripts/diagnose-ingest.ts
 *
 * Read-only. Prints the exact state of every document row, what Qdrant
 * actually holds for each one, and whether the embeddings provider answers
 * from this environment. This settles where the pipeline stops.
 */

import "dotenv/config";

import { prisma } from "../src/lib/prisma";
import { qdrantClient } from "../src/lib/qdrant";
import { RAG_COLLECTION_NAME, RAG_EMBEDDING_MODEL } from "../src/lib/rag/constants";
import { generateEmbeddingBatch } from "../src/lib/rag/embeddings";

function line() {
  console.log("─".repeat(72));
}

async function reportEnv() {
  line();
  console.log("ENVIRONMENT");
  line();
  console.log("embedding model      :", RAG_EMBEDDING_MODEL);
  console.log("OPENAI_BASE_URL      :", process.env.OPENAI_BASE_URL ?? "(unset → api.openai.com)");
  console.log(
    "OPENAI_EMBEDDING_BASE_URL:",
    process.env.OPENAI_EMBEDDING_BASE_URL ?? "(unset → api.openai.com)",
  );
  console.log("OPENAI_API_KEY       :", process.env.OPENAI_API_KEY ? "set" : "MISSING");
  console.log("QDRANT_URL           :", process.env.QDRANT_URL ?? "http://localhost:6333");
  console.log("INNGEST_EVENT_KEY    :", process.env.INNGEST_EVENT_KEY ? "set" : "(unset — dev mode)");
  console.log("INNGEST_SIGNING_KEY  :", process.env.INNGEST_SIGNING_KEY ? "set" : "(unset — dev mode)");
  console.log("INNGEST_BASE_URL     :", process.env.INNGEST_BASE_URL ?? "(unset)");
}

async function reportCollection() {
  line();
  console.log("QDRANT COLLECTION");
  line();
  try {
    const exists = await qdrantClient.collectionExists(RAG_COLLECTION_NAME);
    if (!exists.exists) {
      console.log(`collection "${RAG_COLLECTION_NAME}" DOES NOT EXIST`);
      return;
    }
    const info = await qdrantClient.getCollection(RAG_COLLECTION_NAME);
    console.log("points_count :", info.points_count);
    console.log("vector config:", JSON.stringify(info.config?.params?.vectors));
    console.log("payload idx  :", Object.keys(info.payload_schema ?? {}).join(", ") || "(none)");
  } catch (error) {
    console.log("FAILED to reach Qdrant:", (error as Error).message);
  }
}

async function reportDocuments() {
  line();
  console.log("DOCUMENTS (newest 15)");
  line();

  const documents = await prisma.document.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 15,
    select: {
      id: true,
      fileName: true,
      sourceKind: true,
      status: true,
      error: true,
      chunkCount: true,
      pageCount: true,
      ingestAttempts: true,
      processingStartedAt: true,
      processedAt: true,
      createdAt: true,
      extractedText: true,
    },
  });

  if (documents.length === 0) {
    console.log("(no documents)");
    return;
  }

  for (const doc of documents) {
    let qdrantPoints: number | string = "n/a";
    try {
      const counted = await qdrantClient.count(RAG_COLLECTION_NAME, {
        filter: { must: [{ key: "documentId", match: { value: doc.id } }] },
        exact: true,
      });
      qdrantPoints = counted.count;
    } catch (error) {
      qdrantPoints = `error: ${(error as Error).message}`;
    }

    const textLength = doc.extractedText?.length ?? 0;

    console.log("");
    console.log(`${doc.fileName}  [${doc.sourceKind}]`);
    console.log(`  id               : ${doc.id}`);
    console.log(`  status           : ${doc.status}`);
    console.log(`  error            : ${doc.error ?? "(none)"}`);
    console.log(`  extractedText len: ${textLength}`);
    console.log(`  pageCount        : ${doc.pageCount ?? "(null)"}`);
    console.log(`  chunkCount (db)  : ${doc.chunkCount}`);
    console.log(`  qdrant points    : ${qdrantPoints}`);
    console.log(`  ingestAttempts   : ${doc.ingestAttempts}`);
    console.log(`  createdAt        : ${doc.createdAt.toISOString()}`);
    console.log(
      `  processingStarted: ${doc.processingStartedAt?.toISOString() ?? "(never)"}`,
    );
    console.log(`  processedAt      : ${doc.processedAt?.toISOString() ?? "(never)"}`);

    // The decisive read: text extracted but nothing stored means the run
    // died between the extract step and the store step.
    if (textLength > 0 && qdrantPoints === 0) {
      console.log("  >> VERDICT: extraction succeeded, vectors never stored.");
      console.log("             Failure is in embed-batch-* or store-vectors.");
    }
    if (textLength === 0 && doc.status === "PENDING") {
      console.log("  >> VERDICT: the ingest job never ran for this document.");
      console.log("             inngest.send() did not reach a running Inngest server.");
    }
    if (doc.status === "PROCESSING") {
      console.log("  >> VERDICT: wedged mid-run. No clean step failure was recorded,");
      console.log("             so the worker process most likely died mid-step.");
    }
  }
}

async function reportEmbeddingProbe() {
  line();
  console.log("LIVE EMBEDDING PROBE");
  line();
  try {
    const started = Date.now();
    const [vector] = await generateEmbeddingBatch([
      "This is a short probe string used to verify the embeddings provider.",
    ]);
    console.log(`OK — ${vector.length} dimensions in ${Date.now() - started}ms`);

    const info = await qdrantClient.getCollection(RAG_COLLECTION_NAME).catch(() => null);
    const configured = (info?.config?.params?.vectors as { size?: number } | undefined)?.size;
    if (configured && configured !== vector.length) {
      console.log(
        `>> MISMATCH: collection expects ${configured} dims, provider returns ${vector.length}.`,
      );
      console.log("   Every upsert into this collection will be rejected.");
    }
  } catch (error) {
    console.log("FAILED:", (error as Error).message);
    console.log(">> This is the ingest failure. Embeddings cannot be generated");
    console.log("   from this environment, so no document can ever be indexed.");
  }
}

async function main() {
  await reportEnv();
  await reportCollection();
  await reportDocuments();
  await reportEmbeddingProbe();
  line();
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});