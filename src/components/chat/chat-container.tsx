"use client";

import { useEffect, useMemo, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Chat, Message } from "@/types";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatInput } from "./chat-input";
import { ChatLoading } from "./chat-loading";
import { ChatMessage } from "./chat-message";

interface ChatContainerProps {
  activeChat?: Chat;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onPromptSelect: (prompt: string) => void;
  onOpenChats?: () => void;
  onOpenDocuments?: () => void;
}

export function ChatContainer({
  activeChat,
  messages,
  isLoading,
  onSendMessage,
  onPromptSelect,
  onOpenChats,
  onOpenDocuments,
}: ChatContainerProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  const showEmptyState = !activeChat || messages.length === 0;

  return (
    <Card className="flex h-full min-h-[calc(100vh-10rem)] flex-col overflow-hidden border-border/80 bg-card/90">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-4">
        <div>
          <p className="text-sm text-muted-foreground">AI chat</p>
          <h2 className="text-lg font-semibold">
            {activeChat ? activeChat.title : "Select a chat"}
          </h2>
        </div>
        <div className="flex items-center gap-2 xl:hidden">
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

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {showEmptyState ? (
          <ChatEmptyState onSelectPrompt={onPromptSelect} />
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                createdAt={message.createdAt}
                sources={message.sources}
              />
            ))}
            {isLoading ? <ChatLoading /> : null}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </Card>
  );
}
/**
 * CHAT CONTAINER
 *
 * This is the main client-side chat controller.
 *
 * Responsibilities:
 *
 * - Receive projectId and active chat information.
 * - Manage optimistic/local message state.
 * - Manage sending state.
 * - Call the AI message API.
 * - Display loading state while the AI responds.
 * - Handle API errors.
 * - Update messages after successful responses.
 *
 * Important state:
 *
 * messages
 * isSending
 * error
 *
 * Send flow:
 *
 * User submits
 *      ↓
 * Add temporary user message to UI
 *      ↓
 * Clear input
 *      ↓
 * Set isSending = true
 *      ↓
 * POST to message API
 *      ↓
 * Receive assistant response
 *      ↓
 * Add persisted response to UI
 *      ↓
 * Set isSending = false
 *
 * Prevent duplicate sends while a request is active.
 *
 * Compose:
 * - ChatMessages
 * - ChatLoading
 * - ChatInput
 *
 * Handle the case where no chat is currently selected.
 */