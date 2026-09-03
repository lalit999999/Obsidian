import Link from "next/link";
import { redirect } from "next/navigation";
import { Home, Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { signInWithGoogle } from "@/actions/auth/sign-in";
import { auth } from "@/auth";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const { error, callbackUrl } = await searchParams;

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
        <CardContent className="space-y-4">
          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              Sign-in failed. Please try again.
            </p>
          ) : null}

          <form action={signInWithGoogle.bind(null, callbackUrl)}>
            <GoogleSignInButton />
          </form>

          <Button variant="ghost" className="w-full" asChild>
            <Link href="/">
              <Home className="size-4" />
              Go to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
