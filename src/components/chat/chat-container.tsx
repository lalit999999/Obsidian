"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Chat } from "@/types";
import type { ChatMessage, SendMessageResponse } from "@/types/chat";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";

interface ChatContainerProps {
  activeChat?: Chat;
  messages: ChatMessage[];
  projectId: string;
  onSendMessage?: (message: string) => void;
  onChatUpdated?: (chatId: string, title: string) => void;
  onPromptSelect: (prompt: string) => void;
  onOpenChats?: () => void;
  onOpenDocuments?: () => void;
}

export function ChatContainer({
  activeChat,
  messages,
  projectId,
  onSendMessage,
  onChatUpdated,
  onPromptSelect,
  onOpenChats,
  onOpenDocuments,
}: ChatContainerProps) {
  const [localMessages, setLocalMessages] = useState(messages);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages, activeChat?.id]);

  const sendMessage = async (content: string) => {
    if (!activeChat || isSending) {
      return;
    }

    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    setIsSending(true);
    setError(null);

    const temporaryUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      chatId: activeChat.id,
      role: "USER",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setLocalMessages((current) => [...current, temporaryUserMessage]);

    try {
      const response = await fetch(`/api/chats/${activeChat.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: trimmed }),
      });

      const payload = (await response.json()) as
        | SendMessageResponse
        | { success: false; error?: { message?: string } };

      if (!response.ok || !payload.success) {
        throw new Error(
          !response.ok
            ? payload && "error" in payload && payload.error?.message
              ? payload.error.message
              : "Failed to send message."
            : "Failed to send message.",
        );
      }

      setLocalMessages((current) => {
        const withoutTemp = current.filter(
          (message) => message.id !== temporaryUserMessage.id,
        );
        return [
          ...withoutTemp,
          payload.data.userMessage,
          payload.data.assistantMessage,
        ];
      });

      if (activeChat.title === "New chat") {
        onChatUpdated?.(activeChat.id, trimmed.slice(0, 120));
      }

      onSendMessage?.(trimmed);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
      setLocalMessages((current) =>
        current.filter((message) => message.id !== temporaryUserMessage.id),
      );
    } finally {
      setIsSending(false);
    }
  };

  const showEmptyState = !activeChat || localMessages.length === 0;

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
          <ChatMessages
            messages={localMessages}
            isLoading={isSending}
            onPromptSelect={onPromptSelect}
          />
        )}
      </div>

      {error ? (
        <div className="border-t px-4 pt-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <ChatInput
        onSendMessage={sendMessage}
        isLoading={isSending}
        error={error}
      />
    </Card>
  );
}
