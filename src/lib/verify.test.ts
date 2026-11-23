import { describe, expect, it } from 'vitest';
import { findingsFromAi, parseAiTerms } from './verify';
import type { AiTerms } from './schema';

const page = `Start your 7-day free trial. Then $14.99/month. Your plan renews automatically each month.
To cancel, call 1-800-555-0100 during business hours. A $2.50 service fee applies to every order.`;

const base: AiTerms = {
  renews: true,
  renewal_quote: 'Your plan renews automatically each month.',
  renewal_price: '$14.99/month',
  renewal_period: 'month',
  trial_days: 7,
  trial_quote: 'Start your 7-day free trial.',
  cancel_method: 'phone',
  cancel_quote: 'To cancel, call 1-800-555-0100 during business hours.',
  fees: [{ name: 'Service fee', amount: '$2.50', quote: 'A $2.50 service fee applies to every order.' }],
  red_flags: [],
};

describe('findingsFromAi', () => {
  it('keeps findings whose quotes are on the page', () => {
    expect(findingsFromAi(base, page).map((f) => f.id)).toEqual(['trial-length', 'auto-renewal', 'cancel-method', 'fee']);
  });

  it('drops findings with invented quotes', () => {
    const ai = { ...base, red_flags: [{ title: 'Early termination fee', quote: 'A $150 fee applies if you leave early.' }] };
    expect(findingsFromAi(ai, page).some((f) => f.id === 'red-flag')).toBe(false);
  });

  it('matches quotes across line breaks and case', () => {
    const ai = { ...base, trial_quote: 'START YOUR 7-day   free trial.' };
    expect(findingsFromAi(ai, page)[0]?.id).toBe('trial-length');
  });
});

describe('parseAiTerms', () => {
  it('rejects non-JSON and wrong shapes', () => {
    expect(parseAiTerms('sure! here you go')).toBeNull();
    expect(parseAiTerms('{"renews":"yes"}')).toBeNull();
  });
  it('fills missing optional fields', () => {
    expect(parseAiTerms('{"renews":false,"trial_days":0}')?.fees).toEqual([]);
  });
});
