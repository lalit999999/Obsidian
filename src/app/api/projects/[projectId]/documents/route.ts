import { after, NextRequest } from "next/server";

import { requireCurrentUser } from "@/lib/auth";
import { deleteCloudinaryAsset, uploadFileToCloudinary } from "@/lib/cloudinary";
import { extractDocument } from "@/lib/documents/extract";
import { lookupSourceType } from "@/lib/documents/registry";
import { handleRouteError, jsonError, jsonSuccess } from "@/lib/http";
import { getOwnedProject } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { ingestDocument } from "@/actions/rag/ingest";
import { deleteDocumentVectors } from "@/lib/rag/qdrant-store";
import { serializeDocument } from "@/lib/serializers";
import {
  parseTextSourceInput,
  validateUploadedFile,
} from "@/lib/validations";
import type { SourceKindValue } from "@/types/rag";

export const maxDuration = 300;

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "untitled-note";
}

const MAX_ERROR_LENGTH = 500;

function toUserFacingError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Document processing failed.";
  return message.length > MAX_ERROR_LENGTH
    ? message.slice(0, MAX_ERROR_LENGTH)
    : message;
}

async function processDocumentInBackground({
  documentId,
  projectId,
  userId,
  bytes,
  fileName,
  mimeType,
  sourceKind,
}: {
  documentId: string;
  projectId: string;
  userId: string;
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
  sourceKind: SourceKindValue;
}): Promise<void> {
  let cloudinaryPublicId: string | null = null;
  let cloudinaryMimeType: string | undefined;
  let vectorsWritten = false;

  try {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "PROCESSING" },
    });

    const cloudinaryAsset = await uploadFileToCloudinary({
      bytes,
      fileName,
      mimeType,
    });
    cloudinaryPublicId = cloudinaryAsset.publicId;
    cloudinaryMimeType = mimeType;

    await prisma.document.update({
      where: { id: documentId },
      data: {
        cloudinaryUrl: cloudinaryAsset.secureUrl,
        cloudinaryPublicId: cloudinaryAsset.publicId,
      },
    });

    const extraction = await extractDocument(bytes, fileName, mimeType);

    await prisma.document.update({
      where: { id: documentId },
      data: {
        extractedText: extraction.text,
        previewMarkdown: extraction.previewMarkdown,
        pageCount: extraction.pageCount,
        textTruncated: extraction.truncated,
      },
    });

    const ingestResult = await ingestDocument({
      documentId,
      projectId,
      userId,
      fileName,
      sourceKind,
      content: extraction.text,
      pages: extraction.pages ?? undefined,
    });
    vectorsWritten = true;

    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "READY",
        chunkCount: ingestResult.chunkCount,
        processedAt: new Date(),
        error: null,
      },
    });
  } catch (error) {
    console.error(`[documents] processing failed for ${documentId}:`, error);

    if (vectorsWritten) {
      await deleteDocumentVectors(documentId).catch((cleanupError) => {
        console.error(
          `[documents] failed to clean up vectors for ${documentId}:`,
          cleanupError,
        );
      });
    }

    if (cloudinaryPublicId) {
      await deleteCloudinaryAsset(cloudinaryPublicId, cloudinaryMimeType).catch(
        (cleanupError) => {
          console.error(
            `[documents] failed to clean up Cloudinary asset for ${documentId}:`,
            cleanupError,
          );
        },
      );
    }

    await prisma.document
      .update({
        where: { id: documentId },
        data: {
          status: "FAILED",
          error: toUserFacingError(error),
        },
      })
      .catch((updateError) => {
        console.error(
          `[documents] failed to record failure for ${documentId}:`,
          updateError,
        );
      });
  }
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const currentUser = await requireCurrentUser();
    await getOwnedProject(projectId, currentUser.id);

    const documents = await prisma.document.findMany({
      where: { projectId, userId: currentUser.id },
      orderBy: { createdAt: "desc" },
    });

    return jsonSuccess({ documents: documents.map(serializeDocument) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const currentUser = await requireCurrentUser();
    await getOwnedProject(projectId, currentUser.id);

    const formData = await request.formData();
    const mode = formData.get("mode");

    let bytes: Uint8Array;
    let fileName: string;
    let mimeType: string;
    let sourceKind: SourceKindValue;
    let previewKind: "MARKDOWN" | "PLAIN" | "PDF" | "IMAGE";

    if (mode === "text") {
      const { text, title } = parseTextSourceInput(formData);
      fileName = `${slugifyTitle(title)}.md`;
      mimeType = "text/markdown";
      bytes = new TextEncoder().encode(text);

      const match = lookupSourceType(fileName, mimeType);
      sourceKind = match?.sourceKind ?? "MARKDOWN";
      previewKind = match?.previewKind ?? "MARKDOWN";
    } else if (mode === "file") {
      const file = formData.get("file");
      if (!(file instanceof File)) {
        return jsonError("A file upload is required.", 400, "BAD_REQUEST");
      }

      const match = validateUploadedFile(file);
      fileName = file.name;
      mimeType =
        file.type ||
        (match.sourceKind === "MARKDOWN" ? "text/markdown" : "application/octet-stream");
      bytes = new Uint8Array(await file.arrayBuffer());
      sourceKind = match.sourceKind;
      previewKind = match.previewKind;
    } else {
      return jsonError(
        "mode must be \"file\" or \"text\".",
        400,
        "BAD_REQUEST",
      );
    }

    const document = await prisma.document.create({
      data: {
        projectId,
        userId: currentUser.id,
        fileName,
        fileSize: bytes.byteLength,
        mimeType,
        cloudinaryUrl: "",
        cloudinaryPublicId: "",
        sourceKind,
        previewKind,
        status: "PENDING",
      },
    });

    // `after()` is stable in next@16.3.4 (node_modules/next/dist/docs/01-app/
    // 03-api-reference/04-functions/after.md) and works in Route Handlers
    // without extra next.config.ts opt-in, so extraction/embedding/indexing
    // run after this response is sent instead of blocking it.
    after(() =>
      processDocumentInBackground({
        documentId: document.id,
        projectId,
        userId: currentUser.id,
        bytes,
        fileName,
        mimeType,
        sourceKind,
      }),
    );

    return jsonSuccess({ document: serializeDocument(document) }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
