/**
 * Provide reusable Qdrant vector database operations.
 *
 * Responsibilities:
 *
 * 1. Store vectors:
 *    - accept embeddings with their chunk metadata
 *    - ensure the knowledge_base collection exists
 *    - create deterministic point IDs based on documentId and chunkIndex
 *    - upsert points to avoid duplicate vectors during repeated ingestion
 *
 * 2. Search vectors:
 *    - accept a query embedding
 *    - filter strictly by userId and projectId
 *    - return the highest scoring chunks
 *    - include content and source metadata in the result
 *
 * 3. Delete document vectors:
 *    - delete every vector whose payload matches documentId
 *    - this function will later be used by the Part 3 document deletion flow
 *
 * Keep all direct Qdrant query logic inside this module.
 */