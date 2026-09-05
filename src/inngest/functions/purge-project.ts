import { inngest } from "@/inngest/client";
import { documentDeleted, projectDeleted } from "@/inngest/events";
import { prisma } from "@/lib/prisma";

// Fan out a document/deleted per document (including already soft-deleted
// ones, so a document deleted individually just before the project gets
// re-purged rather than skipped) so purge-document.ts cleans up each one's
// Qdrant/Cloudinary state, then hard-delete the project once those purges
// have had a head start. Postgres cascades handle any Document row that
// outlives its own purge.
export const purgeProject = inngest.createFunction(
  { id: "purge-project", retries: 3, triggers: [{ event: projectDeleted }] },
  async ({ event, step }) => {
    const { projectId, userId } = event.data;

    const documents = await step.run("load-documents", async () => {
      return prisma.document.findMany({
        where: { projectId },
        select: { id: true, cloudinaryPublicId: true },
      });
    });

    if (documents.length > 0) {
      await step.sendEvent(
        "send-document-deletes",
        documents.map((document) => ({
          name: documentDeleted.event,
          data: {
            documentId: document.id,
            userId,
            cloudinaryPublicId: document.cloudinaryPublicId,
          },
        })),
      );
    }

    await step.sleep("wait-for-document-purges", "30s");

    await step.run("delete-project", async () => {
      await prisma.project.deleteMany({ where: { id: projectId } });
    });
  },
);
