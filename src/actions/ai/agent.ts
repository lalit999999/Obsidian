import { openaiClient } from "@/lib/openai";
import {
  buildKnowledgeAssistantMessages,
  KNOWLEDGE_ASSISTANT_SYSTEM_PROMPT,
} from "./prompts";

export interface KnowledgeAssistantInput {
  question: string;
  context: string;
}

export interface KnowledgeAssistantResult {
  answer: string;
  systemPrompt: string;
}

export async function generateKnowledgeAnswer({
  question,
  context,
}: KnowledgeAssistantInput): Promise<KnowledgeAssistantResult> {
  const messages = buildKnowledgeAssistantMessages({ question, context });

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

  const answer = response.choices[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error("The AI assistant returned an empty response.");
  }

  return {
    answer,
    systemPrompt: KNOWLEDGE_ASSISTANT_SYSTEM_PROMPT,
  };
}
