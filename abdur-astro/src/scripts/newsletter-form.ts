// Footer signup: submit via fetch with inline status instead of leaving the
// site. Without JS it still works as a plain POST to Web3Forms.
//
// When the footer is offering the processing guide, the status element carries
// its URL and the success line links to it. The link only appears after a
// sign-up, but the URL is in the page (and the guide itself is a public
// Patreon post), so this is a courtesy, not a lock.
import { logToLeadSheet } from '../lib/leadSheet';
import { lead } from '../lib/track';

const form = document.getElementById('newsletter-form') as HTMLFormElement | null;

if (form) {
  const status = document.getElementById('newsletter-status');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (button) button.disabled = true;
    if (status) status.textContent = 'Joining…';

    try {
      logToLeadSheet(form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const result = (await response.json()) as { success?: boolean; message?: string };
      if (response.ok && result.success) {
        // Read before reset(): the hidden field names which offer this was.
        const offer = form.querySelector<HTMLInputElement>('input[name="form"]')?.value;
        lead(offer || 'Newsletter signup', 'newsletter');
        form.reset();
        if (status) {
          status.textContent = status.dataset.success ?? "You're on the list, thank you.";
          const guideUrl = status.dataset.guideUrl;
          if (guideUrl) {
            const link = document.createElement('a');
            const target = new URL(guideUrl, window.location.href);
            link.href = target.href;
            link.className = 'link-quiet ml-2 text-dust-bright';
            if (target.origin === window.location.origin) {
              // A file on this site downloads in place.
              link.textContent = 'Download the guide';
              link.setAttribute('download', '');
            } else {
              // A guide hosted elsewhere (Patreon) opens beside the site, so
              // the visitor doesn't lose the page they signed up from.
              link.textContent = target.hostname.endsWith('patreon.com')
                ? 'Open the guide on Patreon'
                : 'Open the guide';
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
            }
            status.append(' ', link);
          }
        }
      } else {
        throw new Error(result.message ?? 'Signup failed');
      }
    } catch {
      if (status) status.textContent = 'Could not sign up just now. Please try again shortly.';
    } finally {
      if (button) button.disabled = false;
    }
  });
}
