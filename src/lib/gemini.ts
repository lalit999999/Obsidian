import { GoogleGenAI } from "@google/genai";

// Lazily initialised: this module is imported by src/lib/documents/extract.ts
// regardless of source kind, so a missing GEMINI_API_KEY must not throw at
// import time and break non-image uploads.
let cachedClient: GoogleGenAI | null | undefined;

export function getGeminiClient(): GoogleGenAI | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  cachedClient = apiKey ? new GoogleGenAI({ apiKey }) : null;
  return cachedClient;
}

export { GoogleGenAI };
