import { Skeleton } from "@/components/ui/skeleton";

export function ProjectWorkspaceSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
      <Skeleton className="hidden h-[calc(100vh-10rem)] rounded-3xl xl:block" />
      <Skeleton className="h-[calc(100vh-10rem)] rounded-3xl" />
      <Skeleton className="hidden h-[calc(100vh-10rem)] rounded-3xl xl:block" />
    </div>
  );
}
