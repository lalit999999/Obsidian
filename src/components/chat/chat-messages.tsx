"use client";

import { useEffect, useRef } from "react";

import type { ChatMessage } from "@/types/chat";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatLoading } from "./chat-loading";
import { ChatMessage as ChatMessageView } from "./chat-message";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onPromptSelect: (prompt: string) => void;
}

export function ChatMessages({
  messages,
  isLoading,
  onPromptSelect,
}: ChatMessagesProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return <ChatEmptyState onSelectPrompt={onPromptSelect} />;
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <ChatMessageView
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
  );
}
