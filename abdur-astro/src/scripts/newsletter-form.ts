// Footer signup: submit via fetch with inline status instead of leaving the
// site. Without JS it still works as a plain POST to Web3Forms.
//
// When the footer is offering the processing guide, the status element carries
// the download URL and the success line reveals it. The link is added on
// success only, so the guide is not simply sitting in the page source for
// anyone who never gives an address.
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
            link.href = guideUrl;
            link.textContent = 'Download the guide';
            link.className = 'link-quiet ml-2 text-dust-bright';
            link.setAttribute('download', '');
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
