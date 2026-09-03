export interface IngestionInput {
  documentId: string;
  projectId: string;
  userId: string;
  fileName: string;
  content: string;
}

export interface TextChunk {
  content: string;
  chunkIndex: number;
}

export interface QdrantPayload {
  userId: string;
  projectId: string;
  documentId: string;
  fileName: string;
  chunkIndex: number;
  content: string;
}

export interface RetrievalInput {
  query: string;
  projectId: string;
  userId: string;
  limit?: number;
}

export interface RetrievedChunkResult {
  content: string;
  score: number;
  documentId: string;
  fileName: string;
  chunkIndex: number;
}

export interface IngestionResult {
  documentId: string;
  projectId: string;
  userId: string;
  fileName: string;
  chunkCount: number;
}

export interface StoreDocumentVectorsInput {
  embeddings: number[][];
  chunks: TextChunk[];
  metadata: {
    userId: string;
    projectId: string;
    documentId: string;
    fileName: string;
  };
}

export interface SearchSimilarChunksInput {
  queryEmbedding: number[];
  userId: string;
  projectId: string;
  limit?: number;
}

export type SupportedRagFileExtension = "txt" | "md";
