/** Collapse whitespace so quotes match regardless of line breaks. */
export function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Return the sentence around `index` in `text`, trimmed to at most `max` chars.
 * Used to quote the page text that backs a finding.
 */
export function sentenceAt(text: string, index: number, max = 240): string {
  // A sentence ends at ! ? or a newline, or at a "." followed by a space (so "$9.99" stays whole).
  const endsAt = (i: number) => {
    const c = text[i];
    if (c === '!' || c === '?' || c === '\n') return true;
    return c === '.' && (i + 1 >= text.length || /\s/.test(text[i + 1] ?? ''));
  };
  let start = index;
  while (start > 0 && !endsAt(start - 1)) start--;
  let end = index;
  while (end < text.length && !endsAt(end)) end++;
  if (end < text.length) end++; // keep the full stop
  let sentence = normalize(text.slice(start, end));
  if (sentence.length > max) {
    const offset = Math.max(0, index - start - Math.floor(max / 2));
    sentence = normalize(text.slice(start + offset, start + offset + max));
  }
  return sentence;
}

/** True when `quote` appears in `pageText`, ignoring case and whitespace. */
export function quoteExists(quote: string, pageText: string): boolean {
  const q = normalize(quote).toLowerCase();
  if (q.length < 8) return false; // too short to prove anything
  return normalize(pageText).toLowerCase().includes(q);
}
