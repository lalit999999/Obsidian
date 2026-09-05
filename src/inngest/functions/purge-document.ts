import { inngest } from "@/inngest/client";
import { documentDeleted } from "@/inngest/events";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { deleteDocumentVectors } from "@/lib/rag/qdrant-store";

// Deletion order matches the obsidian-rag skill: Qdrant vectors first (fatal
// on failure — retry the whole function rather than orphan vectors),
// Cloudinary asset second (log and continue — a dead asset is recoverable),
// the Postgres row last (it's the record of what still needs deleting, so it
// has to be the last thing to disappear).
export const purgeDocument = inngest.createFunction(
  { id: "purge-document", retries: 3, triggers: [{ event: documentDeleted }] },
  async ({ event, step }) => {
    const { documentId, cloudinaryPublicId } = event.data;

    await step.run("delete-vectors", async () => {
      await deleteDocumentVectors(documentId);
    });

    await step.run("delete-cloudinary", async () => {
      try {
        await deleteCloudinaryAsset(cloudinaryPublicId);
      } catch (error) {
        console.warn(
          `[purge-document] cloudinary delete failed for ${cloudinaryPublicId}, leaving asset orphaned:`,
          error,
        );
      }
    });

    await step.run("delete-row", async () => {
      await prisma.document.deleteMany({ where: { id: documentId } });
    });
  },
);
