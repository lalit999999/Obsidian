import { Bot, Sparkles } from "lucide-react";

const suggestions = [
  "Summarize my uploaded notes",
  "What is the event loop?",
  "Explain this topic simply",
];

interface ChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
  scopedDocumentCount?: number;
}

export function ChatEmptyState({
  onSelectPrompt,
  scopedDocumentCount = 0,
}: ChatEmptyStateProps) {
  const isScoped = scopedDocumentCount > 0;

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Bot className="size-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Start a conversation</h3>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          {isScoped ? (
            <>
              Ask questions scoped to the {scopedDocumentCount}{" "}
              {scopedDocumentCount === 1 ? "source" : "sources"} you&rsquo;ve
              selected in the panel.
            </>
          ) : (
            <>
              Ask questions about your notes, summarize a topic, or explore
              an idea with your project&rsquo;s documents.
            </>
          )}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSelectPrompt(suggestion)}
              className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Sparkles className="size-3.5 text-primary" />
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
