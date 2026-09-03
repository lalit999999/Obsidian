"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit =
    email.trim().length > 0 && password.trim().length > 0 && !isLoading;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsLoading(true);
    window.setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-xl shadow-primary/5">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-3xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <CardTitle className="mt-4 text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your Obsidian AI workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-10"
                  placeholder="maya@obsidian.ai"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {isLoading ? "Signing in…" : "Login"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              or
            </span>
            <Separator className="flex-1" />
          </div>

          <Button variant="outline" className="w-full" type="button">
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
// Build the login page UI.
//
// This is frontend-only for Part 1.
//
// Requirements:
// - Center a login card on the page.
// - Display application branding.
// - Add email input.
// - Add password input.
// - Add a login button.
// - Add an optional "Continue with Google" button as a visual placeholder.
// - Add loading/disabled UI states if useful.
//
// Behavior for frontend MVP:
// - Do not implement real authentication.
// - On successful mock login, navigate to /dashboard.
//
// Use:
// - shadcn Card.
// - shadcn Input.
// - shadcn Label.
// - shadcn Button.
// - shadcn Separator if useful.
//
// Design:
// - Modern authentication page.
// - Pink primary action.
// - Responsive and accessible.
