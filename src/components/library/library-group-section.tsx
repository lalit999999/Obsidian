"use client";

import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

interface LibraryGroupSectionProps<T> {
  groups: T[] | null;
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
  isEmpty: (groups: T[]) => boolean;
  emptyTitle: string;
  emptyDescription: string;
  renderCard: (group: T) => ReactNode;
  getKey: (group: T) => string;
  skeletonCount?: number;
}

export function LibraryGroupSection<T>({
  groups,
  error,
  isLoading,
  onRetry,
  isEmpty,
  emptyTitle,
  emptyDescription,
  renderCard,
  getKey,
  skeletonCount = 6,
}: LibraryGroupSectionProps<T>) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Couldn't load your library</EmptyTitle>
          <EmptyDescription>{error}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onRetry}>Retry</Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (!groups || isEmpty(groups)) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <div key={getKey(group)}>{renderCard(group)}</div>
      ))}
    </div>
  );
}
