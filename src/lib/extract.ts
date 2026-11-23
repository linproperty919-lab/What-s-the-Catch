import { normalize } from './text';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'IFRAME', 'CANVAS', 'TEXTAREA']);

/** Inputs we must never read: payment card fields and anything that looks like one. */
export function isSensitiveInput(el: Element): boolean {
  if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) {
    return false;
  }
  const auto = (el.getAttribute('autocomplete') || '').toLowerCase();
  if (auto.startsWith('cc-') || auto.includes(' cc-')) return true;
  const hint = `${el.name} ${el.id}`.toLowerCase();
  return /(card|cc|cvv|cvc|expir|iban|account.?num|routing|ssn|password)/.test(hint);
}

/** Words that make a chunk of text worth sending to the rules and the model. */
const SIGNAL =
  /(\$|€|£|free|trial|renew|recurring|subscription|cancel|billed|per (month|year)|\/mo|\/yr|annual|monthly|fee|charge|terms|commit|contract|refund)/i;

export interface Extracted {
  /** All visible text, block by block, used to verify quotes. */
  fullText: string;
  /** The parts most likely to matter, capped at `maxChars`, in page order. */
  focusText: string;
}

/**
 * Turn a page into plain text. Hidden text inside collapsed <details> or tiny fonts is kept on
 * purpose: that is where the catch usually lives. Values typed into inputs are never read.
 */
export function extractPageText(doc: Document, maxChars = 6000): Extracted {
  const blocks: string[] = [];
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        if (SKIP_TAGS.has(el.tagName.toUpperCase())) return NodeFilter.FILTER_REJECT;
        if (isSensitiveInput(el)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_SKIP;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let current = '';
  let lastParent: Element | null = null;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const parent = n.parentElement;
    const block = parent?.closest('p,li,label,td,th,h1,h2,h3,h4,h5,h6,button,summary,div,section') ?? null;
    if (block !== lastParent && current) {
      blocks.push(normalize(current));
      current = '';
    }
    lastParent = block;
    current += ` ${n.textContent ?? ''}`;
  }
  if (current) blocks.push(normalize(current));

  const clean = blocks.filter((b) => b.length > 0);
  const fullText = clean.join('\n');

  // Keep signal blocks plus their neighbours, in page order, until the cap.
  const keep = new Set<number>();
  clean.forEach((b, i) => {
    if (SIGNAL.test(b)) [i - 1, i, i + 1].forEach((j) => j >= 0 && j < clean.length && keep.add(j));
  });
  let focusText = '';
  for (const i of [...keep].sort((a, b) => a - b)) {
    const next = `${clean[i]}\n`;
    if (focusText.length + next.length > maxChars) break;
    focusText += next;
  }
  return { fullText, focusText: focusText.trim() || fullText.slice(0, maxChars) };
}
