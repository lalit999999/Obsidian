import { openaiClient } from "@/lib/openai";
import {
  HYDE_MAX_DOCUMENTS,
  HYDE_MAX_TOKENS,
  HYDE_MIN_QUESTION_LENGTH,
  HYDE_TEMPERATURE,
  HYDE_TIMEOUT_MS,
} from "@/lib/rag/constants";
import type { SourceKindValue } from "@/types/rag";

export interface HydeInput {
  question: string;
  projectName: string;
  documents: Array<{ fileName: string; sourceKind: SourceKindValue }>;
}

const HYDE_SYSTEM_PROMPT = `You write a single short hypothetical passage, in the voice of a corpus of source documents, as if excerpted directly from them.

This passage is a search probe, not an answer shown to a user. It will be embedded and used to find real chunks that are semantically similar to it — being plausibly worded, in the register and vocabulary the real documents would use, matters far more than being correct. You are given the names of the documents actually in the project as a hint about what the corpus covers; use them to inform the register and subject matter, not as facts to restate.

Rules:
- Invent no citations, sources, or references.
- State nothing as a real-world fact — this is a stylistic probe, not a claim.
- Return prose only: no preamble, no markdown headings, no code fences, no meta-commentary about what you are doing.
- Keep it short — a paragraph, not an essay.`;

function buildUserPrompt(input: HydeInput): string {
  const documentList = input.documents
    .slice(0, HYDE_MAX_DOCUMENTS)
    .map((doc) => `- ${doc.fileName} (${doc.sourceKind})`)
    .join("\n");

  return `Project: ${input.projectName}

Documents in this project:
${documentList || "(none)"}

Question the passage should help retrieve an answer for:
${input.question}`;
}

/** Returns the hypothetical passage, or null when HyDE is skipped or fails. */
export async function generateHypotheticalDocument(
  input: HydeInput,
): Promise<string | null> {
  if (input.question.trim().length < HYDE_MIN_QUESTION_LENGTH) {
    return null;
  }

  if (input.documents.length === 0) {
    return null;
  }

  try {
    const response = await openaiClient.chat.completions.create(
      {
        model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: HYDE_SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(input) },
        ],
        max_tokens: HYDE_MAX_TOKENS,
        temperature: HYDE_TEMPERATURE,
      },
      { timeout: HYDE_TIMEOUT_MS, maxRetries: 0 },
    );

    const hypothetical = response.choices[0]?.message?.content?.trim();
    return hypothetical || null;
  } catch (error) {
    console.warn("[hyde] generateHypotheticalDocument failed:", error);
    return null;
  }
}

export function buildHydeQuery(
  question: string,
  hypothetical: string | null,
): string {
  if (!hypothetical) {
    return question;
  }

  return `${question}\n\n${hypothetical}`;
}
