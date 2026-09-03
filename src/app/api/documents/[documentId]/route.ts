import { NextRequest } from "next/server";

import { deleteDocumentAction } from "@/actions/document/document";
import { handleRouteError, jsonSuccess } from "@/lib/http";

interface RouteParams {
  params: Promise<{ documentId: string }>;
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
