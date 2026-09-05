import { ValidationError } from "@/lib/errors";
import {
  MAX_EXTRACTED_TEXT_CHARS,
  normalizeExtractedText,
  truncateAtWhitespaceBoundary,
} from "@/lib/documents/normalize";
import type { ExtractionResult } from "@/lib/documents/types";

// CP1252 0x80-0x9F block. Undefined slots (0x81, 0x8D, 0x8F, 0x90, 0x9D) fall
// through to their own code point, matching the WHATWG encoding standard.
const CP1252_OVERRIDES: Record<number, string> = {
  0x80: "€", 0x82: "‚", 0x83: "ƒ", 0x84: "„",
  0x85: "…", 0x86: "†", 0x87: "‡", 0x88: "ˆ",
  0x89: "‰", 0x8a: "Š", 0x8b: "‹", 0x8c: "Œ",
  0x8e: "Ž", 0x91: "‘", 0x92: "’", 0x93: "“",
  0x94: "”", 0x95: "•", 0x96: "–", 0x97: "—",
  0x98: "˜", 0x99: "™", 0x9a: "š", 0x9b: "›",
  0x9c: "œ", 0x9e: "ž", 0x9f: "Ÿ",
};

function decodeCp1252Byte(byte: number): string {
  return CP1252_OVERRIDES[byte] ?? String.fromCharCode(byte);
}

const DISCARD_DESTINATIONS = new Set([
  "fonttbl", "colortbl", "stylesheet", "info", "pict", "object",
  "themedata", "datastore", "latentstyles", "listtable", "rsidtbl",
  "generator", "xmlnstbl",
]);

const BREAK_WORDS: Record<string, string> = {
  par: "\n", line: "\n", sect: "\n", page: "\n",
  tab: "\t", cell: "\t", row: "\n",
};

interface GroupState {
  skip: boolean;
  ucSkip: number;
  pendingUcSkip: number;
  firstTokenChecked: boolean;
  starPending: boolean;
}

function isLetter(ch: string): boolean {
  return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
}

function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

export function extractRtf(
  bytes: Uint8Array,
  fileName: string,
): ExtractionResult {
  // Decode 1 byte -> 1 char so control words and \'hh escapes can be walked
  // exactly; real text bytes are re-interpreted through decodeCp1252Byte.
  let raw = "";
  for (let i = 0; i < bytes.length; i++) {
    raw += String.fromCharCode(bytes[i]);
  }

  if (!raw.startsWith("{\\rtf")) {
    throw new ValidationError("This does not look like a valid .rtf file.");
  }

  const stack: GroupState[] = [
    {
      skip: false,
      ucSkip: 1,
      pendingUcSkip: 0,
      firstTokenChecked: true,
      starPending: false,
    },
  ];
  let out = "";
  let pos = 0;
  const len = raw.length;

  const top = () => stack[stack.length - 1];

  function emitText(text: string) {
    const state = top();
    if (state.pendingUcSkip > 0) {
      state.pendingUcSkip -= 1;
      return;
    }
    if (!state.skip) out += text;
  }

  function checkDestination(word: string) {
    const state = top();
    if (state.firstTokenChecked) return;
    state.firstTokenChecked = true;
    if (state.starPending || DISCARD_DESTINATIONS.has(word)) {
      state.skip = true;
    }
  }

  while (pos < len) {
    const ch = raw[pos];

    if (ch === "{") {
      const parent = top();
      stack.push({
        skip: parent.skip,
        ucSkip: parent.ucSkip,
        pendingUcSkip: 0,
        firstTokenChecked: false,
        starPending: false,
      });
      pos += 1;
      continue;
    }

    if (ch === "}") {
      if (stack.length > 1) stack.pop();
      top().pendingUcSkip = 0;
      pos += 1;
      continue;
    }

    if (ch === "\\") {
      pos += 1;
      if (pos >= len) break;
      const next = raw[pos];

      if (next === "\\" || next === "{" || next === "}") {
        emitText(next);
        pos += 1;
        continue;
      }

      if (next === "*") {
        if (!top().firstTokenChecked) top().starPending = true;
        pos += 1;
        continue;
      }

      if (next === "'") {
        pos += 1;
        const hex = raw.slice(pos, pos + 2);
        pos += 2;
        const byte = parseInt(hex, 16);
        if (!Number.isNaN(byte)) emitText(decodeCp1252Byte(byte));
        continue;
      }

      if (isLetter(next)) {
        const wordStart = pos;
        while (pos < len && isLetter(raw[pos])) pos += 1;
        const word = raw.slice(wordStart, pos);

        let sign = 1;
        if (raw[pos] === "-") {
          sign = -1;
          pos += 1;
        }
        const numStart = pos;
        while (pos < len && isDigit(raw[pos])) pos += 1;
        const hasNum = pos > numStart;
        const num = hasNum
          ? sign * parseInt(raw.slice(numStart, pos), 10)
          : undefined;

        if (raw[pos] === " ") pos += 1;

        checkDestination(word);

        if (word === "u" && num !== undefined) {
          const codePoint = num < 0 ? num + 65536 : num;
          const state = top();
          emitText(String.fromCharCode(codePoint));
          state.pendingUcSkip = state.ucSkip;
        } else if (word === "uc" && num !== undefined) {
          top().ucSkip = num;
        } else if (word in BREAK_WORDS) {
          emitText(BREAK_WORDS[word]);
        }
        // Every other control word (formatting, tables, etc.) is ignored.
        continue;
      }

      // Unrecognised one-character escape (\~, \_, \-, ...): ignore.
      pos += 1;
      continue;
    }

    if (ch === "\n" || ch === "\r") {
      pos += 1;
      continue;
    }

    const code = raw.charCodeAt(pos);
    emitText(code >= 0x80 ? decodeCp1252Byte(code) : ch);
    pos += 1;
  }

  const normalized = normalizeExtractedText(out);
  if (!normalized) {
    throw new ValidationError(
      `No readable text could be extracted from ${fileName}.`,
    );
  }

  const { text, truncated } = truncateAtWhitespaceBoundary(
    normalized,
    MAX_EXTRACTED_TEXT_CHARS,
  );

  return {
    text,
    previewMarkdown: null,
    pages: null,
    pageCount: null,
    truncated,
  };
}
