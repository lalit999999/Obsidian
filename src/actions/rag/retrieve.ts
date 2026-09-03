/**
 * Orchestrate the RAG retrieval pipeline.
 *
 * Input:
 * - user query
 * - userId
 * - projectId
 * - optional result limit
 *
 * Pipeline:
 *
 * user question
 *      ↓
 * validate query
 *      ↓
 * generate query embedding
 *      ↓
 * search Qdrant
 *      ↓
 * filter by userId and projectId
 *      ↓
 * return top relevant chunks
 *
 * The default MVP retrieval limit is 5.
 *
 * Return structured results containing:
 * - content
 * - similarity score
 * - documentId
 * - fileName
 * - chunkIndex
 *
 * This module only retrieves knowledge.
 *
 * It does NOT:
 * - generate an AI answer
 * - build an AI prompt
 * - manage chats
 * - store messages
 *
 * Part 3 will call this function and use the returned chunks as AI context.
 */