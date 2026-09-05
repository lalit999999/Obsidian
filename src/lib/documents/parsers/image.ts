import { env } from "@/lib/env";
import { ValidationError } from "@/lib/errors";
import { getGeminiClient } from "@/lib/gemini";
import {
  MAX_EXTRACTED_TEXT_CHARS,
  truncateAtWhitespaceBoundary,
} from "@/lib/documents/normalize";
import type { ExtractionResult } from "@/lib/documents/types";

interface ImageAnalysis {
  transcription: string;
  description: string;
  entities: string[];
  documentType: string;
}

const ANALYSIS_PROMPT = `You are analyzing an uploaded image for a document search and retrieval system. Look at the image carefully and respond with STRICT JSON ONLY - no prose, no markdown, no code fences. Match exactly this shape:

{
  "transcription": "every piece of text visible in the image, verbatim, preserving reading order and line breaks; empty string if none",
  "description": "2-4 sentences describing what the image shows",
  "entities": ["notable objects, people, logos, chart series, or UI elements"],
  "documentType": "e.g. screenshot | photo | scanned page | diagram | chart | receipt | whiteboard"
}`;

const RETRY_SUFFIX =
  "\n\nYour previous reply was not valid JSON matching the required shape. Reply again with STRICT JSON ONLY - no prose, no markdown, no code fences.";

function parseAnalysis(raw: string): ImageAnalysis | null {
  let candidate = raw.trim();
  candidate = candidate
    .replace(/^```(?:json)?/i, "")
    .replace(/```\s*$/, "")
    .trim();

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }

  const obj = parsed as Record<string, unknown>;
  const transcription =
    typeof obj.transcription === "string" ? obj.transcription : null;
  const description =
    typeof obj.description === "string" ? obj.description : null;
  const documentType =
    typeof obj.documentType === "string" ? obj.documentType : null;
  const entities = Array.isArray(obj.entities)
    ? obj.entities.filter((entity): entity is string => typeof entity === "string")
    : null;

  if (
    transcription === null ||
    description === null ||
    documentType === null ||
    entities === null
  ) {
    return null;
  }

  return { transcription, description, documentType, entities };
}

function composeImageText(fileName: string, analysis: ImageAnalysis): string {
  const transcriptionBlock = analysis.transcription.trim() || "(no text detected)";
  const entityLines =
    analysis.entities.length > 0
      ? analysis.entities.map((entity) => `- ${entity}`).join("\n")
      : "- (none detected)";

  return [
    `# Image: ${fileName}`,
    "",
    `**Type:** ${analysis.documentType}`,
    "",
    "## Description",
    analysis.description,
    "",
    "## Text in image",
    transcriptionBlock,
    "",
    "## Visible elements",
    entityLines,
  ].join("\n");
}

export async function extractImage(
  bytes: Uint8Array,
  fileName: string,
  mimeType: string,
): Promise<ExtractionResult> {
  const client = getGeminiClient();
  if (!client) {
    throw new ValidationError(
      "Image OCR is not configured. Set GEMINI_API_KEY.",
    );
  }

  const base64Data = Buffer.from(bytes).toString("base64");
  const imagePart = { inlineData: { data: base64Data, mimeType } };

  const callModel = async (promptText: string): Promise<string> => {
    const response = await client.models.generateContent({
      model: env.GEMINI_VISION_MODEL,
      contents: [{ text: promptText }, imagePart],
      config: {
        responseMimeType: "application/json",
        httpOptions: { timeout: 60_000 },
      },
    });
    return response.text ?? "";
  };

  let rawResponse: string;
  try {
    rawResponse = await callModel(ANALYSIS_PROMPT);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    throw new ValidationError(`Image analysis failed: ${reason}`);
  }

  let analysis = parseAnalysis(rawResponse);

  if (!analysis) {
    try {
      rawResponse = await callModel(`${ANALYSIS_PROMPT}${RETRY_SUFFIX}`);
      analysis = parseAnalysis(rawResponse);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      throw new ValidationError(`Image analysis failed: ${reason}`);
    }
  }

  if (!analysis) {
    // Both attempts returned non-JSON: don't fail the upload over formatting,
    // fall back to the raw text as the description.
    analysis = {
      transcription: "",
      description:
        rawResponse.trim() || "No description could be generated for this image.",
      entities: [],
      documentType: "unknown",
    };
  }

  const composed = composeImageText(fileName, analysis);
  const { text, truncated } = truncateAtWhitespaceBoundary(
    composed,
    MAX_EXTRACTED_TEXT_CHARS,
  );

  return {
    text,
    previewMarkdown: text,
    pages: null,
    pageCount: null,
    truncated,
  };
}
