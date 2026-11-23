import { looksLikeCheckout } from '@/lib/detect';
import { extractPageText } from '@/lib/extract';
import { runRules } from '@/lib/rules';
import type { ScanMessage } from './background';

export default defineContentScript({
  // Week 3: host access becomes optional and is requested during onboarding.
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  async main() {
    if (!looksLikeCheckout(location.href, document)) return;

    // Give single-page checkouts a moment to render their price and terms.
    await new Promise((r) => setTimeout(r, 1500));

    const { focusText } = extractPageText(document);
    const findings = runRules(focusText);
    // Week 1: log only. The in-page card arrives in Week 3.
    console.info("[What's the Catch] findings", findings);
    const msg: ScanMessage = { type: 'scan-result', findings };
    await browser.runtime.sendMessage(msg).catch(() => undefined);
  },
});
