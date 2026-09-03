"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0 && !isLoading;

  const sendMessage = () => {
    if (!canSend) {
      return;
    }

    onSendMessage(value.trim());
    setValue("");
  };

  return (
    <div className="space-y-3 border-t bg-background/95 p-4">
      <Textarea
        aria-label="Chat message"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
          }
        }}
        placeholder="Ask anything about your documents…"
        className="min-h-[110px] resize-none rounded-3xl"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Press Enter to send · Shift + Enter for a new line
        </p>
        <Button onClick={sendMessage} disabled={!canSend}>
          <Send className="size-4" />
          Send
        </Button>
      </div>
    </div>
  );
}

/**
 * CHAT INPUT
 *
 * Implement the message composer.
 *
 * Props should support:
 * - onSend(message)
 * - disabled
 * - isSending
 *
 * Responsibilities:
 *
 * - Maintain controlled input state.
 * - Trim input before sending.
 * - Prevent empty messages.
 * - Submit on Enter when appropriate.
 * - Support Shift + Enter for a new line.
 * - Disable submission while AI response generation is active.
 *
 * UX:
 * - Clear the input after successful submission.
 * - Keep the input accessible.
 * - Show a useful loading/send state.
 *
 * This component should not directly call backend routes.
 * The parent ChatContainer controls network requests.
 */