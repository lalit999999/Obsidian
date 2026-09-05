# UI notes — upload UX, multi-format preview, per-document chat

Written by Session B (`feat/upload-chat-ui`) for whoever picks this up next
(including future-me). Covers: adding a new source type, how chat scoping
resolves and persists, the polling strategy, and where this diverges from
the original task prompt.

## Adding a new source type to the UI

Everything the UI needs for a source type lives in one array:
`src/lib/sources/registry.ts` → `SOURCE_TYPES`. To add a type:

1. Add its `SourceKind` to `SOURCE_KINDS` in `src/types/index.ts` (and the
   matching Prisma enum, if it isn't there yet — that's Session A's side).
2. Add one entry to `SOURCE_TYPES`: `kind`, `label`, `extensions`,
   `mimeTypes`, `maxBytes`, a distinct `icon` (lucide-react), and a distinct
   `accentClassName` (Tailwind color pair, light+dark).
3. Add a `previewKind` mapping for it wherever the backend sets
   `previewKind` on ingest (Session A's domain) — the frontend already
   dispatches on `previewKind` generically in
   `src/components/project/previews/document-preview-body.tsx`, so a new
   `previewKind` value needs a new preview component there; a new
   `SourceKind` that reuses an existing `previewKind` (e.g. another
   plain-text format) needs nothing further in `previews/`.
4. If it needs distinct tab labels in the preview dialog (like DOCX's
   "Raw text" vs the generic "Raw"), add a row to `TAB_LABELS` in
   `document-preview-dialog.tsx`.

Everywhere else (the Add Source dialog's format grid, `FILE_ACCEPT_ATTRIBUTE`,
`matchSourceType`, `DocumentItem`'s icon/accent) reads `SOURCE_TYPES`
directly — nothing else to touch.

## Chat scoping: resolution and persistence

- Selection lives in `ProjectWorkspace` as `selectedDocumentIds: string[]`.
  Empty = whole project.
- Switching chats loads `chat.documentIds` into that state (no network
  round-trip — the chat's `documentIds` is already in the `chats` array from
  the initial page load / list-chats / create-chat / patch-chat responses).
- Toggling a checkbox, "Select all", or "Clear" updates local state
  immediately, then debounces a `PATCH /api/chats/:chatId` with
  `{ documentIds }` by 400ms (`schedulePersistSelection` in
  `project-workspace.tsx`). Switching chats does **not** go through this
  path (it would just re-PATCH the same value back).
- `POST /api/chats` (new chat) and `POST /api/chats/:chatId/messages`
  (send) both send the current `selectedDocumentIds` in the body.
- The messages route is the source of truth for what the scope actually
  ends up being: it re-validates every id (belongs to this user + project,
  status `READY`) and **drops the rest silently** — a source can be deleted
  or still be processing mid-conversation. If that empties an originally
  non-empty request, the result is `[]`, which already means "whole
  project" per the `C6` filter semantics — no special-case branch needed.
  It persists the resolved array back onto the chat and returns it as
  `scopedDocumentIds`; the client syncs its local selection to that value,
  so a stale chip list self-heals after the next message.

## Polling strategy

`ProjectWorkspace` polls `GET /api/projects/:projectId/documents` every
2500ms **only** while `documents.some(d => d.status === "PENDING" ||
d.status === "PROCESSING")` is true — the effect's dependency is that
boolean, not the `documents` array itself, so the interval isn't torn down
and rebuilt on every tick. It skips the actual fetch while
`document.visibilityState === "hidden"` and does one extra fetch immediately
on `visibilitychange` back to `"visible"`. Responses are merged by id
(`mergeDocuments`) — existing local fields are spread first, then
overwritten by the fresh row, so nothing referenced elsewhere (e.g. the
open preview dialog, which reads `documents.find(...)` live) gets replaced
with a different object identity than necessary. A status transition to
`READY`/`FAILED` fires a toast during the merge.

## Deviations from the prompt, and why

- **`src/lib/rag/parser.ts`, `src/actions/rag/ingest.ts`,
  `src/app/api/projects/[projectId]/documents/route.ts` got minimal,
  mechanical patches** even though they're listed as Session A's files.
  Applying the `C5` contract to `src/types/rag.ts` (deleting
  `SupportedRagFileExtension`, requiring `sourceKind` on `IngestionInput`,
  reshaping `IngestionResult`) broke these three files at compile time
  immediately — Gate 1 requires a clean `tsc`, and Session A hadn't touched
  this checkout. The patches are type-only / one-line glue (a local
  `type SupportedRagFileExtension` alias in `parser.ts`; passing
  `sourceKind` through in `ingest.ts` and the upload route, defaulted from
  the `.md`/`.txt` extension since that route only ever handles those two
  today). Each is flagged with a `TODO(Session A)` comment. Expect Session
  A's real branch to fully replace all three files.
- **`renameChatAction` became `updateChatAction`** (in
  `src/actions/chat/chat.ts`) and `parseRenameChatInput` got a sibling
  `parseUpdateChatInput` (in `src/lib/validations.ts`) rather than
  overloading the rename-only path, since `PATCH /api/chats/:chatId` now
  needs to accept `title` and/or `documentIds` independently.
- **`sourceTypeForKind()` doesn't throw.** The prompt describes it as a
  lookup that should always succeed since every `SourceKind` is in the
  registry — true in principle, but while testing I caught a live
  `Error: Unknown source kind: undefined` in the shared dev server's logs
  (a document row somewhere came back without a `sourceKind`, most likely
  a stale Prisma Client in a long-running dev process reading a column it
  was generated before). Since this function renders on live, possibly
  stale data, it now falls back to the `TEXT` entry instead of throwing.
  The preview dialog's tab-label lookup and `DocumentPreviewBody`'s switch
  got the same fallback treatment.
- **`src/types/chat.ts`** (not listed as either session's explicitly) got
  `documentIds`/`scopedDocumentIds` added — it's chat-specific and
  re-exported through the contract file `src/types/index.ts`, squarely in
  Session B's domain.
- **`page.tsx` bridges fields Session A's `serializeDocument`/`serializeChat`
  don't emit yet** (`sourceKind`, `previewKind`, `pageCount`,
  `textTruncated`, `documentIds`) by spreading the serializer's output and
  adding the extra fields from the raw Prisma record. This is called out
  inline with a comment — delete the spread once `src/lib/serializers.ts`
  (Session A's file) is merged with the full contract shape.

## What I could not verify

Everything gated on Session A's endpoints not existing on this branch yet:

- `POST /api/projects/:projectId/documents` with `mode=text`, and any
  `.pdf`/`.docx`/`.rtf`/`.odt`/image upload — the current backend route is
  the old synchronous `.md`/`.txt`-only handler, so the Paste-text tab and
  every non-text format in the Add Source dialog are implemented against
  the contract but unexercised end-to-end.
- `GET /api/documents/:id/raw` — doesn't exist yet, so the PDF `<iframe>`
  and image `<img>` previews render but 404 gracefully rather than showing
  real content. Confirmed the failure mode is a broken-image/empty-frame,
  not a crash, but haven't seen a real PDF/image render.
- The `previewMarkdown`/`textTruncated`/`pageCount` fields on
  `GET /api/documents/:id` and the documents list — same reason.
- Any of the multi-format extraction quality (PDF page splitting, DOCX→
  Markdown fidelity, image OCR).

Everything else (Add Source paste-text and file tabs against the old
`.md`/`.txt` route, multi-file sequential upload with per-item status,
selection/checkboxes, scope bar, scoped retrieval against the two RAG
formats that do exist, polling, toasts, `tsc`/`bun run build`) was verified
via `tsc --noEmit`, `bun run build`, and reading the shared dev server's
live logs. I did not have browser automation available this session (the
user declined the Chrome extension), so no manual click-through — see the
final summary for what that means for sign-off.

## Known pre-existing, out-of-scope issues

- `bun run lint` fails outright in this environment:
  `typescript-eslint does not support TS 7.0`. Pre-existing toolchain
  mismatch (`typescript@^7.0.2` vs `typescript-eslint`'s current ceiling),
  unrelated to this branch's changes — not something to fix here.
- `bun run build` fails at the "Collecting page data" step on
  `src/proxy.ts` ("must export a function... previously called
  middleware"). Pre-existing (last touched in commit `52dbe57`, well before
  this branch), out of both sessions' ownership lists. `tsc --noEmit`
  and the Turbopack compile + typecheck steps that run before it are clean.
