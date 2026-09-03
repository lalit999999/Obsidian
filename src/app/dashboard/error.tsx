"use client";

import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-destructive/30 bg-card/95">
        <CardHeader className="items-center text-center">
          <TriangleAlert className="size-8 text-destructive" />
          <CardTitle className="mt-2">Couldn't load your dashboard</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
          <p>Something went wrong while fetching your projects.</p>
          <Button onClick={() => reset()}>Try again</Button>
        </CardContent>
      </Card>
    </div>
  );
}
