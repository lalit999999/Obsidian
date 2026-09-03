/**
 * Define all shared TypeScript types and interfaces used by the RAG pipeline.
 *
 * Include types for:
 *
 * 1. Document ingestion input:
 *    - documentId
 *    - projectId
 *    - userId
 *    - fileName
 *    - content
 *
 * 2. Parsed or generated text chunks:
 *    - content
 *    - chunkIndex
 *
 * 3. Qdrant payload:
 *    - userId
 *    - projectId
 *    - documentId
 *    - fileName
 *    - chunkIndex
 *    - content
 *
 * 4. Retrieval input:
 *    - query
 *    - projectId
 *    - userId
 *    - optional limit
 *
 * 5. Retrieved chunk result:
 *    - content
 *    - score
 *    - documentId
 *    - fileName
 *    - chunkIndex
 *
 * Keep this file focused only on shared RAG data structures.
 */