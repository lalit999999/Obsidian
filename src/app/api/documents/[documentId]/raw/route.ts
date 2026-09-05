import { NextRequest } from "next/server";

import { requireCurrentUser } from "@/lib/auth";
import { handleRouteError, jsonError } from "@/lib/http";
import { getOwnedDocument } from "@/lib/ownership";

interface RouteParams {
  params: Promise<{ documentId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { documentId } = await params;
    const currentUser = await requireCurrentUser();
    const document = await getOwnedDocument(documentId, currentUser.id);

    if (
      !document.cloudinaryUrl ||
      document.cloudinaryUrl.startsWith("local://")
    ) {
      return jsonError(
        "This document has no stored file to serve.",
        404,
        "NOT_FOUND",
      );
    }

    let upstream: Response;
    try {
      upstream = await fetch(document.cloudinaryUrl, {
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      return jsonError(
        "Failed to fetch the source file.",
        502,
        "UPSTREAM_ERROR",
      );
    }

    if (!upstream.ok || !upstream.body) {
      return jsonError(
        "Failed to fetch the source file.",
        502,
        "UPSTREAM_ERROR",
      );
    }

    const isDownload = request.nextUrl.searchParams.get("download") === "1";
    const asciiFallbackName = document.fileName.replace(/[^\x20-\x7e]/g, "_");
    const encodedName = encodeURIComponent(document.fileName);

    const headers = new Headers();
    headers.set("Content-Type", document.mimeType || "application/octet-stream");
    headers.set(
      "Content-Disposition",
      `${isDownload ? "attachment" : "inline"}; filename="${asciiFallbackName}"; filename*=UTF-8''${encodedName}`,
    );

    return new Response(upstream.body, { status: 200, headers });
  } catch (error) {
    return handleRouteError(error);
  }
}
