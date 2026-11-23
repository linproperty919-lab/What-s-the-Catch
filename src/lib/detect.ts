const URL_WORDS =
  /(checkout|check-out|subscribe|subscription|signup|sign-up|register|trial|billing|payment|cart|order|plans?|pricing|upgrade)/i;

const BUTTON_WORDS =
  /(start (my |your )?(free )?trial|(proceed to )?check ?out|try (it )?free|subscribe|place (your )?order|complete (purchase|order)|pay now|buy now|join now|continue to payment|start membership)/i;

/**
 * Cheap pre-filter: does this page look like a checkout or signup?
 * Runs on every page in auto-scan mode, so it must stay fast and read nothing sensitive.
 */
export function looksLikeCheckout(url: string, doc: Document): boolean {
  if (URL_WORDS.test(new URL(url).pathname + new URL(url).search)) return true;

  // A card field on the page is a strong signal. We only check it exists; we never read it.
  if (doc.querySelector('input[autocomplete^="cc-"], iframe[src*="stripe"], iframe[name*="card" i]')) {
    return true;
  }

  const buttons = doc.querySelectorAll('button, input[type="submit"], a[role="button"]');
  for (const el of Array.from(buttons).slice(0, 200)) {
    const label = (el.textContent || (el as HTMLInputElement).value || '').trim();
    if (BUTTON_WORDS.test(label)) return true;
  }
  return false;
}
