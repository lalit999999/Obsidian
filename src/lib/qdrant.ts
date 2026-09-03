/**
 * Create and export one shared Qdrant client.
 *
 * Read the Qdrant URL and optional API key from environment variables.
 * The default development URL should support the local Docker container.
 *
 * Do not create multiple Qdrant clients across the application.
 * Other RAG modules should import this shared client.
 */