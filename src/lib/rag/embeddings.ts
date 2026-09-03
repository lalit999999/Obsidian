/**
 * Generate vector embeddings using the shared OpenAI client.
 *
 * Accept multiple text inputs and return embeddings in the same order
 * as the provided texts.
 *
 * Implement batching so a large document does not make one API request
 * per chunk.
 *
 * Responsibilities:
 * - validate non-empty text input
 * - split large input arrays into batches
 * - call the configured OpenAI embedding model
 * - preserve input/output ordering
 * - return numeric vectors
 *
 * Do not store vectors in Qdrant here.
 * This module is responsible only for embedding generation.
 */