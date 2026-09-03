import {
  FolderKanban,
  FileText,
  Layers3,
  MessageSquareText,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Project-based knowledge bases",
    description: "Keep every topic, client, or study track neatly isolated.",
    icon: FolderKanban,
  },
  {
    title: "Markdown and text document support",
    description: "Upload your notes in the formats you already use.",
    icon: FileText,
  },
  {
    title: "AI-style chat interface",
    description: "Explore your content through a realistic conversation UX.",
    icon: MessageSquareText,
  },
  {
    title: "Multiple chats per project",
    description: "Branch into different questions without losing context.",
    icon: Layers3,
  },
  {
    title: "Document processing statuses",
    description: "Track PENDING, PROCESSING, READY, and FAILED states clearly.",
    icon: SlidersHorizontal,
  },
  {
    title: "Organized knowledge management",
    description: "Make it easy to scan, search, and return to important ideas.",
    icon: Sparkles,
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Features
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need for a polished knowledge-base MVP.
        </h2>
        <p className="mt-4 text-muted-foreground">
          The layout stays focused on real product behavior without pretending
          the backend exists yet.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <Card key={feature.title} className="border-border/80 bg-card/90">
              <CardHeader>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>
                <CardTitle className="pt-2 text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-sm leading-6">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          );
        })}
      </div>
    </section>
  );
}
// Create the features section.
//
// Highlight these main features:
//
// - Project-based knowledge bases.
// - Markdown and text document support.
// - AI-powered conversations.
// - Multiple chats inside a project.
// - Document processing status.
// - Organized knowledge management.
//
// Requirements:
// - Use shadcn Card components.
// - Use Lucide icons.
// - Render the features from a local array.
// - Make the layout responsive.
//
// Important:
// - This is frontend-only.
// - Do not claim that real AI processing is happening on this page.
