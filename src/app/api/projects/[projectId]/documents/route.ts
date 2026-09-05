import { NextRequest } from "next/server";

import { inngest } from "@/inngest/client";
import { documentUploaded } from "@/inngest/events";
import { requireCurrentUser } from "@/lib/auth";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import { lookupSourceType } from "@/lib/documents/registry";
import { handleRouteError, jsonError, jsonSuccess } from "@/lib/http";
import { getOwnedProject } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
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

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const currentUser = await requireCurrentUser();
    await getOwnedProject(projectId, currentUser.id);

    const documents = await prisma.document.findMany({
      where: { projectId, userId: currentUser.id, deletedAt: null },
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

    const cloudinaryAsset = await uploadFileToCloudinary({
      bytes,
      fileName,
      mimeType,
    });

    const document = await prisma.document.create({
      data: {
        projectId,
        userId: currentUser.id,
        fileName,
        fileSize: bytes.byteLength,
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
