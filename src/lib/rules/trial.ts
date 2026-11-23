import type { Finding } from '../types';
import { sentenceAt } from '../text';

const WORD_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, five: 5, seven: 7, ten: 10, fourteen: 14, thirty: 30,
};

// "7-day free trial", "14 day trial", "free for 30 days", "first month free", "try free for 7 days"
const PATTERNS: { re: RegExp; days: (m: RegExpExecArray) => number }[] = [
  { re: /\b(\d{1,3}|one|two|three|five|seven|ten|fourteen|thirty)[- ]days?(?: free)? trial\b/gi, days: (m) => toNum(m[1]) },
  { re: /\bfree (?:for )?(\d{1,3}|one|two|three|five|seven|ten|fourteen|thirty) days\b/gi, days: (m) => toNum(m[1]) },
  { re: /\b(\d{1,2})[- ](?:month|mo)s? free\b/gi, days: (m) => toNum(m[1]) * 30 },
  { re: /\bfirst month (?:is )?free\b/gi, days: () => 30 },
];

function toNum(s: string | undefined): number {
  if (!s) return 0;
  return WORD_NUMBERS[s.toLowerCase()] ?? Number.parseInt(s, 10);
}

/** Finds the free-trial length the page offers. */
export function trialRule(text: string): Finding[] {
  for (const { re, days } of PATTERNS) {
    re.lastIndex = 0;
    const m = re.exec(text);
    if (m) {
      const n = days(m);
      if (!n) continue;
      return [
        {
          id: 'trial-length',
          source: 'rules',
          severity: 'warn',
          title: `${n}-day free trial: you may be charged when it ends`,
          quote: sentenceAt(text, m.index),
        },
      ];
    }
  }
  return [];
}

export function trialDays(findings: Finding[]): number | undefined {
  const f = findings.find((x) => x.id === 'trial-length');
  const m = f?.title.match(/^(\d+)-day/);
  return m ? Number(m[1]) : undefined;
}
