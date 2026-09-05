# Multi-format ingestion — handover notes

## New environment variables

```
GEMINI_API_KEY=
GEMINI_VISION_MODEL=
MAX_UPLOAD_BYTES=
```

- **`GEMINI_API_KEY`** — get one at https://aistudio.google.com/apikey (free tier available). Optional: without it, every upload type except images still works; image uploads fail cleanly with `"Image OCR is not configured. Set GEMINI_API_KEY."` and nothing else breaks.
- **`GEMINI_VISION_MODEL`** — defaults to `gemini-2.5-flash` if left empty.
- **`MAX_UPLOAD_BYTES`** — defaults to `20971520` (20 MB) if left empty. Acts as a ceiling: the registry's per-type caps (20 MB documents, 10 MB images) are clamped by this value, so lowering it tightens every type at once.

## Extraction flow, end to end

1. `POST /api/projects/:projectId/documents` (`src/app/api/projects/[projectId]/documents/route.ts`) receives either `mode=file` (multipart `File`) or `mode=text` (pasted text + optional title).
2. The file (or UTF-8-encoded pasted text) is validated against `src/lib/documents/registry.ts` — the single source of truth mapping extension/MIME → `sourceKind`, `previewKind`, and size cap. `.doc` is explicitly rejected here; anything not in the registry is rejected with the supported-formats list.
3. A `Document` row is created with `status: PENDING` and the route returns **201 immediately**.
4. A `next/server` `after()` callback (confirmed stable in this Next version's docs, no `next.config.ts` opt-in needed) runs the rest, unawaited by the response:
   - `status → PROCESSING`
   - `uploadFileToCloudinary` (raw bytes, resolved resource type `image`/`raw`) → `cloudinaryUrl`/`cloudinaryPublicId`
   - `extractDocument` (`src/lib/documents/extract.ts`) dispatches to the per-format parser under `src/lib/documents/parsers/` → `extractedText`, `previewMarkdown`, `pageCount`, `textTruncated`
   - `ingestDocument` (`src/actions/rag/ingest.ts`) chunks (per-page for PDFs, via `chunkPages`, so `page` rides along on every chunk's Qdrant payload) → embeds → upserts into Qdrant → `chunkCount`
   - `status → READY`, `processedAt` set, `error` cleared
5. On any failure at any step: `status → FAILED`, `error` set to a capped (500 char), user-facing message; any Qdrant vectors or Cloudinary asset already written are best-effort cleaned up. The background function never throws out of its own scope (it has one outer `try/catch` around everything, including the cleanup calls).
6. `GET /api/documents/:id` reads `extractedText`/`previewMarkdown`/`textTruncated` straight off the row — it no longer touches Cloudinary, so it never 500s for a `PENDING`/`FAILED` document (nulls instead).
7. `GET /api/documents/:id/raw` streams the original bytes from Cloudinary (no buffering) for `<iframe>`/`<img>` use.

## Parser notes and known limitations

- **RTF** (`parsers/rtf.ts`, hand-written, no dependency): implements the control-word/group/destination-discard model described in the brief — CP1252 byte escapes (`\'hh`), Unicode escapes (`\uN` + `\ucN` skip-count), and discards `fonttbl`/`colortbl`/`pict`/`object`/etc. destinations plus any `\*\...` ignorable group. **Known limitations**: it does not attempt table (`\cell`/`\row`) layout reconstruction beyond emitting a tab/newline; it does not decode embedded `\pict` images (by design — discarded, not OCR'd); the `\ucN` skip only decrements on plain characters and `\'hh` escapes, not on nested control words, which covers the common `\uN ?` fallback pattern but not more exotic generators.
- **Scanned PDFs**: if a multi-page PDF yields under 40 characters of embedded text, `parsers/pdf.ts` throws a specific error telling the user to upload the pages as images for OCR instead of silently producing an empty document.
- **DOCX**: mammoth `1.12.2` has a working `convertToMarkdown` at runtime, but it is **not** declared in the package's shipped `.d.ts` (only `convertToHtml`/`extractRawText`/`embedStyleMap`/`images` are typed — it's a deprecated, undocumented-in-types method). `parsers/docx.ts` feature-detects it via a narrow local type and uses it when present (which it is, in the currently installed version) for `previewMarkdown`; if a future install lacks it, the code falls back to `convertToHtml` (used only to surface conversion warnings) with `previewMarkdown: null` and the raw extracted text as the displayed body under `previewKind: MARKDOWN`, exactly as specified. Images inside `.docx` files are dropped from the markdown preview (`convertImage` returns an empty `src`) rather than inlined as base64.
- **ODT**: parses `content.xml` with `fast-xml-parser` in `preserveOrder` mode, walking `text:p`/`text:h` nodes and expanding `text:s` (repeated spaces via `text:c`) and `text:tab`. Table/list structure is flattened to plain paragraphs.
- **Images**: Gemini is asked for strict JSON (`responseMimeType: "application/json"` plus defensive fence-stripping/brace-slicing and one retry) with `transcription`/`description`/`entities`/`documentType`. On a second JSON failure, it falls back to the raw model text as `description` rather than failing the upload. 60s timeout via `httpOptions.timeout`.
- **Whitespace normalisation** (`src/lib/documents/normalize.ts`, re-exported unchanged from `src/lib/rag/parser.ts`) collapses runs of spaces/tabs and blank lines. This means tabs and multiple-space runs (e.g. from RTF `\tab`/ODT `text:s`) are **not** preserved exactly in the stored text — they collapse to a single space, same as the original `.txt`/`.md` pipeline always did.

## Adding a new format

1. Write a parser in `src/lib/documents/parsers/<format>.ts` returning `ExtractionResult` (`{ text, previewMarkdown, pages, pageCount, truncated }`), throwing `ValidationError` with a user-actionable message on failure.
2. Add an entry to `SOURCE_TYPES` in `src/lib/documents/registry.ts` (extensions, MIME types, `sourceKind`, `previewKind`, size cap).
3. Add the `case` to the switch in `src/lib/documents/extract.ts`.

Done — the upload route, validation, DB writes, and ingestion pipeline all key off the registry and don't need format-specific changes.

## Deviations from the brief, and why

- **`rag/parser.ts`'s `parseDocumentContent` is still called from `ingest.ts`.** The brief's Phase 5 description of `ingest.ts` doesn't mention calling it (content is already extracted/normalised by the time `ingestDocument` runs), but the brief also explicitly says to keep `rag/parser.ts` with just the normalisation function re-exported. Calling it again in `ingest.ts` is a cheap, idempotent no-op re-normalisation and keeps the function actually used rather than dead code.
- **`uploadDocumentToCloudinary` (string-only) was removed, not kept alongside `uploadFileToCloudinary`.** Nothing needs the string-only path anymore — the rewritten upload route UTF-8-encodes pasted text into `bytes` up front, so `uploadFileToCloudinary` is a strict superset. Keeping both would have been dead code.
- **No `next.config.ts` change for `after()`** — the on-disk docs for this Next version confirm `after()` is stable and works in Route Handlers without any config opt-in.
- **PDF fixture testing**: `scripts/verify-parsers.ts` covers txt/md/rtf/odt/docx with fixtures built in-process via `fflate`. PDF was verified separately (not in the committed harness) with a minimal hand-built single/multi-page PDF, per the brief's explicit permission to do this "or skip PDF in the harness and verify it manually with a real file."

## Things I could not verify

- **Live Gemini image OCR** — no `GEMINI_API_KEY` was available in this environment. I verified the clean-failure path (`"Image OCR is not configured. Set GEMINI_API_KEY."`) end-to-end, and checked the request/response shapes (`inlineData`, `responseMimeType`, `httpOptions.timeout`, `response.text`) directly against `node_modules/@google/genai/dist/node/node.d.ts`, but have not run a real image through it.
- **The actual HTTP path with a real logged-in browser session** (cookie-based auth via Auth.js/Google OAuth) — I validated the route logic by type-checking, a full `next build`, and by directly exercising the same sequence of calls the route's background pipeline makes (Cloudinary upload, extraction, chunking, embedding, Qdrant upsert, DB writes, delete) against a real Postgres/Qdrant/Cloudinary/OpenRouter-embeddings backend for txt/md/pdf(multi-page)/docx/rtf/odt, plus `.doc` rejection, oversized-file rejection, and the `documentIds`-scoped retrieval filter (C6) — all passed. I did not click through an actual browser upload.
- **Chat citation returning the PDF's `documentId`** — `actions/ai/chat.ts` is Session B's file. I verified the mechanism it would rely on (`searchSimilarChunks`/`retrieveRelevantChunks` with a `documentIds` filter correctly scoping results to one document) directly, but did not run the actual chat action.

## Pre-existing issue found, not caused by or fixed in this work

`bun run build` fails at the base commit this branch started from (`a94ffed`, verified on a clean scratch checkout with a fresh `bun install`, no ingestion changes at all) with `Error: The file "./src/proxy.ts" must export a function...`. `src/proxy.ts`/`src/auth.config.ts` are outside this session's file ownership (auth is a different session's area). `bunx tsc --noEmit` is clean project-wide on this branch; `bun run build` was confirmed to succeed for everything in this branch's diff via a throwaway local patch to `proxy.ts` (reverted, not part of the committed diff) that changed its export shape.

`bun run lint` also fails project-wide (`typescript-eslint does not support TS 7.0`) — pre-existing, unrelated to this branch, environment-level (TypeScript 7 vs. the installed `typescript-eslint`).
