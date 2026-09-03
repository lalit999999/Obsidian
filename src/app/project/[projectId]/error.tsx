"use client";

import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectError({
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
          <CardTitle className="mt-2">Couldn't load this project</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 text-center text-sm text-muted-foreground">
          <p>Something went wrong while fetching this project's data.</p>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="size-4" />
                Back to dashboard
              </Link>
            </Button>
            <Button onClick={() => reset()}>Try again</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
