import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn(
    "OPENAI_API_KEY is not set. Embedding and chat features will fail until it is configured.",
  );
}

export const openaiClient = new OpenAI({
  apiKey: apiKey ?? "",
});

export { OpenAI };
