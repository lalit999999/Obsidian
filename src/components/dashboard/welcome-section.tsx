import { FileText, MessageSquareText, FolderKanban } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectStatistics, User } from "@/types";

interface WelcomeSectionProps {
  user: User;
  statistics: ProjectStatistics;
}

const stats = [
  { label: "Total projects", key: "totalProjects", icon: FolderKanban },
  { label: "Total documents", key: "totalDocuments", icon: FileText },
  { label: "Total chats", key: "totalChats", icon: MessageSquareText },
] as const;

export function WelcomeSection({ user, statistics }: WelcomeSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h2 className="text-2xl font-semibold tracking-tight">{user.name}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
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
    </section>
  );
}
// Create a welcome section for the dashboard.
//
// Include:
// - Greeting using mock user data.
// - Short explanation of the dashboard.
// - Project statistics using mock data.
//
// Example statistics:
// - Total Projects.
// - Total Documents.
// - Total Chats.
//
// Requirements:
// - Use shadcn Card components.
// - Use a responsive grid.
// - Use icons where appropriate.
//
// Important:
// All values come from mock data or derived frontend state.
