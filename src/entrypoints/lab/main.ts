import { aiAvailability, createSession, readTerms } from '@/lib/ai';
import { extractPageText } from '@/lib/extract';
import { runRules, termsFromFindings } from '@/lib/rules';
import { findingsFromAi } from '@/lib/verify';
import { scoreAi, scoreRules, type Fixture } from '@/lib/score';

const $ = (id: string) => document.getElementById(id)!;
// Fixture file names are only known at runtime, so widen WXT's typed getURL.
const asset = (path: string) => (browser.runtime.getURL as (p: string) => string)(path);

async function refreshAvailability() {
  const a = await aiAvailability();
  $('ai').textContent = a;
  ($('download') as HTMLButtonElement).hidden = a !== 'downloadable';
  return a;
}

$('download').addEventListener('click', async () => {
  // Creating a session from a click starts the one-time model download.
  const s = await createSession((f) => ($('progress').textContent = `${Math.round(f * 100)}%`));
  s.destroy();
  await refreshAvailability();
});

$('run').addEventListener('click', async () => {
  const fixtures: Fixture[] = await (await fetch(asset('/fixtures/index.json'))).json();
  const useAi = (await refreshAvailability()) === 'available';
  const session = useAi ? await createSession() : null;
  const rows = $('rows');
  rows.innerHTML = '';
  let aiRight = 0;
  let rulesRight = 0;

  for (const fx of fixtures) {
    const html = await (await fetch(asset(`/fixtures/${fx.file}`))).text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const { fullText, focusText } = extractPageText(doc);

    const rules = termsFromFindings(runRules(focusText));
    const rulesOk = scoreRules(rules, fx.expected);
    if (rulesOk) rulesRight++;

    let aiCell = 'skipped (AI not available)';
    let aiFindings = '';
    if (session) {
      const t0 = performance.now();
      const ai = await readTerms(session, focusText).catch((e: Error) => {
        aiCell = `error: ${e.message}`;
        return null;
      });
      const ms = Math.round(performance.now() - t0);
      if (ai) {
        const ok = scoreAi(ai, fx.expected);
        if (ok) aiRight++;
        aiCell = `<span class="${ok ? 'pass' : 'fail'}">${ok ? 'PASS' : 'FAIL'}</span> <span class="muted">${ms} ms</span><pre>${escape(JSON.stringify({ trial_days: ai.trial_days, renews: ai.renews, cancel_method: ai.cancel_method, renewal_price: ai.renewal_price }, null, 1))}</pre>`;
        aiFindings = findingsFromAi(ai, fullText).map((f) => `• ${escape(f.title)} <span class="muted">“${escape(f.quote)}”</span>`).join('<br>');
      }
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escape(fx.file)}<div class="muted">${escape(fx.note ?? '')}</div></td>
      <td><pre>${escape(JSON.stringify(fx.expected, null, 1))}</pre></td>
      <td><span class="${rulesOk ? 'pass' : 'fail'}">${rulesOk ? 'PASS' : 'FAIL'}</span><pre>${escape(JSON.stringify(rules))}</pre></td>
      <td>${aiCell}</td><td>${aiFindings}</td>`;
    rows.append(tr);
  }
  session?.destroy();
  $('score').textContent = `Rules: ${rulesRight}/${fixtures.length}` + (session ? ` · AI: ${aiRight}/${fixtures.length}` : '');
});

function escape(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

void refreshAvailability();
