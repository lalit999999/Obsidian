"use client";

import { useState } from "react";
import { Bot, Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import type { ChatMessageSource } from "@/types/chat";
import type { MessageRole } from "@/types";

interface ChatMessageProps {
  role: MessageRole;
  content: string;
  createdAt: string;
  sources?: ChatMessageSource[] | null;
  onOpenSource?: (documentId: string) => void;
}

export function ChatMessage({
  role,
  content,
  createdAt,
  sources,
  onOpenSource,
}: ChatMessageProps) {
  const isUser = role === "USER";
  const [copied, setCopied] = useState(false);

  const timeLabel = new Date(createdAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy message");
    }
  };

  if (isUser) {
    return (
      <div className="group flex justify-end">
        <div className="max-w-[80%]">
          <div className="rounded-lg rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-6 whitespace-pre-wrap text-primary-foreground">
            {content}
          </div>
          <div className="mt-1 flex justify-end">
            <span className="text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {timeLabel}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-3">
      <Avatar className="mt-0.5 size-7 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary">
          <Bot className="size-3.5" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <Markdown content={content} />

        {sources?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {sources.map((source) => (
              <Badge
                key={`${source.documentId}:${source.chunkIndex}`}
                asChild
                variant="secondary"
                className="cursor-pointer rounded-full text-xs hover:bg-secondary/80"
              >
                <button
                  type="button"
                  onClick={() => onOpenSource?.(source.documentId)}
                >
                  {source.fileName} · #{source.chunkIndex + 1}
                </button>
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-1.5 flex items-center gap-2.5 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="text-[11px] text-muted-foreground">
            {timeLabel}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy message"
            className="rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}
