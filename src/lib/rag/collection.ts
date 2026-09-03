/**
 * Manage initialization of the Qdrant knowledge_base collection.
 *
 * Export a reusable function that ensures the collection exists before
 * vectors are stored.
 *
 * Responsibilities:
 * - check whether the collection already exists
 * - create it only when missing
 * - configure the correct vector size for the selected embedding model
 * - configure cosine similarity
 *
 * The function should be safe to call multiple times.
 *
 * Do not delete or recreate an existing collection automatically.
 */