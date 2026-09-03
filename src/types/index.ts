export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  userId: string;
  documentCount: number;
  chatCount: number;
  createdAt: string;
  updatedAt: string;
}

export const DOCUMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "READY",
  "FAILED",
] as const;

export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export interface Document {
  id: string;
  projectId: string;
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  error?: string | null;
  chunkCount: number;
  createdAt: string;
}

export interface Chat {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export const MESSAGE_ROLES = ["USER", "ASSISTANT"] as const;

export type MessageRole = (typeof MESSAGE_ROLES)[number];

export * from "./chat";
export * from "./api";

export interface Message {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  sources?: import("./chat").ChatMessageSource[] | null;
  createdAt: string;
}

export interface ProjectStatistics {
  totalProjects: number;
  totalDocuments: number;
  totalChats: number;
}
