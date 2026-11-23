import { aiAvailability } from '@/lib/ai';

void aiAvailability().then((a) => {
  document.getElementById('ai')!.textContent = a;
});
document.getElementById('lab')!.addEventListener('click', (e) => {
  e.preventDefault();
  void browser.tabs.create({ url: browser.runtime.getURL('/lab.html') });
});
