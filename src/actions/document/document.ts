"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { deleteDocumentVectors } from "@/lib/rag/qdrant-store";
import { getOwnedDocument } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";

export async function deleteDocumentAction(documentId: string) {
  const currentUser = await requireCurrentUser();
  const document = await getOwnedDocument(documentId, currentUser.id);

  await deleteDocumentVectors(document.id);
  await deleteCloudinaryAsset(document.cloudinaryPublicId);
  await prisma.document.delete({
    where: { id: document.id },
  });

  revalidatePath(`/project/${document.projectId}`);
}
