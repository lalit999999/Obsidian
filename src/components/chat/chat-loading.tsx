import { Bot } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function ChatLoading() {
  return (
    <div className="flex items-start gap-3" aria-label="Assistant is responding">
      <Avatar className="mt-0.5 size-7 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary">
          <Bot className="size-3.5" />
        </AvatarFallback>
      </Avatar>
      <div className="flex h-7 items-center gap-1">
        <span className="size-1.5 rounded-full bg-muted-foreground motion-safe:animate-[typing-dot_1.2s_ease-in-out_infinite] motion-reduce:opacity-60" />
        <span className="size-1.5 rounded-full bg-muted-foreground motion-safe:animate-[typing-dot_1.2s_ease-in-out_0.15s_infinite] motion-reduce:opacity-60" />
        <span className="size-1.5 rounded-full bg-muted-foreground motion-safe:animate-[typing-dot_1.2s_ease-in-out_0.3s_infinite] motion-reduce:opacity-60" />
      </div>
    </div>
  );
}
