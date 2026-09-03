import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section
      id="cta"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="flex flex-col items-start gap-6 rounded-lg border border-border bg-card p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
            Create your first project.
          </h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Upload a few documents and ask your first question in under a
            minute.
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/login">Get started</Link>
        </Button>
      </div>
    </section>
  );
}
