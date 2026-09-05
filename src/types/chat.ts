export type MessageRole = "USER" | "ASSISTANT";

export interface ChatMessageSource {
  documentId: string;
  fileName: string;
  chunkIndex: number;
  score: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  sources?: ChatMessageSource[] | null;
  createdAt: string;
}

export interface ChatListItem {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

export interface ChatWithMessages extends ChatListItem {
  messages: ChatMessage[];
}

export interface SendMessageRequest {
  content: string;
  documentIds?: string[];
}

export interface SendMessageResponse {
  success: true;
  data: {
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    sources: ChatMessageSource[];
    scopedDocumentIds: string[];
  };
}
