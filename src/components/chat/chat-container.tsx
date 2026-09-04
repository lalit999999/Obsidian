"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Chat } from "@/types";
import type { ChatMessage } from "@/types/chat";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";

interface ChatContainerProps {
  activeChat?: Chat;
  messages: ChatMessage[];
  isSending: boolean;
  error: string | null;
  onSendMessage: (content: string) => void;
  onOpenChats?: () => void;
  onOpenDocuments?: () => void;
  disabled?: boolean;
}

export function ChatContainer({
  activeChat,
  messages,
  isSending,
  error,
  onSendMessage,
  onOpenChats,
  onOpenDocuments,
  disabled,
}: ChatContainerProps) {
  const showEmptyState = messages.length === 0;

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden border-border/80 bg-card/90">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-4">
        <div>
          <p className="text-sm text-muted-foreground">AI chat</p>
          <h2 className="text-lg font-semibold">
            {activeChat ? activeChat.title : "New chat"}
          </h2>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          {onOpenChats ? (
            <Button variant="outline" size="sm" onClick={onOpenChats}>
              Chats
            </Button>
          ) : null}
          {onOpenDocuments ? (
            <Button variant="outline" size="sm" onClick={onOpenDocuments}>
              Documents
            </Button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        {showEmptyState ? (
          <ChatEmptyState onSelectPrompt={onSendMessage} />
        ) : (
          <ChatMessages
            messages={messages}
            isLoading={isSending}
            onPromptSelect={onSendMessage}
          />
        )}
      </div>

      {error ? (
        <div className="shrink-0 border-t px-4 pt-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <div className="shrink-0">
        <ChatInput
          onSendMessage={onSendMessage}
          isLoading={isSending}
          error={error}
          disabled={disabled}
        />
      </div>
    </Card>
  );
}
