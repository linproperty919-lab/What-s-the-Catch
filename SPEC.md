# What's the Catch: v1 spec

Full product spec (living doc): https://claude.ai/artifact/X29TqNWyK3S7qkHqohUrDP

## One line
On a checkout or signup page, tell the user what they are agreeing to pay, and when, before they click Buy. Free, open source, and nothing leaves the browser.

## Decisions (Nov 2026)
- Auto-scan checkout-like pages (optional host permission, requested at onboarding) plus a manual "Scan this page" button.
- Fallback when Gemini Nano is unavailable: rules engine only. No cloud, no backend.
- Storage: `chrome.storage.sync` for settings, `chrome.storage.local` for history and reminders.
- Public repo, MIT. English only in v1. Desktop Chrome only.

## v1 features
1. Checkout detection: URL words (`checkout`, `subscribe`, `trial`, `signup`, `billing`), plan pickers, card fields present (detected, never read), "start free trial" buttons.
2. Extraction: visible text near prices, plan pickers, consent checkboxes and the submit button, including small and collapsed text. Skip card fields.
3. Rules engine: renewal language, trial length, price after trial, pre-ticked checkboxes, fees appearing only at the final step, phone-only or hard cancellation.
4. AI summary (Gemini Nano, structured output): `renews`, `renewal_price`, `renewal_period`, `renewal_date`, `trial_days`, `fees[]`, `cancel_method`, `red_flags[]`, each with a `quote` from the page.
5. Badge with flag count and an in-page card: one plain-language line, then up to 5 flags with "show me" highlighting.
6. Trial reminder via `chrome.alarms`, a day before trial end.
7. Local history of the last 50 findings in the popup.

## Out of scope for v1
Cloud fallback, subscription ledger, cancellation helper, community data, Firefox/Edge, privacy-policy analysis.

## 4-week plan (5 to 10 hrs/week)
| Week | Dates | Focus | Gate |
| --- | --- | --- | --- |
| 1 | Nov 23 to 29 | Repo, WXT scaffold, Prompt API spike, 10 fixture pages, trial + renewal rules | Nano right on 7 of 10 fixtures (else ship rules-only) |
| 2 | Nov 30 to Dec 6 | All v1 rules + tests, JSON schema output, quote check, merge rules + AI | 30 fixtures pass |
| 3 | Dec 7 to 13 | In-page card, badge, onboarding + model download, reminders, history, 10-friend beta | 5 testers still use it |
| 4 | Dec 14 to 20 | Fix feedback, store listing + GIF, privacy policy, submit by Dec 16 | Live in Chrome Web Store |

## Week 1 task list
- [ ] Scaffold with WXT (TypeScript), add Vitest and Playwright
- [ ] Spike: `src/lib/ai.ts` calls `LanguageModel.create()` and `prompt()` with `responseConstraint`
- [ ] Save 10 real checkout/signup pages to `tests/fixtures/` with an `expected.json` each
- [ ] Script that runs the AI on each fixture and scores it against expected
- [ ] First two rules: trial length and renewal language
- [ ] Sunday gate: record the score in `notes/week-1.md`
