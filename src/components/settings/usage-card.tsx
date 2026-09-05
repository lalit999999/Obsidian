import {
  FileText,
  FolderKanban,
  HardDrive,
  MessageSquareText,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes } from "@/lib/format";
import type { UserUsage } from "@/types/library";

interface UsageCardProps {
  usage: UserUsage;
}

const ITEMS = [
  { label: "Projects", key: "totalProjects" as const, icon: FolderKanban },
  { label: "Documents", key: "totalDocuments" as const, icon: FileText },
  { label: "Chats", key: "totalChats" as const, icon: MessageSquareText },
] as const;

export function UsageCard({ usage }: UsageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-4">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="size-3.5" />
                  {item.label}
                </div>
                <p className="text-xl font-semibold tracking-tight">
                  {usage[item.key]}
                </p>
              </div>
            );
          })}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <HardDrive className="size-3.5" />
              Storage
            </div>
            <p className="text-xl font-semibold tracking-tight">
              {formatBytes(usage.totalBytes)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
