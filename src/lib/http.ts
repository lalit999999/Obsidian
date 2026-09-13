import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors";

export function jsonSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function jsonError(message: string, status: number, code: string) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status },
  );
}

export function handleRouteError(error: unknown) {
  if (error instanceof AppError) {
    return jsonError(error.message, error.statusCode, error.code);
  }

  console.error(error);
  return jsonError(
    "Internet Connection problem",
    500,
    "Internet Connection problem",
  );
}
