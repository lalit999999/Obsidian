import { XMLParser } from "fast-xml-parser";
import { unzipSync } from "fflate";

import { ValidationError } from "@/lib/errors";
import {
  MAX_EXTRACTED_TEXT_CHARS,
  normalizeExtractedText,
  truncateAtWhitespaceBoundary,
} from "@/lib/documents/normalize";
import type { ExtractionResult } from "@/lib/documents/types";

type XmlNode = Record<string, unknown>;

function localName(tag: string): string {
  const idx = tag.indexOf(":");
  return idx === -1 ? tag : tag.slice(idx + 1);
}

function isXmlNode(value: unknown): value is XmlNode {
  return typeof value === "object" && value !== null;
}

function collectText(nodes: unknown): string {
  if (!Array.isArray(nodes)) {
    return "";
  }

  return nodes.map((child) => collectTextFromNode(child)).join("");
}

function collectTextFromNode(node: unknown): string {
  if (!isXmlNode(node)) {
    return "";
  }

  if ("#text" in node) {
    return String(node["#text"]);
  }

  for (const key of Object.keys(node)) {
    if (key === ":@") continue;
    const tag = localName(key);
    const value = node[key];

    if (tag === "s") {
      const attrs = node[":@"] as Record<string, unknown> | undefined;
      const countRaw = attrs?.["@_text:c"];
      const count = countRaw ? Number(countRaw) : 1;
      return " ".repeat(Number.isFinite(count) && count > 0 ? count : 1);
    }

    if (tag === "tab") {
      return "\t";
    }

    return collectText(value);
  }

  return "";
}

/** Depth-first search for the first descendant element with this local name. */
function findDescendant(nodes: unknown, tagLocalName: string): unknown {
  if (!Array.isArray(nodes)) {
    return null;
  }

  for (const node of nodes) {
    if (!isXmlNode(node)) continue;

    for (const key of Object.keys(node)) {
      if (key === ":@") continue;
      if (localName(key) === tagLocalName) {
        return node[key];
      }
    }
  }

  for (const node of nodes) {
    if (!isXmlNode(node)) continue;
    for (const key of Object.keys(node)) {
      if (key === ":@") continue;
      const found = findDescendant(node[key], tagLocalName);
      if (found) return found;
    }
  }

  return null;
}

function collectParagraphs(nodes: unknown, out: string[]): void {
  if (!Array.isArray(nodes)) {
    return;
  }

  for (const node of nodes) {
    if (!isXmlNode(node)) continue;

    for (const key of Object.keys(node)) {
      if (key === ":@") continue;
      const tag = localName(key);
      const value = node[key];

      if (tag === "p" || tag === "h") {
        out.push(collectText(value));
      } else if (Array.isArray(value)) {
        collectParagraphs(value, out);
      }
    }
  }
}

export function extractOdt(
  bytes: Uint8Array,
  fileName: string,
): ExtractionResult {
  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(bytes);
  } catch {
    throw new ValidationError("This does not look like a valid .odt file.");
  }

  const contentXmlBytes = entries["content.xml"];
  if (!contentXmlBytes) {
    throw new ValidationError("This does not look like a valid .odt file.");
  }

  const xml = new TextDecoder("utf-8").decode(contentXmlBytes);

  const parser = new XMLParser({
    ignoreAttributes: false,
    preserveOrder: true,
  });

  let parsed: unknown;
  try {
    parsed = parser.parse(xml);
  } catch {
    throw new ValidationError("This does not look like a valid .odt file.");
  }

  const body = findDescendant(parsed, "body");
  const text = body ? findDescendant(body, "text") : null;

  const paragraphs: string[] = [];
  if (text) {
    collectParagraphs(text, paragraphs);
  }

  const combined = normalizeExtractedText(
    paragraphs.filter(Boolean).join("\n\n"),
  );

  if (!combined) {
    throw new ValidationError(
      `No readable text could be extracted from ${fileName}.`,
    );
  }

  const { text: truncatedText, truncated } = truncateAtWhitespaceBoundary(
    combined,
    MAX_EXTRACTED_TEXT_CHARS,
  );

  return {
    text: truncatedText,
    previewMarkdown: null,
    pages: null,
    pageCount: null,
    truncated,
  };
}
