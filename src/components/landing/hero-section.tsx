import Link from "next/link";
import {
  ArrowRight,
  FileText,
  MessageSquare,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const previewItems = [
  { label: "JavaScript Notes", docs: 4, chats: 3 },
  { label: "Redis Knowledge Base", docs: 3, chats: 2 },
  { label: "AI Learning Notes", docs: 2, chats: 1 },
];

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
      <div className="flex flex-col justify-center">
        <Badge className="mb-5 w-fit border-primary/15 bg-primary/10 text-primary">
          AI knowledge base for your notes
        </Badge>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Turn Markdown notes into a searchable knowledge base you can chat
          with.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Upload your .md and .txt documents, organize them into projects, and
          ask an AI assistant about everything you’ve already written. Obsidian
          AI keeps the interface crisp, fast, and focused on the work.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/login">
              Get started
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#features">View features</a>
          </Button>
        </div>

        <div className="mt-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-2xl border bg-card px-3 py-2">
            <FileText className="size-4 text-primary" />
            Markdown + text support
          </div>
          <div className="flex items-center gap-2 rounded-2xl border bg-card px-3 py-2">
            <MessageSquare className="size-4 text-primary" />
            Multi-chat projects
          </div>
          <div className="flex items-center gap-2 rounded-2xl border bg-card px-3 py-2">
            <UploadCloud className="size-4 text-primary" />
            Frontend-only MVP flow
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-x-10 top-10 h-40 rounded-full bg-primary/20 blur-3xl" />
        <Card className="relative overflow-hidden border-border/80 bg-card/95 p-5 shadow-2xl shadow-primary/5">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Workspace preview
              </p>
              <h2 className="text-xl font-semibold">
                AI conversation + documents
              </h2>
            </div>
            <Badge variant="secondary">Live mock</Badge>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="space-y-3 rounded-3xl bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground">Projects</p>
              {previewItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border bg-background p-3"
                >
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.docs} documents · {item.chats} chats
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-4 rounded-3xl border bg-background p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active chat</p>
                  <p className="font-semibold">Event loop deep dive</p>
                </div>
                <Badge className="bg-primary/10 text-primary">Processing</Badge>
              </div>
              <div className="space-y-3 rounded-2xl bg-muted/40 p-4 text-sm">
                <div className="ml-auto max-w-[80%] rounded-2xl bg-primary px-3 py-2 text-primary-foreground">
                  Explain the event loop like I’m writing notes for later.
                </div>
                <div className="max-w-[86%] rounded-2xl border bg-card px-3 py-2 text-foreground">
                  The event loop moves callbacks between queues and the call
                  stack so JavaScript can keep the UI responsive while async
                  work finishes.
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <Sparkles className="size-4 text-primary" />
                  Suggested sources
                </div>
                <p className="mt-2">
                  event-loop-cheatsheet.md · async-patterns.txt
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
// Create the main hero section.
//
// Main message:
// Users can turn their Markdown and text notes into a searchable
// knowledge base and chat with AI using their own documents.
//
// Include:
// - Small badge or label.
// - Strong headline.
// - Supporting description.
// - Primary CTA: Get Started.
// - Secondary CTA: Learn More or View Features.
// - A visual preview of the application UI using regular layout elements.
//
// Important:
// - Do not use external UI component libraries other than shadcn/ui.
// - Use shadcn Button and Badge where appropriate.
// - Use Lucide icons if icons are needed.
// - The visual preview can be a static mock representation of the
//   dashboard/project workspace.
//
// Design:
// - Modern SaaS landing page.
// - Pink accent gradients are acceptable but keep them subtle.
// - Fully responsive.
