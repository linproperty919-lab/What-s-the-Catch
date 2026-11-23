/**
 * What we ask Gemini Nano to return, passed to prompt() as `responseConstraint`.
 * Kept flat and non-nullable: small on-device models follow simple schemas more reliably.
 * Empty string / 0 / "unknown" mean "the page does not say".
 */
export const TERMS_SCHEMA = {
  type: 'object',
  properties: {
    renews: { type: 'boolean' },
    renewal_quote: { type: 'string' },
    renewal_price: { type: 'string' },
    renewal_period: { type: 'string', enum: ['week', 'month', 'year', 'other', 'unknown'] },
    trial_days: { type: 'integer' },
    trial_quote: { type: 'string' },
    cancel_method: { type: 'string', enum: ['online', 'phone', 'email', 'in_person', 'unknown'] },
    cancel_quote: { type: 'string' },
    fees: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, amount: { type: 'string' }, quote: { type: 'string' } },
        required: ['name', 'amount', 'quote'],
      },
    },
    red_flags: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        properties: { title: { type: 'string' }, quote: { type: 'string' } },
        required: ['title', 'quote'],
      },
    },
  },
  required: [
    'renews', 'renewal_quote', 'renewal_price', 'renewal_period', 'trial_days', 'trial_quote',
    'cancel_method', 'cancel_quote', 'fees', 'red_flags',
  ],
} as const;

export interface AiTerms {
  renews: boolean;
  renewal_quote: string;
  renewal_price: string;
  renewal_period: 'week' | 'month' | 'year' | 'other' | 'unknown';
  trial_days: number;
  trial_quote: string;
  cancel_method: 'online' | 'phone' | 'email' | 'in_person' | 'unknown';
  cancel_quote: string;
  fees: { name: string; amount: string; quote: string }[];
  red_flags: { title: string; quote: string }[];
}

export const SYSTEM_PROMPT = `You read text from a checkout or signup web page and report what the shopper is agreeing to pay.
Rules:
- Only report what the text states. If it does not say, use "", 0 or "unknown".
- Every *_quote and quote field must be copied word for word from the text. Never paraphrase.
- trial_days is the length of a free or discounted trial in days (1 month = 30).
- renewal_price is the price charged after any trial or intro offer, with its currency, e.g. "$14.99/month".
- fees are extra charges beyond the headline price (service, processing, setup, booking fees).
- red_flags are terms a careful shopper would want to know: hard cancellation, early termination fees, price increases after an intro period, pre-selected add-ons, non-refundable charges.`;
