import { openaiClient } from "@/lib/openai";
import type {
  AnswerCitation,
  AnswerConfidence,
  AnswerPayload,
  AnswerSection,
} from "@/types/chat";
import type { RetrievedChunkResult } from "@/types/rag";
import {
  buildKnowledgeAssistantMessages,
  KNOWLEDGE_ASSISTANT_SYSTEM_PROMPT,
} from "./prompts";

export interface KnowledgeAssistantInput {
  question: string;
  context: string;
  isScoped?: boolean;
  scopedSourceCount?: number;
  sources?: RetrievedChunkResult[];
}

export interface KnowledgeAssistantResult {
  answer: string;
  blocks: AnswerPayload | null;
  systemPrompt: string;
}

const CONFIDENCE_VALUES: AnswerConfidence[] = ["high", "partial", "not_found"];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function stripJsonFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function parseSections(raw: unknown): AnswerSection[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const sections: AnswerSection[] = [];
  for (const entry of raw) {
    if (
      entry &&
      typeof entry === "object" &&
      isNonEmptyString((entry as Record<string, unknown>).heading) &&
      isNonEmptyString((entry as Record<string, unknown>).body)
    ) {
      sections.push({
        heading: (entry as Record<string, string>).heading,
        body: (entry as Record<string, string>).body,
      });
    }
  }
  return sections;
}

function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter(isNonEmptyString);
}

/**
 * Validates every field at runtime (this is LLM output) and drops any
 * citation whose marker number does not correspond to a source that was
 * actually retrieved — a hallucinated citation is worse than none.
 */
export function parseAnswerPayload(
  raw: string,
  sources: RetrievedChunkResult[] = [],
): AnswerPayload | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFences(raw));
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const candidate = parsed as Record<string, unknown>;

  if (!isNonEmptyString(candidate.lead)) {
    return null;
  }

  const confidence = CONFIDENCE_VALUES.includes(
    candidate.confidence as AnswerConfidence,
  )
    ? (candidate.confidence as AnswerConfidence)
    : "partial";

  const validMarkers = new Set(sources.map((_, index) => index + 1));

  const citations: AnswerCitation[] = [];
  if (Array.isArray(candidate.citations)) {
    for (const entry of candidate.citations) {
      if (!entry || typeof entry !== "object") {
        continue;
      }
      const c = entry as Record<string, unknown>;
      const marker = Number(c.marker);
      if (!Number.isInteger(marker) || !validMarkers.has(marker)) {
        continue;
      }
      if (
        !isNonEmptyString(c.documentId) ||
        !isNonEmptyString(c.fileName) ||
        !isNonEmptyString(c.quote)
      ) {
        continue;
      }
      const chunkIndex = Number(c.chunkIndex);
      const score = Number(c.score);
      citations.push({
        marker,
        documentId: c.documentId,
        fileName: c.fileName,
        chunkIndex: Number.isFinite(chunkIndex) ? chunkIndex : 0,
        score: Number.isFinite(score) ? score : 0,
        quote: c.quote,
      });
    }
  }

  return {
    lead: candidate.lead,
    sections: parseSections(candidate.sections),
    keyPoints: parseStringArray(candidate.keyPoints),
    citations,
    followUps: parseStringArray(candidate.followUps),
    confidence,
  };
}

function renderAnswerToMarkdown(payload: AnswerPayload): string {
  const parts: string[] = [payload.lead];

  for (const section of payload.sections) {
    parts.push(`## ${section.heading}\n\n${section.body}`);
  }

  if (payload.keyPoints.length > 0) {
    parts.push(payload.keyPoints.map((point) => `- ${point}`).join("\n"));
  }

  return parts.join("\n\n");
}

export async function generateKnowledgeAnswer({
  question,
  context,
  isScoped,
  scopedSourceCount,
  sources = [],
}: KnowledgeAssistantInput): Promise<KnowledgeAssistantResult> {
  const messages = buildKnowledgeAssistantMessages({
    question,
    context,
    isScoped,
    scopedSourceCount,
  });

  let response;
  try {
    response = await openaiClient.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
      messages,
      temperature: 0.2,
    });
  } catch (error) {
    console.error(
      "[openai] chat.completions.create failed:",
      error instanceof Error && "error" in error
        ? (error as { error: unknown }).error
        : error,
    );
    throw error;
  }

  const rawAnswer = response.choices[0]?.message?.content?.trim();

  if (!rawAnswer) {
    throw new Error("The AI assistant returned an empty response.");
  }

  const blocks = parseAnswerPayload(rawAnswer, sources);

  return {
    answer: blocks ? renderAnswerToMarkdown(blocks) : rawAnswer,
    blocks,
    systemPrompt: KNOWLEDGE_ASSISTANT_SYSTEM_PROMPT,
  };
}
