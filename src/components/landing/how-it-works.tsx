const steps = [
  {
    number: "01",
    title: "Create a project",
    description:
      "Start a dedicated space for a topic, client, or course — its documents and chats stay isolated from every other project.",
  },
  {
    number: "02",
    title: "Upload your documents",
    description:
      "Add .md and .txt files. Each one moves through pending, processing, and ready as it's parsed, chunked, and embedded.",
  },
  {
    number: "03",
    title: "Ask questions",
    description:
      "Chat with an assistant that answers only from what you uploaded, and cites the exact passage behind every claim.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
        A simple workflow that stays out of your way.
      </h2>

      <ol className="mt-10 grid gap-0 sm:grid-cols-3">
        {steps.map((step) => (
          <li
            key={step.number}
            className="border-t border-border py-6 pr-6 sm:border-t-0 sm:border-l sm:py-0 sm:pt-1 sm:pl-6 first:border-l-0 first:pl-0"
          >
            <span className="text-sm font-medium text-primary">{step.number}</span>
            <h3 className="mt-2 text-lg font-medium">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
