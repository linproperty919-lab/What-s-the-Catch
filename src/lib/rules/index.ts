import type { Finding, Terms } from '../types';
import { renewalRule } from './renewal';
import { trialDays, trialRule } from './trial';

/** Every text rule. Add new rules here; each lives in its own file with a test. */
const RULES: ((text: string) => Finding[])[] = [trialRule, renewalRule];

export function runRules(text: string): Finding[] {
  return RULES.flatMap((rule) => rule(text));
}

/** The structured facts the rules found, for scoring against fixtures. */
export function termsFromFindings(findings: Finding[]): Terms {
  return {
    trialDays: trialDays(findings),
    renews: findings.some((f) => f.id === 'auto-renewal'),
  };
}
