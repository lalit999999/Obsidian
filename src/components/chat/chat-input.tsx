"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const MIN_HEIGHT_PX = 40;
const MAX_HEIGHT_PX = 180;

export function ChatInput({
  onSendMessage,
  isLoading,
  disabled,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const canSend = value.trim().length > 0 && !isLoading && !disabled;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    const nextHeight = Math.min(
      Math.max(textarea.scrollHeight, MIN_HEIGHT_PX),
      MAX_HEIGHT_PX,
    );
    textarea.style.height = `${nextHeight}px`;
  }, [value]);

  const sendMessage = () => {
    if (!canSend) {
      return;
    }

    onSendMessage(value.trim());
    setValue("");
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-2 pb-4">
      <div className="flex items-end gap-2 rounded-lg border bg-background p-2 transition-shadow focus-within:ring-2 focus-within:ring-primary/30">
        <Textarea
          ref={textareaRef}
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
          rows={1}
          style={{ fieldSizing: "fixed" } as React.CSSProperties}
          className="min-h-0 resize-none overflow-y-auto border-0 bg-transparent px-1 py-1.5 shadow-none focus-visible:ring-0"
        />
        <Button
          size="icon"
          className="rounded-md"
          disabled={!canSend}
          onClick={sendMessage}
          aria-label="Send message"
        >
          {isLoading ? <Spinner className="size-4" /> : <ArrowUp className="size-4" />}
        </Button>
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        Enter to send · Shift+Enter for newline
      </p>
    </div>
  );
}
