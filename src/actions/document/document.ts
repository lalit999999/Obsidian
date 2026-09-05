"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { deleteDocumentVectors } from "@/lib/rag/qdrant-store";
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

  // Vector deletion stays fatal - a stranded Qdrant point is a silent data
  // leak. A dead Cloudinary asset is just wasted storage, so it's logged and
  // swallowed rather than blocking the row from ever being deletable.
  await deleteDocumentVectors(document.id);

  try {
    await deleteCloudinaryAsset(document.cloudinaryPublicId, document.mimeType);
  } catch (error) {
    console.error(
      `[document] failed to delete Cloudinary asset ${document.cloudinaryPublicId}:`,
      error,
    );
  }

  await prisma.document.delete({
    where: { id: document.id },
  });

  revalidatePath(`/project/${document.projectId}`);
}
