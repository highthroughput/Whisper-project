// Footer newsletter signup: submit via fetch with inline status instead of
// leaving the site. Without JS it still works as a plain POST to Web3Forms.
export {}; // isolate this file's scope — see contact-form.ts's `form` for why

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
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const result = (await response.json()) as { success?: boolean; message?: string };
      if (response.ok && result.success) {
        form.reset();
        if (status) status.textContent = "You're on the list — thank you.";
      } else {
        throw new Error(result.message ?? 'Signup failed');
      }
    } catch {
      if (status) status.textContent = 'Could not sign up just now — please try again shortly.';
    } finally {
      if (button) button.disabled = false;
    }
  });
}
