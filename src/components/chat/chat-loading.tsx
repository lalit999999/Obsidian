import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChatLoading() {
  return (
    <div className="flex justify-start py-3">
      <Card className="max-w-[80%] rounded-3xl bg-card px-4 py-3 shadow-sm">
        <div className="space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 max-w-full" style={{ width: 280 }} />
          <Skeleton className="h-3 max-w-full" style={{ width: 220 }} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Thinking…</p>
      </Card>
    </div>
  );
}
