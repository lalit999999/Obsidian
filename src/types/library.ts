import type { Document, SourceKind } from "@/types";

/** One card on the "By type" tab of the library. Returned for every
 *  SourceKind, including kinds the user has zero documents for. */
export interface LibraryTypeGroup {
  sourceKind: SourceKind;
  count: number;
  totalBytes: number;
  latestAt: string | null;
}

/** One card on the "By project" tab of the library. Returned for every
 *  project the user owns, including projects with zero documents. */
export interface LibraryProjectGroup {
  projectId: string;
  projectName: string;
  count: number;
  totalBytes: number;
  latestAt: string | null;
}

export interface LibraryDocument extends Document {
  projectName: string;
}

export interface LibraryDocumentPage {
  documents: LibraryDocument[];
  nextCursor: string | null;
}

export interface UserSettings {
  hydeEnabled: boolean;
  retrievalLimit: number;
}

export interface UserUsage {
  totalProjects: number;
  totalDocuments: number;
  totalChats: number;
  totalBytes: number;
}

export const RETRIEVAL_LIMIT_OPTIONS = [3, 5, 8, 12] as const;
export const MIN_RETRIEVAL_LIMIT = 3;
export const MAX_RETRIEVAL_LIMIT = 12;
export const LIBRARY_PAGE_SIZE = 50;
