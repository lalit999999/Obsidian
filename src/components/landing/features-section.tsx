import { FileCheck2, FolderLock, Link2, Radar } from "lucide-react";

const features = [
  {
    title: "Grounded in your documents",
    description:
      "Answers come only from what you uploaded — not from general model knowledge you can't verify.",
    icon: FileCheck2,
  },
  {
    title: "Citations you can click back to",
    description:
      "Every claim links to the exact passage it came from, so you can check it in seconds.",
    icon: Link2,
  },
  {
    title: "Projects keep knowledge isolated",
    description:
      "A client's notes never bleed into a course's notes. Each project is its own knowledge base.",
    icon: FolderLock,
  },
  {
    title: "Processing status, live",
    description:
      "Watch each document move from pending to processing to ready, so you know exactly what the assistant can see.",
    icon: Radar,
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
        Built around one idea: an answer is only useful if you can trace it.
      </h2>

      <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="flex gap-4">
              <Icon className="mt-0.5 size-5 shrink-0 text-foreground" />
              <div>
                <h3 className="text-base font-medium">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
