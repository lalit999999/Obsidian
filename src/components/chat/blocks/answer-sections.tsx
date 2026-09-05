import { Markdown } from "@/components/ui/markdown";
import type { AnswerSection } from "@/types/chat";

interface AnswerSectionsProps {
  sections: AnswerSection[];
}

export function AnswerSections({ sections }: AnswerSectionsProps) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div key={index}>
          <h3 className="text-sm font-semibold">{section.heading}</h3>
          <Markdown
            content={section.body}
            scale="comfortable"
            className="[&>*:first-child]:mt-0"
          />
        </div>
      ))}
    </div>
  );
}
