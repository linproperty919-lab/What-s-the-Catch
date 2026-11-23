import type { Finding } from '@/lib/types';

export type ScanMessage = { type: 'scan-result'; findings: Finding[] };

export default defineBackground(() => {
  // Content scripts report findings; we show the count on the toolbar badge for that tab.
  browser.runtime.onMessage.addListener((msg: ScanMessage, sender) => {
    if (msg?.type !== 'scan-result' || !sender.tab?.id) return;
    const count = msg.findings.length;
    void browser.action.setBadgeText({ tabId: sender.tab.id, text: count ? String(count) : '' });
    void browser.action.setBadgeBackgroundColor({ tabId: sender.tab.id, color: '#B45309' });
  });
});
