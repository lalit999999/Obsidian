export const RAG_COLLECTION_NAME = "knowledge_base";

export const RAG_CHUNK_SIZE = 1000;
export const RAG_CHUNK_OVERLAP = 150;

export const RAG_DEFAULT_RETRIEVAL_LIMIT = 5;
export const RAG_EMBEDDING_BATCH_SIZE = 8;

export const RAG_EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";

export const RAG_EMBEDDING_DIMENSIONS: Record<string, number> = {
  "text-embedding-3-small": 1536,
  "text-embedding-3-large": 3072,
};
