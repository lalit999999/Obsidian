const CITATION_MARKER_PATTERN = /\[(\d+)\]/g;

export function splitOnCitations(
  text: string,
): Array<string | { marker: number }> {
  const parts: Array<string | { marker: number }> = [];
  let lastIndex = 0;

  for (const match of text.matchAll(CITATION_MARKER_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    parts.push({ marker: Number(match[1]) });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
