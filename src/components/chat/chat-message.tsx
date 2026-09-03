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
// Create a reusable chat message component.
//
// Props:
// - role: USER | ASSISTANT.
// - content.
// - createdAt.
// - optional sources.
//
// Requirements:
// - Visually distinguish user and assistant messages.
// - User messages should be aligned differently from assistant messages.
// - Support multiline text.
// - Add a simple timestamp if useful.
//
// For assistant messages:
// - Optionally render mock source citations.
// - Do not implement actual RAG citation logic.
//
// Use:
// - shadcn Avatar if useful.
// - shadcn Card or clean styled containers.
//
// Design:
// - User messages can use the pink primary accent.
// - Assistant messages should remain neutral and readable.
