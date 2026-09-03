import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChatLoading() {
  return (
    <div className="flex justify-start py-3">
      <Card className="max-w-[80%] rounded-3xl bg-card px-4 py-3 shadow-sm">
        <div className="space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-[280px] max-w-full" />
          <Skeleton className="h-3 w-[220px] max-w-full" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Thinking…</p>
      </Card>
    </div>
  );
}


/**
 * CHAT LOADING
 *
 * Render the assistant response loading indicator.
 *
 * This component is displayed after the user message
 * while the backend is:
 *
 * - retrieving RAG context
 * - generating the AI response
 *
 * Keep the loading UI lightweight and consistent with
 * the application's shadcn-based design.
 *
 * Do not use fake generated text as the final answer.
 */