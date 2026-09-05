export type MessageRole = "USER" | "ASSISTANT";

export interface ChatMessageSource {
  documentId: string;
  fileName: string;
  chunkIndex: number;
  score: number;
}

export interface AnswerCitation {
  marker: number; // the [n] shown inline, 1-based
  documentId: string;
  fileName: string;
  chunkIndex: number;
  score: number;
  quote: string; // short verbatim span from the chunk
}

export interface AnswerSection {
  heading: string;
  body: string; // markdown, may contain [n] citation markers
}

export type AnswerConfidence = "high" | "partial" | "not_found";

export interface AnswerPayload {
  lead: string; // one-sentence direct answer, may contain [n] markers
  sections: AnswerSection[];
  keyPoints: string[];
  citations: AnswerCitation[];
  followUps: string[]; // 2-3 suggested next questions
  confidence: AnswerConfidence;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  sources?: ChatMessageSource[] | null;
  blocks?: AnswerPayload | null;
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
