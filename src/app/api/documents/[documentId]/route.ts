import { NextRequest } from "next/server";

import {
  deleteDocumentAction,
  getDocumentContentAction,
} from "@/actions/document/document";
import { handleRouteError, jsonSuccess } from "@/lib/http";
import { serializeDocument } from "@/lib/serializers";

interface RouteParams {
  params: Promise<{ documentId: string }>;
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { documentId } = await params;
    const { document, content, previewMarkdown, truncated } =
      await getDocumentContentAction(documentId);

    return jsonSuccess({
      document: serializeDocument(document),
      content,
      previewMarkdown,
      truncated,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  try {
    const { documentId } = await params;
    await deleteDocumentAction(documentId);
    return jsonSuccess({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
