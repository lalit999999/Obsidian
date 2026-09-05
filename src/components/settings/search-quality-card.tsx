"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RETRIEVAL_LIMIT_OPTIONS } from "@/types/library";
import type { UserSettings } from "@/types/library";

interface SearchQualityCardProps {
  settings: UserSettings;
  pendingField: "hydeEnabled" | "retrievalLimit" | null;
  onChangeHyde: (value: boolean) => void;
  onChangeRetrievalLimit: (value: number) => void;
}

export function SearchQualityCard({
  settings,
  pendingField,
  onChangeHyde,
  onChangeRetrievalLimit,
}: SearchQualityCardProps) {
  const disabled = pendingField !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search quality</CardTitle>
        <CardDescription>
          How Obsidian searches your documents to answer questions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="hyde-toggle">
              Rewrite questions before searching
            </Label>
            <p className="text-xs text-muted-foreground">
              The assistant drafts a rough answer first and uses it to find
              better passages. Slightly slower.
            </p>
          </div>
          <Switch
            id="hyde-toggle"
            checked={settings.hydeEnabled}
            disabled={disabled}
            onCheckedChange={onChangeHyde}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="retrieval-limit">Passages per answer</Label>
          <p className="text-xs text-muted-foreground">
            How many passages to pull from your documents for each answer.
            More passages means better coverage and slower, costlier
            replies.
          </p>
          <Select
            value={String(settings.retrievalLimit)}
            disabled={disabled}
            onValueChange={(value) => onChangeRetrievalLimit(Number(value))}
          >
            <SelectTrigger id="retrieval-limit" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RETRIEVAL_LIMIT_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} passages
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
