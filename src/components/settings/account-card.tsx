import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CurrentUser } from "@/lib/auth";

interface AccountCardProps {
  user: CurrentUser;
}

export function AccountCard({ user }: AccountCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium">{user.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Your name and email come from Google and can't be changed here.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/profile">Go to profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
