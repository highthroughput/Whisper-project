// Contact form enhancements:
// 1. Preselect the topic from ?topic=, by key (?topic=starparty, what the
//    site's own links use) or by the label shown (?topic=Private%20star%20party),
//    ignoring case. Anything else leaves the default.
// 2. Submit via fetch with inline status instead of leaving the site.
// Without JS the form still works as a plain POST to Web3Forms.
import { logToLeadSheet } from '../lib/leadSheet';
import { lead } from '../lib/track';

const form = document.getElementById('contact-form') as HTMLFormElement | null;

if (form) {
  const topic = (new URLSearchParams(window.location.search).get('topic') ?? '').trim().toLowerCase();
  const select = form.querySelector<HTMLSelectElement>('#topic');
  const match =
    topic && select
      ? [...select.options].find((o) => o.value.toLowerCase() === topic || o.text.trim().toLowerCase() === topic)
      : undefined;
  if (select && match) select.value = match.value;

  const status = document.getElementById('form-status');
  const subject = form.querySelector<HTMLInputElement>('input[name="subject"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (subject && select) {
      const label = select.options[select.selectedIndex]?.text ?? 'General inquiry';
      subject.value = `${label} · Abdur Astro contact form`;
    }

    if (button) button.disabled = true;
    if (status) status.textContent = 'Sending…';

    try {
      logToLeadSheet(form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const result = (await response.json()) as { success?: boolean; message?: string };
      if (response.ok && result.success) {
        lead('Contact form', select?.value || 'general');
        form.reset();
        if (status) status.textContent = 'Received, thank you. Expect a reply within two days.';
      } else {
        throw new Error(result.message ?? 'Submission failed');
      }
    } catch {
      if (status) {
        status.textContent = 'Could not send just now. Please email info@abdurastro.com directly.';
      }
    } finally {
      if (button) button.disabled = false;
    }
  });
}
