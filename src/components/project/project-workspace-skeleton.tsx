import { Skeleton } from "@/components/ui/skeleton";

export function ProjectWorkspaceSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="shrink-0 space-y-3 border-b border-border/60 pb-5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <Skeleton className="hidden min-h-0 rounded-3xl lg:block lg:w-80" />
        <Skeleton className="min-h-0 flex-1 rounded-3xl" />
        <Skeleton className="hidden min-h-0 rounded-3xl lg:block lg:w-85" />
      </div>
    </div>
  );
}
