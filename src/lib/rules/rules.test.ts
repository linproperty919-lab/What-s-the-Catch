import { describe, expect, it } from 'vitest';
import { runRules, termsFromFindings } from './index';
import { trialRule } from './trial';
import { renewalRule } from './renewal';

describe('trialRule', () => {
  it.each([
    ['Start your 7-day free trial today.', 7],
    ['Includes a 14 day trial for new members.', 14],
    ['Try it free for 30 days, cancel anytime.', 30],
    ['Enjoy a seven-day free trial.', 7],
    ['Your first month is free.', 30],
    ['Get 3 months free with annual plans.', 90],
  ])('reads "%s" as %i days', (text, days) => {
    const [f] = trialRule(text);
    expect(f?.title).toMatch(new RegExp(`^${days}-day`));
    expect(text).toContain(f?.quote.replace(/\.$/, ''));
  });

  it('ignores pages with no trial', () => {
    expect(trialRule('Free shipping on orders over $50.')).toEqual([]);
  });
});

describe('renewalRule', () => {
  it.each([
    'Your subscription will automatically renew at $119.99 per year.',
    'Membership auto-renews monthly.',
    'You will be billed monthly until you cancel.',
    'Plan renews at $14.99/mo after the trial.',
    'We will charge you every month.',
    'You will be billed $59.94 plus shipping every week until you skip or cancel.',
    'Your plan is a weekly subscription.',
  ])('flags "%s"', (text) => {
    expect(renewalRule(text)).toHaveLength(1);
  });

  it('does not flag one-time purchases', () => {
    expect(renewalRule('One-time payment of $49. No subscription.')).toEqual([]);
  });
});

describe('runRules', () => {
  it('quotes the sentence that triggered each finding', () => {
    const text = 'Welcome! Start a 7-day free trial. After that, it renews automatically at $9.99/month.';
    const findings = runRules(text);
    expect(findings.map((f) => f.quote)).toEqual([
      'Start a 7-day free trial.',
      'After that, it renews automatically at $9.99/month.',
    ]);
    expect(termsFromFindings(findings)).toEqual({ trialDays: 7, renews: true });
  });
});
