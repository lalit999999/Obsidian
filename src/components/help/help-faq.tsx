import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatBytes } from "@/lib/format";
import { SOURCE_TYPES } from "@/lib/sources/registry";

const supportedTypesList = SOURCE_TYPES.map(
  (type) =>
    `${type.label} (${type.extensions.join(", ")}, up to ${formatBytes(type.maxBytes)})`,
).join(" · ");

const FAQ_ITEMS = [
  {
    question: "Which file types can I upload, and how big can they be?",
    answer: `Obsidian accepts ${supportedTypesList}. Anything else — including legacy .doc files — is rejected on upload.`,
  },
  {
    question: "Why is my document stuck in \"Processing\"?",
    answer:
      "A new source runs through extraction and embedding as a background job, which usually takes a few seconds to a couple of minutes depending on file size. The library and project pages poll for updates automatically, so you don't need to refresh — just leave the tab open.",
  },
  {
    question: "What does \"Failed\" mean, and how do I fix it?",
    answer:
      "The document couldn't be parsed or embedded — usually because the file is corrupted, password-protected, or the text couldn't be extracted. Re-uploading isn't automatic yet: delete the failed source and upload it again, ideally after re-saving or re-exporting the original file.",
  },
  {
    question: "Why does the assistant say it can't find something?",
    answer:
      "The assistant only answers from the documents you've added — it doesn't use outside knowledge or the open web. If the information isn't in your sources (or the relevant document is still processing or failed), it will say so instead of guessing.",
  },
  {
    question: "What does scoping a chat to specific sources do?",
    answer:
      "By default a chat can draw on every ready document in the project. Selecting one or more sources in the documents panel restricts that chat to only search within those sources, which is useful when a project has documents on unrelated topics.",
  },
  {
    question: "How do I sign in?",
    answer:
      "Obsidian only supports signing in with Google right now — there's no email/password option.",
  },
];

export function HelpFaq() {
  return (
    <Accordion type="single" collapsible>
      {FAQ_ITEMS.map((item, index) => (
        <AccordionItem key={item.question} value={`item-${index}`}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>
            <p>{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
