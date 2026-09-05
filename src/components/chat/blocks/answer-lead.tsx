import { Markdown } from "@/components/ui/markdown";

interface AnswerLeadProps {
  lead: string;
}

export function AnswerLead({ lead }: AnswerLeadProps) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <Markdown
        content={lead}
        scale="comfortable"
        className="[&>p]:mt-0 [&>p]:text-base [&>p]:leading-7 [&>p]:font-medium [&>p]:text-foreground"
      />
    </div>
  );
}
