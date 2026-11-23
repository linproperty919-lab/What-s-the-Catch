# What's the Catch

A Chrome extension that reads checkout and sign-up pages and flags auto-renewals, cancellation traps,
hidden fees and other catches before you click Buy. It uses Chrome's built-in on-device AI
(Gemini Nano), so nothing you browse leaves your computer.

Status: Week 1 of 4 (see [SPEC.md](SPEC.md)).

## Develop

```bash
npm install
npm run dev        # opens Chrome with the extension loaded, hot reload
npm test           # unit + fixture tests
npm run compile    # type check
npm run build      # production build in .output/chrome-mv3
```

To load a build by hand: `chrome://extensions` → Developer mode → Load unpacked → `.output/chrome-mv3`.

### Fixture lab (Week 1 spike)

Click the toolbar icon → **Open the fixture lab** → **Run all fixtures**. It runs the rules and
Gemini Nano on every page in `public/fixtures/` and scores both. If the model shows
`downloadable`, click **Download model** first. Add real pages as described in
[public/fixtures/README.md](public/fixtures/README.md).

## Privacy

No servers, no analytics, no network requests. Payment card fields are never read.

## License

MIT
