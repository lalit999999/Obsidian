import type { ChatMessageSource } from "@/types/chat";
import type { DocumentStatus, MessageRole, PreviewKind, SourceKind } from "@/types";

export function toIsoString(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

export function serializeProject(project: {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { documents?: number; chats?: number };
}) {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? "",
    userId: project.userId,
    documentCount: project._count?.documents ?? 0,
    chatCount: project._count?.chats ?? 0,
    createdAt: toIsoString(project.createdAt),
    updatedAt: toIsoString(project.updatedAt),
  };
}

export function serializeChat(chat: {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  documentIds: string[];
  createdAt: Date;
  updatedAt: Date;
  _count?: { messages?: number };
}) {
  return {
    id: chat.id,
    projectId: chat.projectId,
    userId: chat.userId,
    title: chat.title,
    documentIds: chat.documentIds,
    createdAt: toIsoString(chat.createdAt),
    updatedAt: toIsoString(chat.updatedAt),
    messageCount: chat._count?.messages ?? 0,
  };
}

export function serializeDocument(document: {
  id: string;
  projectId: string;
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  sourceKind: SourceKind;
  previewKind: PreviewKind;
  pageCount: number | null;
  textTruncated: boolean;
  status: DocumentStatus;
  error: string | null;
  chunkCount: number;
  createdAt: Date;
  processedAt: Date | null;
}) {
  return {
    id: document.id,
    projectId: document.projectId,
    userId: document.userId,
    fileName: document.fileName,
    fileSize: document.fileSize,
    mimeType: document.mimeType,
    cloudinaryUrl: document.cloudinaryUrl,
    cloudinaryPublicId: document.cloudinaryPublicId,
    sourceKind: document.sourceKind,
    previewKind: document.previewKind,
    pageCount: document.pageCount,
    textTruncated: document.textTruncated,
    status: document.status,
    error: document.error,
    chunkCount: document.chunkCount,
    createdAt: toIsoString(document.createdAt),
    processedAt: document.processedAt
      ? toIsoString(document.processedAt)
      : null,
  };
}

export function serializeMessage(message: {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  sources: unknown;
  createdAt: Date;
}) {
  return {
    id: message.id,
    chatId: message.chatId,
    role: message.role,
    content: message.content,
    sources: (message.sources ?? null) as ChatMessageSource[] | null,
    createdAt: toIsoString(message.createdAt),
  };
}
