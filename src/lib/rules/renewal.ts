import type { Finding } from '../types';
import { sentenceAt } from '../text';

const PATTERNS = [
  /\bauto(?:matically)?[- ]?renew(?:s|ed|al|ing)?\b/i,
  /\brenews? (?:automatically|at|each|every|annually|monthly|yearly)\b/i,
  /\b(?:recurring|continuous) (?:billing|charges?|payments?|subscription)\b/i,
  /\b(?:until|unless) you (?:\w+ or )?cancel\b/i,
  /\bbilled (?:monthly|annually|yearly|every (?:month|year))\b/i,
  /\bbilled\b.{0,40}?\bevery (?:\d+ )?(?:week|month|year)s?\b/i,
  /\b(?:weekly|monthly|annual|yearly) (?:subscription|membership|plan)\b/i,
  /\bcharged? (?:you )?(?:each|every) (?:month|year|week)\b/i,
];

/** Flags language saying the purchase renews and keeps charging. */
export function renewalRule(text: string): Finding[] {
  for (const re of PATTERNS) {
    const m = re.exec(text);
    if (m) {
      return [
        {
          id: 'auto-renewal',
          source: 'rules',
          severity: 'warn',
          title: 'Renews automatically until you cancel',
          quote: sentenceAt(text, m.index),
        },
      ];
    }
  }
  return [];
}
