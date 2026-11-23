import { describe, expect, it } from 'vitest';
import { extractPageText, isSensitiveInput } from './extract';
import { looksLikeCheckout } from './detect';

function doc(html: string): Document {
  const d = document.implementation.createHTMLDocument('t');
  d.body.innerHTML = html;
  return d;
}

describe('extractPageText', () => {
  it('never reads card fields or typed values', () => {
    const d = doc(`<p>Pay $9.99 per month.</p>
      <input autocomplete="cc-number" value="4242424242424242">
      <input name="cardNumber" value="5555555555554444">
      <textarea name="notes">secret note</textarea>
      <script>var x = 1</script>`);
    const { fullText } = extractPageText(d);
    expect(fullText).toContain('Pay $9.99 per month.');
    expect(fullText).not.toMatch(/4242|5555|secret|var x/);
  });

  it('keeps fine print inside collapsed details', () => {
    const d = doc('<details><summary>Terms</summary><p>Renews automatically at $99/year.</p></details>');
    expect(extractPageText(d).focusText).toContain('Renews automatically at $99/year.');
  });

  it('focuses on money-related blocks when the page is long', () => {
    const filler = Array.from({ length: 200 }, (_, i) => `<p>Story paragraph ${i} about our mission.</p>`).join('');
    const d = doc(`${filler}<p>Trial ends after 7 days, then $20/month.</p>`);
    const { focusText } = extractPageText(d, 500);
    expect(focusText).toContain('Trial ends after 7 days');
    expect(focusText.length).toBeLessThanOrEqual(500);
  });
});

describe('isSensitiveInput', () => {
  it('flags card and password inputs', () => {
    const d = doc('<input autocomplete="cc-csc"><input type="password" name="password"><input name="email">');
    const [cvc, pw, email] = Array.from(d.querySelectorAll('input'));
    expect(isSensitiveInput(cvc!)).toBe(true);
    expect(isSensitiveInput(pw!)).toBe(true);
    expect(isSensitiveInput(email!)).toBe(false);
  });
});

describe('looksLikeCheckout', () => {
  it('matches checkout URLs', () => {
    expect(looksLikeCheckout('https://shop.example/checkout', doc(''))).toBe(true);
  });
  it('matches trial buttons on any URL', () => {
    expect(looksLikeCheckout('https://example.com/', doc('<button>Start my free trial</button>'))).toBe(true);
  });
  it('ignores ordinary articles', () => {
    expect(looksLikeCheckout('https://news.example/story/123', doc('<p>Hello</p><button>Share</button>'))).toBe(false);
  });
});
