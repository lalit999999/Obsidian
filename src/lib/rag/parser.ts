/**
 * Handle text extraction for documents entering the RAG pipeline.
 *
 * MVP supported file types:
 * - .txt
 * - .md
 *
 * The input is the document content already received by the backend.
 * For this MVP, both formats can be treated primarily as text.
 *
 * Markdown should not require complex parsing or HTML conversion.
 * Preserve useful Markdown text and structure.
 *
 * Return clean text suitable for chunking.
 *
 * Keep this module independent from:
 * - database logic
 * - Cloudinary
 * - Qdrant
 * - OpenAI
 */