"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { inngest } from "@/inngest/client";
import { documentDeleted } from "@/inngest/events";
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
