"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { ChatLoading } from "./chat-loading";
import { ChatMessage as ChatMessageView } from "./chat-message";

interface ChatMessagesProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  onOpenSource?: (documentId: string) => void;
}

const NEAR_BOTTOM_THRESHOLD_PX = 100;

export function ChatMessages({
  messages,
  isLoading,
  onOpenSource,
}: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  const isNearBottom = () => {
    const container = containerRef.current;
    if (!container) {
      return true;
    }
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      NEAR_BOTTOM_THRESHOLD_PX
    );
  };

  useEffect(() => {
    const shouldStickToBottom = isFirstRender.current || isNearBottom();

    if (shouldStickToBottom) {
      endRef.current?.scrollIntoView({
        behavior: isFirstRender.current ? "auto" : "smooth",
        block: "end",
      });
      setShowJumpToLatest(false);
    } else {
      setShowJumpToLatest(true);
    }

    isFirstRender.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading]);

  const jumpToLatest = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setShowJumpToLatest(false);
  };

  return (
    <div
      ref={containerRef}
      onScroll={() => setShowJumpToLatest(!isNearBottom())}
      className="relative h-full overflow-y-auto"
    >
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
        {messages.map((message) => (
          <ChatMessageView
            key={message.id}
            role={message.role}
            content={message.content}
            createdAt={message.createdAt}
            sources={message.sources}
            onOpenSource={onOpenSource}
          />
        ))}
        {isLoading ? <ChatLoading /> : null}
        <div ref={endRef} />
      </div>

      {showJumpToLatest ? (
        <Button
          size="sm"
          variant="outline"
          onClick={jumpToLatest}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background shadow-md"
        >
          <ArrowDown className="size-3.5" />
          Jump to latest
        </Button>
      ) : null}
    </div>
  );
}
