import { NextRequest } from "next/server";

import { requireCurrentUser } from "@/lib/auth";
import { uploadDocumentToCloudinary } from "@/lib/cloudinary";
import { handleRouteError, jsonError, jsonSuccess } from "@/lib/http";
import { getOwnedProject } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { extractPdfText } from "@/lib/rag/pdf";
import { ingestDocument } from "@/actions/rag/ingest";
import { serializeDocument } from "@/lib/serializers";
import { validateSupportedDocumentFile } from "@/lib/validations";
import type { PreviewKindValue, SourceKindValue } from "@/types/rag";

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
        "Only .md, .txt, and .pdf files are supported.",
        400,
        "BAD_REQUEST",
      );
    }

    const fileSize = file.size;
    const extension = file.name.toLowerCase().split(".").pop();

    // TODO(Session A): derive from the real multi-format sourceKind once the
    // docx/rtf/odt/image parsers land — this route only ever handles
    // txt/md/pdf today.
    let sourceKind: SourceKindValue;
    let previewKind: PreviewKindValue;
    let mimeType: string;
    let uploadContent: string | Buffer;
    let ingestContent: string;
    let pageCount: number | null = null;

    if (extension === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const extracted = await extractPdfText(new Uint8Array(buffer));

      sourceKind = "PDF";
      previewKind = "PDF";
      mimeType = file.type || "application/pdf";
      uploadContent = buffer;
      ingestContent = extracted.text;
      pageCount = extracted.pageCount;
    } else {
      const content = await file.text();

      sourceKind = extension === "md" || extension === "markdown" ? "MARKDOWN" : "TEXT";
      previewKind = sourceKind === "MARKDOWN" ? "MARKDOWN" : "PLAIN";
      mimeType = file.type || (sourceKind === "MARKDOWN" ? "text/markdown" : "text/plain");
      uploadContent = content;
      ingestContent = content;
    }

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
        sourceKind,
        previewKind,
        pageCount,
        extractedText: ingestContent,
      },
    });

    try {
      const cloudinaryAsset = await uploadDocumentToCloudinary({
        content: uploadContent,
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
        sourceKind,
        content: ingestContent,
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
