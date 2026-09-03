import OpenAI from "openai";

const apikey = process.env.OPENAI_API_KEY;

if (!apikey) {
  console.warn(
    "OPENAI_API_KEY is not set. Embedding and chat features will fail until it is configured.",
  );
}

function createMissingApiKeyClient(): OpenAI {
  const error = () => {
    throw new Error(
      "OPENAI_API_KEY is not configured. Set it before using AI features.",
    );
  };

  return {
    embeddings: { create: error },
    chat: { completions: { create: error } },
  } as unknown as OpenAI;
}

export const openaiClient = apikey
  ? new OpenAI({
      apiKey: apikey,
      baseURL: "https://openrouter.ai/api/v1",
    })
  : createMissingApiKeyClient();

export { OpenAI };
