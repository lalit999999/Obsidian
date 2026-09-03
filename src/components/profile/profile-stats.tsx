import { FileText, MessageSquareText, FolderKanban } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectStatistics } from "@/types";

interface ProfileStatsProps {
  statistics: ProjectStatistics;
}

const stats = [
  { label: "Projects", key: "totalProjects", icon: FolderKanban },
  { label: "Documents", key: "totalDocuments", icon: FileText },
  { label: "Chats", key: "totalChats", icon: MessageSquareText },
] as const;

export function ProfileStats({ statistics }: ProfileStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const value = statistics[stat.key];

        return (
          <Card key={stat.label} className="border-border/80 bg-card/85">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <Icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
