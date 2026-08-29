// Contact form enhancements:
// 1. Preselect the topic from ?topic= (the Services "Inquire" buttons link here).
// 2. Submit via fetch with inline status instead of leaving the site.
// Without JS the form still works as a plain POST to Web3Forms.
const form = document.getElementById('contact-form') as HTMLFormElement | null;

if (form) {
  const topic = new URLSearchParams(window.location.search).get('topic');
  const select = form.querySelector<HTMLSelectElement>('#topic');
  if (topic && select && [...select.options].some((o) => o.value === topic)) {
    select.value = topic;
  }

  const status = document.getElementById('form-status');
  const subject = form.querySelector<HTMLInputElement>('input[name="subject"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (subject && select) {
      const label = select.options[select.selectedIndex]?.text ?? 'General inquiry';
      subject.value = `${label} — Abdur Astro contact form`;
    }

    if (button) button.disabled = true;
    if (status) status.textContent = 'Sending…';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const result = (await response.json()) as { success?: boolean; message?: string };
      if (response.ok && result.success) {
        form.reset();
        if (status) status.textContent = 'Received — thank you. Expect a reply within two days.';
      } else {
        throw new Error(result.message ?? 'Submission failed');
      }
    } catch {
      if (status) {
        status.textContent = 'Could not send just now — please email hello@abdurastro.ca directly.';
      }
    } finally {
      if (button) button.disabled = false;
    }
  });
}
