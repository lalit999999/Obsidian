"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  error?: string | null;
}

export function ChatInput({
  onSendMessage,
  isLoading,
  disabled,
  error,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0 && !isLoading && !disabled;

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
        disabled={isLoading || disabled}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
          }
        }}
        placeholder="Ask anything about your documents…"
        className="min-h-27.5 resize-none rounded-3xl"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {isLoading
            ? "Waiting for the AI response…"
            : "Press Enter to send · Shift + Enter for a new line"}
        </p>
        <Button onClick={sendMessage} disabled={!canSend}>
          <Send className="size-4" />
          {isLoading ? "Sending" : "Send"}
        </Button>
      </div>
    </div>
  );
}
