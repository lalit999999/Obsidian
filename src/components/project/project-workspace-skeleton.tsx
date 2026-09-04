import { Skeleton } from "@/components/ui/skeleton";

export function ProjectWorkspaceSkeleton() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b px-1">
        <Skeleton className="size-7 rounded-md" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="hidden h-4 flex-1 md:block" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex h-full min-h-0 gap-3">
        <Skeleton className="hidden min-h-0 rounded-lg lg:block lg:w-65" />
        <Skeleton className="min-h-0 flex-1 rounded-lg" />
        <Skeleton className="hidden min-h-0 rounded-lg lg:block lg:w-75" />
      </div>
    </div>
  );
}
