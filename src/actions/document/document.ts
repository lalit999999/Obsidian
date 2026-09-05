"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth";
import { inngest } from "@/inngest/client";
import { documentDeleted } from "@/inngest/events";
import { getOwnedDocument } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";

export async function getDocumentContentAction(documentId: string) {
  const currentUser = await requireCurrentUser();
  const document = await getOwnedDocument(documentId, currentUser.id);

  return {
    document,
    content: document.extractedText,
    previewMarkdown: document.previewMarkdown,
    truncated: document.textTruncated,
  };
}

export async function deleteDocumentAction(documentId: string) {
  const currentUser = await requireCurrentUser();
  const document = await getOwnedDocument(documentId, currentUser.id);

  // Soft-delete and let purge-document.ts do the real Qdrant/Cloudinary/
  // Postgres cleanup in dependency order — see src/actions/project/project.ts
  // for why this can't happen inline.
  await prisma.document.update({
    where: { id: document.id },
    data: { deletedAt: new Date() },
  });

  await inngest.send(
    documentDeleted.create({
      documentId: document.id,
      userId: currentUser.id,
      cloudinaryPublicId: document.cloudinaryPublicId,
    }),
  );

  revalidatePath(`/project/${document.projectId}`);
}
