/**
 * SINGLE DOCUMENT API
 *
 * DELETE /api/documents/[documentId]
 *
 * Responsibilities:
 * 1. Authenticate the user.
 * 2. Find the document.
 * 3. Verify document.userId matches the authenticated user.
 * 4. Delete associated vectors from Qdrant using documentId.
 * 5. Delete the original Cloudinary asset using cloudinaryPublicId.
 * 6. Delete the PostgreSQL document record.
 *
 * Cleanup order should be considered carefully so failures
 * do not leave unnecessary orphaned resources.
 *
 * The endpoint should return a clear success response.
 *
 * Security:
 * Never trust documentId alone.
 * Always validate ownership.
 */