/**
 * PROJECT DOCUMENT API
 *
 * Implement document operations for a specific project.
 *
 * GET /api/projects/[projectId]/documents
 *
 * Responsibilities:
 * 1. Authenticate the user.
 * 2. Verify ownership of the project.
 * 3. Return documents belonging to this project.
 * 4. Order documents by createdAt descending.
 *
 * POST /api/projects/[projectId]/documents
 *
 * This endpoint connects the frontend upload flow with
 * the existing Part 2 RAG ingestion pipeline.
 *
 * Responsibilities:
 * 1. Authenticate the user.
 * 2. Verify project ownership.
 * 3. Read multipart form data.
 * 4. Validate the uploaded file.
 * 5. Allow only:
 *    - .md
 *    - .txt
 * 6. Call the existing ingestion pipeline.
 *
 * The ingestion pipeline is responsible for:
 * - Cloudinary upload
 * - Document database record
 * - Status updates
 * - Text extraction
 * - Chunking
 * - Embeddings
 * - Qdrant storage
 *
 * Do not duplicate RAG implementation here.
 * Reuse the existing ingest action/function from Part 2.
 *
 * Return useful document data including:
 * - id
 * - fileName
 * - status
 * - chunkCount
 * - error when applicable
 */