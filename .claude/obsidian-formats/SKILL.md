---
name: obsidian-formats
description: How to add or modify a document source format in Obsidian — the registry, parser contract, preview mapping, size caps, and the checklist of every place a new format must be registered. Use this skill whenever the user wants to support a new file type (pptx, xlsx, epub, csv, html, audio, or anything else), when editing anything under src/lib/documents/, when a format fails to parse, or when changing how a document is previewed or indexed.
---

# Obsidian: adding a document format

Adding a format should mean writing one parser and one registry entry. If it means editing five unrelated files, the abstraction has drifted and fixing that comes first.

## The parser contract

Every parser is a pure function over bytes:

```ts
(bytes: Uint8Array, fileName: string, mimeType: string) => Promise<ExtractionResult>
```

```ts
interface ExtractionResult {
  text: string;                 // normalised, this is what gets chunked and embedded
  previewMarkdown: string | null;
  pages: string[] | null;       // per-page text when the format has pages
  pageCount: number | null;
  truncated: boolean;
}
```

Rules that apply to all of them:

- **No filesystem, no temp files, no shelling out.** This has to run in a serverless function. That rules out LibreOffice, ImageMagick, poppler and anything else that expects a binary on PATH.
- **Throw `ValidationError` with a message the user can act on.** `"This does not look like a valid .odt file."` — not a library stack trace, not `"Error: ENOENT"`.
- Empty after normalisation → `"No readable text could be extracted from <fileName>."`
- Cap stored text (2,000,000 characters), truncate at a whitespace boundary, set `truncated`.
- Normalise whitespace through the shared normaliser so chunking behaves consistently across formats.

## The checklist for a new format

1. **Parser** at `src/lib/documents/parsers/<ext>.ts`.
2. **Registry entry** in `src/lib/documents/registry.ts`: extensions, MIME types, `sourceKind`, `previewKind`, size cap.
3. **Dispatcher case** in `src/lib/documents/extract.ts`.
4. **Prisma enums** — add the value to `SourceKind` (and `PreviewKind` if the preview is genuinely new), then migrate.
5. **Client registry** in `src/lib/sources/registry.ts`: label, icon, accent colour, accept string. The upload dialog's supported-formats grid renders from this array, so no dialog edit is needed.
6. **Preview component** only if `previewKind` is new — otherwise the dispatcher already handles it.
7. **Fixture** in `scripts/fixtures/` and a case in `scripts/verify-parsers.ts`.

If step 6 is empty and steps 1–5 are one-liners, the design is holding.

## Choosing a library

Prefer pure-JS, actively maintained, serverless-safe. Check the last publish date and whether it ships types before adding it. For zip-based formats (`.odt`, `.docx`, `.pptx`, `.xlsx`, `.epub`) you usually do not need a format-specific library at all — `fflate` to unzip plus `fast-xml-parser` to walk the XML is smaller and more predictable than an abandoned wrapper.

If no safe library exists and the format is simple enough to tokenize by hand, write the tokenizer and test it against fixtures. That is preferable to a 2019-vintage dependency with no types.

## Scanned documents and images

Formats with no embedded text go through vision-model extraction, not a text parser. A PDF whose extracted text is nearly empty across multiple pages is a scanned document — detect that and give the user a message telling them what to do instead, rather than indexing an empty string and silently producing a source that answers nothing.
