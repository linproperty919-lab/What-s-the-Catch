# What's the Catch

Chrome extension (Manifest V3) that flags auto-renewals, hidden fees and dark patterns on checkout and signup pages. Uses Chrome's built-in Gemini Nano (Prompt API) on-device, with a rules engine that always runs. Full spec: `SPEC.md`.

## Stack
- TypeScript, WXT (builds the MV3 manifest), Vite
- Vitest for unit tests, Playwright for e2e on saved fixture pages
- No backend, no database, no analytics in v1

## Commands
- `npm run dev`: WXT dev build with hot reload (load `.output/chrome-mv3` unpacked)
- `npm test`: Vitest
- `npm run e2e`: Playwright against `tests/fixtures/`
- `npm run build` / `npm run zip`: production build and store zip

## Layout
- `src/entrypoints/content.ts`: extract page text, render the in-page card
- `src/entrypoints/background.ts`: service worker, orchestrates rules + AI
- `src/entrypoints/popup/`: history and settings
- `src/lib/extract.ts`: DOM to clean text chunks
- `src/lib/rules/`: one file per rule, each with a test
- `src/lib/ai.ts`: the ONLY file that touches the Prompt API (`LanguageModel`)
- `src/lib/schema.ts`: JSON schema passed as `responseConstraint`
- `src/lib/storage.ts`: wrapper over `chrome.storage` (sync = settings, local = history, reminders)
- `tests/fixtures/`: saved checkout/signup HTML pages with expected findings

## Hard rules
- Never read, store or send payment card fields (`autocomplete="cc-*"`, payment iframes). Extraction must skip them.
- No network requests anywhere in v1. No remote code (MV3 forbids it).
- Every AI finding must quote text that exists on the page; drop findings whose quote is not found.
- Rules engine must work with AI unavailable. Check `LanguageModel.availability()` and degrade gracefully.
- Auto-scan: only read pages that pass the cheap URL + DOM checkout pre-filter. Host access is an optional permission requested at onboarding.
- Wording in UI says "may" and shows the source quote. Never claim a site is breaking the law.

## Working conventions
- Small vertical slices: one feature + its tests per change.
- Write or update a test before fixing a bug.
- Keep `ai.ts` thin so Prompt API changes touch one file.
- Run `npm test` after each change; run e2e before a PR.
