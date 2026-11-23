export type Severity = 'info' | 'warn' | 'alert';

export interface Finding {
  /** Stable id of the rule or AI field that produced it, e.g. "trial-length". */
  id: string;
  source: 'rules' | 'ai';
  severity: Severity;
  /** Short plain-language headline, e.g. "7-day free trial". */
  title: string;
  /** Exact text from the page that supports the finding. */
  quote: string;
}

/** Structured facts a page states about what the user will pay. */
export interface Terms {
  trialDays?: number;
  renews?: boolean;
}
