/**
 * Central configuration for the MVP RAG pipeline.
 *
 * Keep all reusable RAG constants here to avoid magic numbers.
 *
 * Include:
 * - Qdrant collection name: knowledge_base
 * - chunk size: approximately 1000 characters
 * - chunk overlap: approximately 150 characters
 * - default retrieval limit: 5
 * - embedding batch size
 *
 * Other RAG modules should import configuration from this file.
 */