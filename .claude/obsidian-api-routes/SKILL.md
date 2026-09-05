---
name: obsidian-api-routes
description: The response envelope, auth, ownership, validation, error and serialization conventions for every API route and server action in the Obsidian repo. Use this skill whenever you create or edit anything under src/app/api/, write a server action in src/actions/, add a validator, return data to the client, or handle an error in server code. Use it before writing the first line of a new route handler, not after.
---

# Obsidian: server-side conventions

Every route in this repo follows the same shape. Deviating breaks the client, which parses `payload.success` and `payload.error.message` everywhere.

## The skeleton

```ts
import { NextRequest } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { getOwnedProject } from "@/lib/ownership";
import { handleRouteError, jsonError, jsonSuccess } from "@/lib/http";
import { serializeDocument } from "@/lib/serializers";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;          // params is a Promise
    const currentUser = await requireCurrentUser();
    await getOwnedProject(projectId, currentUser.id);

    // ...work...

    return jsonSuccess({ documents: rows.map(serializeDocument) });
  } catch (error) {
    return handleRouteError(error);
  }
}
```

Every handler: `try` / `catch (error) { return handleRouteError(error); }`. No exceptions.

## The five helpers you must use

| Need | Use |
|---|---|
| Current user or 401 | `requireCurrentUser()` from `@/lib/auth` |
| Ownership + 404 | `getOwnedProject` / `getOwnedChat` / `getOwnedDocument` from `@/lib/ownership` |
| Success response | `jsonSuccess(data, init?)` → `{ success: true, data }` |
| Explicit failure | `jsonError(message, status, code)` → `{ success: false, error: { code, message } }` |
| Thrown failure | `handleRouteError(error)` |

Error classes live in `src/lib/errors.ts`: `AppError`, `NotFoundError`, `ValidationError`. Throw these from actions and libs; `handleRouteError` maps them to the right status. A bare `Error` becomes a 500, so throw the typed one when the user caused it.

## Ownership is not optional

Never trust an id from the URL or body. Every document, chat and project id must pass through an ownership helper scoped to `currentUser.id` before it is used — including ids inside arrays (e.g. a list of `documentIds` to scope a chat). Filter out ids the user does not own rather than erroring, unless the request is meaningless without them.

## Serialization

Prisma rows never go to the client directly — `Date` objects and internal fields leak. Use `serializeProject`, `serializeChat`, `serializeDocument`, `serializeMessage` from `@/lib/serializers`. If you add a column that the UI needs, add it to the serializer and to the matching interface in `src/types/index.ts` in the same commit.

Keep large text fields (extracted text, preview markdown) **out of list serializers**. They belong only in single-resource detail responses.

## Validation

All input parsing lives in `src/lib/validations.ts` and throws `ValidationError`. Do not inline `if (!body.name) return jsonError(...)` in a route — add a `parseXInput` function so the rules stay in one place and server actions get them too.

## Server actions vs route handlers

- Route handler when the client fetches it, when it streams, or when it takes `FormData` from a real upload.
- Server action (`"use server"`) when it is invoked from a React component and needs `revalidatePath`.
- Streaming chat must be a route handler; a server action cannot stream.

## Long-running work

An upload that parses, embeds and indexes will exceed the request budget. Return the created row immediately in `PENDING` and do the work in the background, updating status to `PROCESSING` → `READY` / `FAILED`. Set `export const maxDuration = 300;` on such routes. A background task must never throw out of its own scope — wrap the whole body and write the failure to the row.
