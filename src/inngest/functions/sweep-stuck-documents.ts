import { inngest } from "@/inngest/client";
import { documentUploaded } from "@/inngest/events";
import { prisma } from "@/lib/prisma";

const STUCK_THRESHOLD_MS = 15 * 60 * 1000;
const MAX_INGEST_ATTEMPTS = 3;

// A run that crashed the whole process (not a clean step failure) leaves its
// document stuck in PROCESSING forever — nothing else transitions it out.
// This cron finds those and either re-queues them or gives up on them,
// using the @@index([status, processingStartedAt]) index from the schema.
export const sweepStuckDocuments = inngest.createFunction(
  { id: "sweep-stuck-documents", triggers: [{ cron: "*/10 * * * *" }] },
  async ({ step }) => {
    const staleThreshold = new Date(Date.now() - STUCK_THRESHOLD_MS);

    const retryCandidates = await step.run("find-retryable", async () => {
      return prisma.document.findMany({
        where: {
          status: "PROCESSING",
          processingStartedAt: { lt: staleThreshold },
          ingestAttempts: { lt: MAX_INGEST_ATTEMPTS },
          deletedAt: null,
        },
        select: { id: true, projectId: true, userId: true },
      });
    });

    const exhausted = await step.run("find-exhausted", async () => {
      return prisma.document.findMany({
        where: {
          status: "PROCESSING",
          processingStartedAt: { lt: staleThreshold },
          ingestAttempts: { gte: MAX_INGEST_ATTEMPTS },
          deletedAt: null,
        },
        select: { id: true },
      });
    });

    if (exhausted.length > 0) {
      await step.run("fail-exhausted-documents", async () => {
        await prisma.document.updateMany({
          where: { id: { in: exhausted.map((document) => document.id) } },
          data: {
            status: "FAILED",
            error:
              "Processing got stuck and exhausted its retry attempts. Try re-uploading the document.",
          },
        });
      });
    }

    if (retryCandidates.length > 0) {
      await step.sendEvent(
        "requeue-stuck-documents",
        retryCandidates.map((document) => ({
          name: documentUploaded.event,
          data: {
            documentId: document.id,
            projectId: document.projectId,
            userId: document.userId,
          },
        })),
      );
    }

    return { requeued: retryCandidates.length, failed: exhausted.length };
  },
);
