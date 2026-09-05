"use client";

import { useState } from "react";
import { Bot, Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Markdown } from "@/components/ui/markdown";
import { AnswerLead } from "@/components/chat/blocks/answer-lead";
import { AnswerSections } from "@/components/chat/blocks/answer-sections";
import { CitationProvider } from "@/components/chat/citation-context";
import { FollowUps } from "@/components/chat/blocks/follow-ups";
import { KeyPoints } from "@/components/chat/blocks/key-points";
import { NotFoundState } from "@/components/chat/blocks/not-found-state";
import { SourceFooter } from "@/components/chat/blocks/source-footer";
import type { AnswerPayload, ChatMessageSource } from "@/types/chat";
import type { MessageRole } from "@/types";

interface ChatMessageProps {
  role: MessageRole;
  content: string;
  createdAt: string;
  sources?: ChatMessageSource[] | null;
  blocks?: AnswerPayload | null;
  onOpenSource?: (documentId: string, chunkIndex?: number) => void;
  onSelectFollowUp?: (question: string) => void;
  isScoped?: boolean;
  onWidenScope?: () => void;
}

export function ChatMessage({
  role,
  content,
  createdAt,
  sources,
  blocks,
  onOpenSource,
  onSelectFollowUp,
  isScoped = false,
  onWidenScope,
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

  const handleOpenSource = (documentId: string, chunkIndex: number) => {
    onOpenSource?.(documentId, chunkIndex);
  };

  return (
    <div className="group flex items-start gap-3">
      <Avatar className="mt-0.5 size-7 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary">
          <Bot className="size-3.5" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        {blocks ? (
          <CitationProvider
            citations={blocks.citations}
            onOpenSource={handleOpenSource}
          >
            <div className="space-y-4">
              {blocks.confidence === "not_found" ? (
                <NotFoundState
                  lead={blocks.lead}
                  sources={sources ?? []}
                  isScoped={isScoped}
                  onWidenScope={onWidenScope}
                />
              ) : (
                <>
                  <AnswerLead lead={blocks.lead} />
                  <AnswerSections sections={blocks.sections} />
                  <KeyPoints keyPoints={blocks.keyPoints} />
                </>
              )}
            </div>
          </CitationProvider>
        ) : (
          <Markdown content={content} />
        )}

        {blocks?.confidence !== "not_found" ? (
          <SourceFooter sources={sources ?? []} onOpenSource={onOpenSource} />
        ) : null}

        {blocks?.followUps.length ? (
          <FollowUps
            followUps={blocks.followUps}
            onSelect={(question) => onSelectFollowUp?.(question)}
          />
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
