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

    if (!document.cloudinaryUrl || document.cloudinaryUrl.startsWith("local://")) {
      return jsonError(
        "Original file is not available.",
        404,
        "FILE_UNAVAILABLE",
      );
    }

    let upstream: Response;
    try {
      upstream = await fetch(document.cloudinaryUrl, {
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      return jsonError(
        "Failed to fetch the original file.",
        502,
        "UPSTREAM_ERROR",
      );
    }

    if (!upstream.ok || !upstream.body) {
      return jsonError(
        "Failed to fetch the original file.",
        502,
        "UPSTREAM_ERROR",
      );
    }

    const download = request.nextUrl.searchParams.get("download") === "1";
    const disposition = download ? "attachment" : "inline";
    const safeFileName = document.fileName.replace(/"/g, "'");

    const headers = new Headers({
      "Content-Type": document.mimeType,
      "Content-Disposition": `${disposition}; filename="${safeFileName}"`,
      "Cache-Control": "private, max-age=300",
    });

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new Response(upstream.body, { headers });
  } catch (error) {
    return handleRouteError(error);
  }
}
