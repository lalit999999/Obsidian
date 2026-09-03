import { CalendarDays, Mail } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/types";

interface ProfileInformationProps {
  user: User;
}

export function ProfileInformation({ user }: ProfileInformationProps) {
  return (
    <Card className="border-border/80 bg-card/90">
      <CardHeader>
        <CardTitle>Profile information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? user.email} />
            <AvatarFallback>
              {(user.name ?? user.email).slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xl font-semibold">{user.name ?? "Unnamed"}</p>
            <p className="text-sm text-muted-foreground">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Mail className="size-4 text-primary" />
              Email
            </div>
            <p className="mt-2 text-sm">{user.email}</p>
          </div>
          <div className="rounded-3xl border bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="size-4 text-primary" />
              Created
            </div>
            <p className="mt-2 text-sm">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
