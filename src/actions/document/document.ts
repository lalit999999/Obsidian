"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { AppError } from "@/lib/errors";
import { deleteDocumentVectors } from "@/lib/rag/qdrant-store";
import { getOwnedDocument } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";

const MAX_PREVIEW_BYTES = 1024 * 1024;
const TEXT_EXTENSIONS = [".md", ".txt"];

export async function getDocumentContentAction(documentId: string) {
  const currentUser = await requireCurrentUser();
  const document = await getOwnedDocument(documentId, currentUser.id);

  const isTextDocument = TEXT_EXTENSIONS.some((extension) =>
    document.fileName.toLowerCase().endsWith(extension),
  );

  if (!isTextDocument) {
    return { document, content: null, truncated: false };
  }

  let response: Response;
  try {
    response = await fetch(document.cloudinaryUrl, {
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new AppError(
      "Failed to fetch document content.",
      502,
      "UPSTREAM_ERROR",
    );
  }

  if (!response.ok) {
    throw new AppError(
      "Failed to fetch document content.",
      502,
      "UPSTREAM_ERROR",
    );
  }

  const buffer = await response.arrayBuffer();
  const truncated = buffer.byteLength > MAX_PREVIEW_BYTES;
  const content = new TextDecoder().decode(
    truncated ? buffer.slice(0, MAX_PREVIEW_BYTES) : buffer,
  );

  return { document, content, truncated };
}

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
