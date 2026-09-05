"use client";

import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { ChatMessageSource } from "@/types/chat";

interface NotFoundStateProps {
  lead: string;
  sources: ChatMessageSource[];
  isScoped: boolean;
  onWidenScope?: () => void;
}

export function NotFoundState({
  lead,
  sources,
  isScoped,
  onWidenScope,
}: NotFoundStateProps) {
  const searchedFileNames = Array.from(
    new Set(sources.map((source) => source.fileName)),
  );

  return (
    <Empty className="border py-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>Not found in your sources</EmptyTitle>
        <EmptyDescription>{lead}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {searchedFileNames.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Searched: {searchedFileNames.join(", ")}
          </p>
        ) : null}
        {isScoped && onWidenScope ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onWidenScope}
          >
            Search the whole project instead
          </Button>
        ) : null}
      </EmptyContent>
    </Empty>
  );
}
