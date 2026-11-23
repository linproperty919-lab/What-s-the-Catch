# Fixtures

Saved checkout and signup pages used by the tests and by the fixture lab (`lab.html`).

The six pages here are **synthetic** (made-up companies) so the repo has a starting set. Week 1 needs
**10 real pages** too:

1. Open a real checkout or trial signup page in Chrome (stop before paying).
2. File → Save Page As → "Webpage, HTML Only" into this folder, with a short kebab-case name.
3. Add an entry to `index.json` with what a careful human reads on the page:
   `trial_days` (0 if none, 1 month = 30), `renews` (true/false), `cancel_method`
   (`online`, `phone`, `email`, `in_person`, or `unknown` if the page doesn't say).
4. Check the saved file for personal details (your email, name, address) and delete them before committing.

`npm test` checks the rules against every fixture; the lab page also scores Gemini Nano.
