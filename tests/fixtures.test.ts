import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractPageText } from '@/lib/extract';
import { runRules, termsFromFindings } from '@/lib/rules';
import { looksLikeCheckout } from '@/lib/detect';
import type { Fixture } from '@/lib/score';

const dir = join(__dirname, '../public/fixtures');
const fixtures: Fixture[] = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8'));

describe.each(fixtures)('fixture $file', (fx) => {
  const doc = new DOMParser().parseFromString(readFileSync(join(dir, fx.file), 'utf8'), 'text/html');

  it('is detected as a checkout page', () => {
    expect(looksLikeCheckout('https://example.com/', doc)).toBe(true);
  });

  it('rules match the expected trial and renewal', () => {
    const terms = termsFromFindings(runRules(extractPageText(doc).focusText));
    expect({ trial_days: terms.trialDays ?? 0, renews: terms.renews }).toEqual({
      trial_days: fx.expected.trial_days,
      renews: fx.expected.renews,
    });
  });
});
