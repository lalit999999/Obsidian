"use client";

import { Button } from "@/components/ui/button";

interface FollowUpsProps {
  followUps: string[];
  onSelect: (question: string) => void;
}

export function FollowUps({ followUps, onSelect }: FollowUpsProps) {
  if (followUps.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {followUps.map((question, index) => (
        <Button
          key={index}
          type="button"
          variant="outline"
          size="sm"
          className="h-auto min-w-0 max-w-full shrink rounded-full px-2.5 py-1 text-left whitespace-normal"
          onClick={() => onSelect(question)}
        >
          {question}
        </Button>
      ))}
    </div>
  );
}
