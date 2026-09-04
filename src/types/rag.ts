export type SourceKindValue =
  | "TEXT"
  | "MARKDOWN"
  | "PDF"
  | "DOCX"
  | "RTF"
  | "ODT"
  | "IMAGE";

export type PreviewKindValue = "MARKDOWN" | "PLAIN" | "PDF" | "IMAGE";

export interface TextChunk {
  content: string;
  chunkIndex: number;
  page?: number;
}

export interface QdrantPayload {
  userId: string;
  projectId: string;
  documentId: string;
  fileName: string;
  sourceKind: SourceKindValue;
  chunkIndex: number;
  content: string;
  page?: number;
}

export interface IngestionInput {
  documentId: string;
  projectId: string;
  userId: string;
  fileName: string;
  sourceKind: SourceKindValue;
  content: string;
  pages?: string[];
}

export interface IngestionResult {
  documentId: string;
  chunkCount: number;
}

export interface RetrievalInput {
  query: string;
  projectId: string;
  userId: string;
  documentIds?: string[];
  limit?: number;
}

export interface RetrievedChunkResult {
  content: string;
  score: number;
  documentId: string;
  fileName: string;
  chunkIndex: number;
  page?: number;
}

export interface StoreDocumentVectorsInput {
  embeddings: number[][];
  chunks: TextChunk[];
  metadata: {
    userId: string;
    projectId: string;
    documentId: string;
    fileName: string;
    sourceKind: SourceKindValue;
  };
}

export interface SearchSimilarChunksInput {
  queryEmbedding: number[];
  userId: string;
  projectId: string;
  documentIds?: string[];
  limit?: number;
}
