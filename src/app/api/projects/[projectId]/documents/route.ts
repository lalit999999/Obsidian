import { NextRequest } from "next/server";

import { requireCurrentUser } from "@/lib/auth";
import { uploadDocumentToCloudinary } from "@/lib/cloudinary";
import { handleRouteError, jsonError, jsonSuccess } from "@/lib/http";
import { getOwnedProject } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { ingestDocument } from "@/actions/rag/ingest";
import { serializeDocument } from "@/lib/serializers";
import { validateSupportedDocumentFile } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const currentUser = await requireCurrentUser();
    await getOwnedProject(projectId, currentUser.id);

    const documents = await prisma.document.findMany({
      where: { projectId, userId: currentUser.id },
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
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("A file upload is required.", 400, "BAD_REQUEST");
    }

    if (!validateSupportedDocumentFile(file.name)) {
      return jsonError(
        "Only .md and .txt files are supported.",
        400,
        "BAD_REQUEST",
      );
    }

    const content = await file.text();
    const fileSize = file.size;
    const mimeType =
      file.type || (file.name.endsWith(".md") ? "text/markdown" : "text/plain");

    const document = await prisma.document.create({
      data: {
        projectId,
        userId: currentUser.id,
        fileName: file.name,
        fileSize,
        mimeType,
        cloudinaryUrl: "",
        cloudinaryPublicId: "",
        status: "PROCESSING",
      },
    });

    try {
      const cloudinaryAsset = await uploadDocumentToCloudinary({
        content,
        fileName: file.name,
        mimeType,
      });

      await prisma.document.update({
        where: { id: document.id },
        data: {
          cloudinaryUrl: cloudinaryAsset.secureUrl,
          cloudinaryPublicId: cloudinaryAsset.publicId,
        },
      });

      const ingestResult = await ingestDocument({
        documentId: document.id,
        projectId,
        userId: currentUser.id,
        fileName: file.name,
        // TODO(Session A): derive from the real multi-format sourceKind once
        // the parser lands — this route only ever handles txt/md today.
        sourceKind: file.name.toLowerCase().match(/\.(md|markdown)$/)
          ? "MARKDOWN"
          : "TEXT",
        content,
      });

      const updatedDocument = await prisma.document.update({
        where: { id: document.id },
        data: {
          status: "READY",
          chunkCount: ingestResult.chunkCount,
          processedAt: new Date(),
          error: null,
        },
      });

      return jsonSuccess(
        { document: serializeDocument(updatedDocument) },
        { status: 201 },
      );
    } catch (error) {
      await prisma.document.update({
        where: { id: document.id },
        data: {
          status: "FAILED",
          error:
            error instanceof Error
              ? error.message
              : "Document processing failed.",
        },
      });

      throw error;
    }
  } catch (error) {
    return handleRouteError(error);
  }
}
