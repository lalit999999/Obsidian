import { Bot, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const suggestions = [
  "Summarize my uploaded notes",
  "What is the event loop?",
  "Explain this topic simply",
];

interface ChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export function ChatEmptyState({ onSelectPrompt }: ChatEmptyStateProps) {
  return (
    <div className="flex h-full min-h-105 items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-dashed border-border/80 bg-card/80 p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <Bot className="size-7" />
        </div>
        <h3 className="mt-5 text-2xl font-semibold">Start a conversation</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Ask questions about your notes, summarize a topic, or explore an idea
          with your project’s documents.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              onClick={() => onSelectPrompt(suggestion)}
            >
              <Sparkles className="size-4 text-primary" />
              {suggestion}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
