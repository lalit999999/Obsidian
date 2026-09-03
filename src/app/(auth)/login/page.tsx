import { Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { signInWithGoogle } from "@/actions/auth/sign-in";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

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
          {error ? (
            <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              Sign-in failed. Please try again.
            </p>
          ) : null}

          <form action={signInWithGoogle}>
            <GoogleSignInButton />
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
