import {
  FolderPlus,
  MessageSquareMore,
  Upload,
  WandSparkles,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Create a project",
    description:
      "Group related knowledge into a dedicated space for a topic, client, or course.",
    icon: FolderPlus,
  },
  {
    number: "02",
    title: "Upload notes",
    description:
      "Add .md and .txt documents straight from your laptop with browser validation.",
    icon: Upload,
  },
  {
    number: "03",
    title: "Let it process",
    description:
      "Watch documents move through PENDING, PROCESSING, READY, and FAILED states.",
    icon: WandSparkles,
  },
  {
    number: "04",
    title: "Ask questions",
    description:
      "Use multiple chats to explore your notes and keep different threads organized.",
    icon: MessageSquareMore,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          A simple workflow that stays out of your way.
        </h2>
        <p className="mt-4 text-muted-foreground">
          The MVP is designed around a familiar project → documents → chats loop
          so you can organize notes first and think about AI second.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <Card key={step.number} className="border-border/80 bg-card/80">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {step.number}
                  </span>
                </div>
                <CardTitle className="pt-3">{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          );
        })}
      </div>
    </section>
  );
}
// Create a "How It Works" section.
//
// Display the core application workflow in simple steps:
//
// 1. Create a Project
// 2. Upload .md or .txt documents
// 3. Let the knowledge base process the documents
// 4. Ask questions and chat with AI
//
// Requirements:
// - Use a responsive grid or step layout.
// - Each step should have an icon, number, title, and short description.
// - Use shadcn Card if appropriate.
// - Keep the explanation focused on the MVP workflow.
//
// Design:
// - Pink accent for step numbers/icons.
// - Clean spacing and visual hierarchy.
