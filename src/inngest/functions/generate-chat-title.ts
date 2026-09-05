import { inngest } from "@/inngest/client";
import { chatTitleRequested } from "@/inngest/events";
import { openaiClient } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

// src/actions/ai/prompts.ts belongs to Session B, so this prompt stays local
// to this file rather than living alongside the other chat prompts.
const TITLE_SYSTEM_PROMPT =
  "Generate a concise, specific 4-6 word title summarizing the topic of a " +
  "chat, based on the user's first message. Respond with the title only " +
  "— no surrounding quotes, no trailing punctuation, no explanation.";

const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";

export const generateChatTitle = inngest.createFunction(
  {
    id: "generate-chat-title",
    retries: 2,
    triggers: [{ event: chatTitleRequested }],
  },
  async ({ event, step }) => {
    const { chatId, firstMessage } = event.data;

    const title = await step.run("generate-title", async () => {
      const response = await openaiClient.chat.completions.create({
        model: CHAT_MODEL,
        messages: [
          { role: "system", content: TITLE_SYSTEM_PROMPT },
          { role: "user", content: firstMessage.slice(0, 2000) },
        ],
        max_tokens: 20,
        temperature: 0.5,
      });

      const generated = response.choices[0]?.message?.content?.trim();
      if (!generated) {
        throw new Error("Chat model returned an empty title.");
      }

      return generated.replace(/^["']+|["']+$/g, "").slice(0, 120);
    });

    await step.run("save-title", async () => {
      await prisma.chat.updateMany({
        where: { id: chatId },
        data: { title },
      });
    });
  },
);
