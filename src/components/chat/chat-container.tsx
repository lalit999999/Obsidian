"use client";

import { MessageSquareText, PanelLeft, PanelRight, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { Chat, Document } from "@/types";
import type { ChatMessage } from "@/types/chat";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { ChatScopeBar } from "./chat-scope-bar";

interface ChatContainerProps {
  activeChat?: Chat;
  messages: ChatMessage[];
  isSending: boolean;
  isLoadingMessages?: boolean;
  messagesError?: string | null;
  onDismissMessagesError?: () => void;
  error: string | null;
  onRetry?: () => void;
  onSendMessage: (content: string) => void;
  onOpenChats?: () => void;
  onOpenDocuments?: () => void;
  onOpenSource?: (documentId: string, chunkIndex?: number) => void;
  disabled?: boolean;
  documents: Document[];
  selectedDocumentIds: string[];
  onClearScope: () => void;
}

export function ChatContainer({
  activeChat,
  messages,
  isSending,
  isLoadingMessages,
  messagesError,
  onDismissMessagesError,
  error,
  onRetry,
  onSendMessage,
  onOpenChats,
  onOpenDocuments,
  onOpenSource,
  disabled,
  documents,
  selectedDocumentIds,
  onClearScope,
}: ChatContainerProps) {
  const showEmptyState = messages.length === 0 && !isLoadingMessages;

  return (
    <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden border-border/80 bg-card/90 py-0">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <MessageSquareText className="size-4 text-muted-foreground" />
        <h2 className="truncate text-sm font-medium">
          {activeChat ? activeChat.title : "New chat"}
        </h2>
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          {onOpenChats ? (
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Open chats"
              onClick={onOpenChats}
            >
              <PanelLeft className="size-4" />
            </Button>
          ) : null}
          {onOpenDocuments ? (
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Open documents"
              onClick={onOpenDocuments}
            >
              <PanelRight className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {isLoadingMessages ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="size-5 text-muted-foreground" />
          </div>
        ) : showEmptyState ? (
          <ChatEmptyState
            onSelectPrompt={onSendMessage}
            scopedDocumentCount={selectedDocumentIds.length}
          />
        ) : (
          <ChatMessages
            messages={messages}
            isLoading={isSending}
            onOpenSource={onOpenSource}
            onSelectFollowUp={onSendMessage}
            isScoped={selectedDocumentIds.length > 0}
            onWidenScope={onClearScope}
          />
        )}
      </div>

      {messagesError ? (
        <div className="mx-auto flex w-full max-w-3xl shrink-0 items-center justify-between gap-3 px-4 pb-2 text-sm text-destructive">
          <span>{messagesError}</span>
          {onDismissMessagesError ? (
            <button
              type="button"
              onClick={onDismissMessagesError}
              aria-label="Dismiss error"
              className="shrink-0 text-destructive hover:opacity-70"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="mx-auto flex w-full max-w-3xl shrink-0 items-center justify-between gap-3 px-4 pb-2 text-sm text-destructive">
          <span>{error}</span>
          {onRetry ? (
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={onRetry}
            >
              <RotateCcw className="size-3.5" />
              Retry
            </Button>
          ) : null}
        </div>
      ) : null}

      <ChatScopeBar
        documents={documents}
        selectedDocumentIds={selectedDocumentIds}
        onClear={onClearScope}
        onOpenSource={onOpenSource}
      />
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isSending}
        disabled={disabled}
      />
    </Card>
  );
}
