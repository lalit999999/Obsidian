import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CTASection() {
  return (
    <section
      id="cta"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/15 via-background to-background p-0 shadow-xl shadow-primary/10">
        <div className="grid gap-10 p-8 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:p-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Start now
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Create your first knowledge base and ask better questions about
              your own notes.
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              The frontend MVP gives you a realistic product surface for
              projects, documents, chats, and account views. The rest can grow
              later.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/login">
                  Get started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border bg-background/70 p-6">
            <p className="text-sm font-medium text-muted-foreground">
              Why teams like it
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground">
              <li>• Keep every topic in its own project</li>
              <li>• Track document processing clearly</li>
              <li>• Use separate chats for separate questions</li>
              <li>• Stay fully frontend-first in Part 1</li>
            </ul>
          </div>
        </div>
      </Card>
    </section>
  );
}
// Create the final call-to-action section.
//
// Content:
// Encourage the user to create their first knowledge base
// and start chatting with their documents.
//
// Include:
// - Headline.
// - Short supporting text.
// - Primary button that navigates to /login.
//
// Design:
// - Make this section visually stronger than normal sections.
// - Use the pink theme prominently but professionally.
// - Use shadcn Button.
