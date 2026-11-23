import type { AiTerms } from './schema';
import type { Finding } from './types';
import { quoteExists } from './text';

/**
 * Turn the model's JSON into findings, dropping anything whose quote is not on the page.
 * This is our guard against hallucination: no quote, no finding.
 */
export function findingsFromAi(ai: AiTerms, pageText: string): Finding[] {
  const out: Finding[] = [];
  const ok = (q: string) => quoteExists(q, pageText);

  if (ai.trial_days > 0 && ok(ai.trial_quote)) {
    out.push({ id: 'trial-length', source: 'ai', severity: 'warn', title: `${ai.trial_days}-day trial`, quote: ai.trial_quote });
  }
  if (ai.renews && ok(ai.renewal_quote)) {
    const price = ai.renewal_price ? ` at ${ai.renewal_price}` : '';
    out.push({ id: 'auto-renewal', source: 'ai', severity: 'warn', title: `Renews automatically${price}`, quote: ai.renewal_quote });
  }
  if (ai.cancel_method !== 'unknown' && ai.cancel_method !== 'online' && ok(ai.cancel_quote)) {
    out.push({
      id: 'cancel-method',
      source: 'ai',
      severity: 'alert',
      title: `Cancellation by ${ai.cancel_method.replace('_', ' ')} only`,
      quote: ai.cancel_quote,
    });
  }
  for (const fee of ai.fees) {
    if (ok(fee.quote)) out.push({ id: 'fee', source: 'ai', severity: 'warn', title: `${fee.name}: ${fee.amount}`, quote: fee.quote });
  }
  for (const flag of ai.red_flags) {
    if (ok(flag.quote)) out.push({ id: 'red-flag', source: 'ai', severity: 'alert', title: flag.title, quote: flag.quote });
  }
  return out;
}

/** Parse the model's reply defensively; returns null if it is not the shape we asked for. */
export function parseAiTerms(raw: string): AiTerms | null {
  try {
    const v = JSON.parse(raw) as Partial<AiTerms>;
    if (typeof v.renews !== 'boolean' || typeof v.trial_days !== 'number') return null;
    return {
      renews: v.renews,
      renewal_quote: v.renewal_quote ?? '',
      renewal_price: v.renewal_price ?? '',
      renewal_period: v.renewal_period ?? 'unknown',
      trial_days: v.trial_days,
      trial_quote: v.trial_quote ?? '',
      cancel_method: v.cancel_method ?? 'unknown',
      cancel_quote: v.cancel_quote ?? '',
      fees: Array.isArray(v.fees) ? v.fees : [],
      red_flags: Array.isArray(v.red_flags) ? v.red_flags : [],
    };
  } catch {
    return null;
  }
}
