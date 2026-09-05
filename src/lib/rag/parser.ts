// The registry (src/lib/documents/registry.ts) now owns extension/MIME
// gatekeeping. This module keeps only the text-normalisation step, re-exported
// from the single canonical implementation in src/lib/documents/normalize.ts.
export { normalizeExtractedText as parseDocumentContent } from "@/lib/documents/normalize";
