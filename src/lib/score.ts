import type { AiTerms } from './schema';
import type { Terms } from './types';

export interface Expected {
  trial_days: number;
  renews: boolean;
  cancel_method: AiTerms['cancel_method'];
}

export interface Fixture {
  file: string;
  note?: string;
  expected: Expected;
}

/** Rules cover trial length and renewal only (Week 1). */
export function scoreRules(got: Terms, want: Expected): boolean {
  return (got.trialDays ?? 0) === want.trial_days && Boolean(got.renews) === want.renews;
}

/** A page counts as "right" when the AI matches every expected field. */
export function scoreAi(got: AiTerms, want: Expected): boolean {
  return (
    got.trial_days === want.trial_days &&
    got.renews === want.renews &&
    (want.cancel_method === 'unknown' || got.cancel_method === want.cancel_method)
  );
}
