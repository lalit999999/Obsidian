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
// Create the message input component.
//
// Requirements:
// - Use a textarea.
// - Send button with an icon.
// - Support Enter to send.
// - Support Shift + Enter for a new line.
// - Disable sending when:
//   - input is empty.
//   - loading is true.
//
// Props:
// - onSendMessage.
// - isLoading.
//
// Important:
// - This component only handles input behavior.
// - The parent controls the actual message state.
//
// Use shadcn Textarea and Button.
