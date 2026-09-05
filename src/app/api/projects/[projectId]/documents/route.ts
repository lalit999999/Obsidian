import { NextRequest } from "next/server";

import { inngest } from "@/inngest/client";
import { documentUploaded } from "@/inngest/events";
import { requireCurrentUser } from "@/lib/auth";
import { uploadDocumentToCloudinary } from "@/lib/cloudinary";
import { handleRouteError, jsonError, jsonSuccess } from "@/lib/http";
import { getOwnedProject } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
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
      where: { projectId, userId: currentUser.id, deletedAt: null },
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
    // TODO(Session A): derive from the real multi-format sourceKind once the
    // parser lands — this route only ever handles txt/md today.
    const isMarkdown = file.name.toLowerCase().match(/\.(md|markdown)$/);
    const sourceKind = isMarkdown ? "MARKDOWN" : "TEXT";
    const previewKind = isMarkdown ? "MARKDOWN" : "PLAIN";

    const cloudinaryAsset = await uploadDocumentToCloudinary({
      content,
      fileName: file.name,
      mimeType,
    });

    const document = await prisma.document.create({
      data: {
        projectId,
        userId: currentUser.id,
        fileName: file.name,
        fileSize,
        mimeType,
        cloudinaryUrl: cloudinaryAsset.secureUrl,
        cloudinaryPublicId: cloudinaryAsset.publicId,
        sourceKind,
        previewKind,
        status: "PENDING",
      },
    });

    await inngest.send(
      documentUploaded.create({
        documentId: document.id,
        projectId,
        userId: currentUser.id,
      }),
    );

    return jsonSuccess(
      { document: serializeDocument(document) },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
