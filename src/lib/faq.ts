// Single source of truth for FAQ content shown on both /help and the landing
// page's #faq section. Server Components import this directly, so it must
// stay to plain strings/unions — no component references, and nothing that
// pulls in @phosphor-icons/react (see src/lib/support.ts for why that crashes
// Next's static configuration pass). lucide-react is fine, which is why the
// SOURCE_TYPES import below is safe.
import { formatBytes } from "@/lib/format";
import { SOURCE_TYPES } from "@/lib/sources/registry";

export type FaqCategory =
  | "uploads"
  | "chat"
  | "projects"
  | "settings"
  | "workspace"
  | "account";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
}

export const FAQ_CATEGORIES: { value: FaqCategory; label: string }[] = [
  { value: "uploads", label: "Uploads" },
  { value: "chat", label: "Chat & citations" },
  { value: "projects", label: "Projects & library" },
  { value: "settings", label: "Search quality" },
  { value: "workspace", label: "Workspace" },
  { value: "account", label: "Account" },
];

const supportedTypesList = SOURCE_TYPES.map(
  (type) =>
    `${type.label} (${type.extensions.join(", ")}, up to ${formatBytes(type.maxBytes)})`,
).join(" · ");

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "supported-file-types",
    category: "uploads",
    question: "Which file types can I upload, and how big can they be?",
    answer: `Obsidian accepts ${supportedTypesList}. Anything else — including legacy .doc files — is rejected on upload.`,
  },
  {
    id: "stuck-processing",
    category: "uploads",
    question: 'Why is my document stuck in "Processing"?',
    answer:
      "A new source runs through extraction and embedding as a background job, which usually takes a few seconds to a couple of minutes depending on file size. The library and project pages poll for updates automatically, so you don't need to refresh — just leave the tab open.",
  },
  {
    id: "failed-status",
    category: "uploads",
    question: 'What does "Failed" mean, and how do I fix it?',
    answer:
      "The document couldn't be parsed or embedded — usually because the file is corrupted, password-protected, or the text couldn't be extracted. Re-uploading isn't automatic yet: delete the failed source and upload it again, ideally after re-saving or re-exporting the original file.",
  },
  {
    id: "cant-find-something",
    category: "chat",
    question: "Why does the assistant say it can't find something?",
    answer:
      "The assistant only answers from the documents you've added — it doesn't use outside knowledge or the open web. If the information isn't in your sources (or the relevant document is still processing or failed), it will say so instead of guessing.",
  },
  {
    id: "scoped-chat",
    category: "chat",
    question: "What does scoping a chat to specific sources do?",
    answer:
      "By default a chat can draw on every ready document in the project. Selecting one or more sources in the documents panel restricts that chat to only search within those sources, which is useful when a project has documents on unrelated topics.",
  },
  {
    id: "google-sign-in",
    category: "account",
    question: "How do I sign in?",
    answer:
      "Obsidian only supports signing in with Google right now — there's no email/password option.",
  },
  {
    id: "citations-resolve",
    category: "chat",
    question: "How do citations resolve back to a passage?",
    answer:
      "Every answer embeds numbered markers like [1] inline with the claim they support. Each marker corresponds to a badge below the message showing the source file it came from — click a badge to jump straight to that passage in the document, so you can verify the claim yourself rather than taking the assistant's word for it.",
  },
  {
    id: "projects-vs-library",
    category: "projects",
    question: "What's the difference between a project and the library?",
    answer:
      "A project is an isolated knowledge base: its documents and chats never mix with any other project's. The library is a read-only view across every project you own, letting you browse all your documents grouped by file type or by the project they belong to — it doesn't let you chat across projects.",
  },
  {
    id: "delete-removes-what",
    category: "projects",
    question: "What actually gets removed when I delete a document or project?",
    answer:
      "Deleting a document removes its vector embeddings, the underlying file in storage, and its database record — in that order, so nothing is ever left searchable after it disappears from the UI. Deleting a project runs that same cleanup for every document inside it, then removes the project itself once those are done.",
  },
  {
    id: "search-quality-settings",
    category: "settings",
    question: "What do the search quality settings do?",
    answer:
      "\"Rewrite questions before searching\" (HyDE) has the assistant draft a rough answer first and uses it to find better-matching passages — slightly slower, often more accurate for vague questions. \"Passages per answer\" controls how many chunks are pulled from your documents for each reply: more passages improve coverage but make replies slower and costlier.",
  },
  {
    id: "why-not-general-chatbot",
    category: "chat",
    question: "Why do answers differ from a general chatbot like ChatGPT?",
    answer:
      "A general chatbot answers from everything it was trained on, which you can't easily verify. Obsidian only answers from the specific documents you uploaded to that project, and backs every claim with a citation you can click through to the source passage — narrower, but checkable.",
  },
  {
    id: "resizing-panels",
    category: "workspace",
    question: "Can I resize or collapse the chat and sources panels?",
    answer:
      "Yes — drag the thin handle on the inner edge of either panel to resize it, double-click the handle to reset it to its default width, or use the collapse button to tuck it into a narrow rail. Your chosen widths are remembered per browser and re-clamped automatically if you switch to a narrower screen.",
  },
];
