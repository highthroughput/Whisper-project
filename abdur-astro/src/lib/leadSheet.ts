import { SITE } from '../config';

/**
 * Fire-and-forget copy of a form submission to the lead-capture Google Sheet,
 * alongside the real Web3Forms submission. Google Apps Script web apps don't
 * send CORS headers, so this runs in 'no-cors' mode: the request goes through,
 * but the response is opaque and can't be inspected, so failures here are
 * silent by design and never affect the visible form status.
 *
 * `keepalive` lets the browser finish sending this request even if the page
 * navigates away right after (e.g. redirecting to Stripe on a paid booking) —
 * without it, a same-tab navigation can abort the request mid-flight.
 */
export function logToLeadSheet(form: HTMLFormElement): void {
  fetch(SITE.leadSheetWebhook, {
    method: 'POST',
    mode: 'no-cors',
    keepalive: true,
    body: new FormData(form),
  }).catch(() => {});
}
