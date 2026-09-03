import { Bot, UserRound } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { MessageRole } from "@/types";

interface ChatMessageProps {
  role: MessageRole;
  content: string;
  createdAt: string;
  sources?: string[];
}

export function ChatMessage({
  role,
  content,
  createdAt,
  sources,
}: ChatMessageProps) {
  const isUser = role === "USER";

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div className={isUser ? "max-w-[80%]" : "max-w-[86%]"}>
        <div className={isUser ? "flex justify-end" : "flex items-start gap-3"}>
          {!isUser ? (
            <Avatar className="mt-1 size-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                <Bot className="size-4" />
              </AvatarFallback>
            </Avatar>
          ) : null}
          <Card
            className={
              isUser
                ? "rounded-3xl bg-primary px-4 py-3 text-primary-foreground"
                : "rounded-3xl px-4 py-3"
            }
          >
            <p className="whitespace-pre-wrap text-sm leading-6">{content}</p>
            <div
              className={
                isUser
                  ? "mt-3 text-right text-xs text-primary-foreground/80"
                  : "mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground"
              }
            >
              <span>
                {new Date(createdAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {!isUser && sources?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {sources.map((source) => (
                  <Badge
                    key={source}
                    variant="secondary"
                    className="rounded-full text-xs"
                  >
                    {source}
                  </Badge>
                ))}
              </div>
            ) : null}
          </Card>
          {isUser ? (
            <Avatar className="ml-3 mt-1 size-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <UserRound className="size-4" />
              </AvatarFallback>
            </Avatar>
          ) : null}
        </div>
      </div>
    </div>
  );
}
/**
 * CHAT MESSAGES
 *
 * Render the list of conversation messages.
 *
 * Responsibilities:
 * - Render messages in chronological order.
 * - Use ChatMessage for each message.
 * - Automatically scroll to the latest message when appropriate.
 * - Handle an empty conversation.
 *
 * The component should not perform API calls.
 *
 * Keep scrolling behavior smooth and avoid excessive
 * scroll operations.
 */


/**
 * CHAT MESSAGE
 *
 * Render a single USER or ASSISTANT message.
 *
 * Responsibilities:
 *
 * - Visually distinguish USER and ASSISTANT roles.
 * - Render message content safely.
 * - Display assistant source metadata when available.
 * - Show source file names in a compact UI.
 *
 * For MVP:
 * - Keep source display simple.
 * - Do not expose raw Qdrant payloads.
 *
 * If markdown rendering is used, ensure user content is
 * handled safely.
 */