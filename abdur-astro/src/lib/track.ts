/**
 * Conversion events for the Meta Pixel and the Google tag (GA4 + Google Ads).
 *
 * Every call is a no-op unless Tracking.astro loaded the tags: no IDs
 * configured, the visitor turned measurement off, or their browser sends
 * Global Privacy Control. Both tags queue calls made before their library
 * arrives, so callers never wait on them.
 *
 * Values are the list price in CAD. A promotion code applied at Stripe's
 * checkout isn't visible to a static site, so a discounted sale reports its
 * undiscounted value; Stripe's dashboard is the source of truth for revenue.
 */

export type CheckoutCategory = 'print' | 'rental' | 'tutorial' | 'consulting';

export interface TrackedItem {
  /** Stable product id, e.g. "andromeda-galaxy" or "scope-rental". */
  id: string;
  name: string;
  /** e.g. "16 × 24″ · Archival matte", "Weekend", "2 hours". */
  variant?: string;
  category: CheckoutCategory;
  /** CAD. */
  value: number;
}

interface AdsConfig {
  adsId?: string;
  purchaseLabel?: string;
  leadLabel?: string;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    aaAds?: AdsConfig;
    aaTrackingLoaded?: boolean;
    aaTrackingOff?: boolean;
    aaTrackingConsent?: 'opt-out' | 'opt-in';
    aaStorageBlocked?: boolean;
    aaLoadTracking?: () => void;
    aaStopTracking?: () => void;
  }
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}

const CURRENCY = 'CAD';
const PENDING_KEY = 'aa:pending-checkout';
/** A checkout older than this isn't the one that just came back from Stripe. */
const PENDING_TTL_MS = 48 * 60 * 60 * 1000;

/** The Payment Link's own id: the path of its buy.stripe.com URL. */
export function linkId(url: string): string {
  try {
    return new URL(url).pathname.replace(/^\/+/, '');
  } catch {
    return '';
  }
}

// Storage can throw (private windows, blocked site data); tracking must never
// break a checkout, so every access is guarded.
const store = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* unavailable */
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* unavailable */
    }
  },
};

/**
 * Whether the site may send an event right now. Checked on every call, not
 * just at page load: a visitor who turns measurement off on /privacy, or in
 * another tab, stops being measured from their next click, not their next page.
 */
export function trackingActive(): boolean {
  if (!window.aaTrackingLoaded || window.aaTrackingOff) return false;
  if (navigator.globalPrivacyControl === true) return false;
  const choice = trackingChoice();
  return window.aaTrackingConsent === 'opt-in' ? choice === 'on' : choice !== 'off';
}

const metaParams = (item: TrackedItem) => ({
  content_ids: [item.id],
  content_type: 'product',
  content_name: item.variant ? `${item.name} · ${item.variant}` : item.name,
  content_category: item.category,
  value: item.value,
  currency: CURRENCY,
});

const ga4Item = (item: TrackedItem) => ({
  item_id: item.id,
  item_name: item.name,
  item_variant: item.variant,
  item_category: item.category,
  price: item.value,
  quantity: 1,
});

/** A product page was viewed. */
export function viewItem(item: TrackedItem): void {
  if (!trackingActive()) return;
  window.fbq?.('track', 'ViewContent', metaParams(item));
  window.gtag?.('event', 'view_item', {
    currency: CURRENCY,
    value: item.value,
    items: [ga4Item(item)],
  });
}

/**
 * A page listing several things for sale. GA4 gets the list; Meta only gets
 * ViewContent where something can be bought on the page itself (`buyable`),
 * so its product-view audiences don't fill up with people who only browsed
 * an index.
 */
export function viewItemList(listName: string, items: TrackedItem[], buyable = false): void {
  if (!items.length || !trackingActive()) return;
  if (buyable) {
    window.fbq?.('track', 'ViewContent', {
      content_ids: items.map((i) => i.id),
      content_type: 'product',
      content_name: listName,
    });
  }
  window.gtag?.('event', 'view_item_list', {
    item_list_name: listName,
    items: items.map(ga4Item),
  });
}

/**
 * Clicks on the email address anywhere on the site, reported as Meta's
 * standard Contact event. Delegated once from the layout, so links added
 * later are covered too.
 */
export function watchContactLinks(): void {
  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest?.('a[href^="mailto:"]');
    if (!link || !trackingActive()) return;
    window.fbq?.('track', 'Contact');
    window.gtag?.('event', 'contact', { method: 'email' });
  });
}

/**
 * The visitor is being handed to Stripe. Also remembers what they chose, so
 * the thank-you page can still value the sale if Stripe's redirect doesn't
 * name the link (e.g. a redirect set by hand without `link=`).
 */
export function beginCheckout(item: TrackedItem, stripeUrl: string): void {
  // Remembered whether or not measurement is on: it only lets the thank-you
  // page name the order, and never leaves the browser.
  store.set(PENDING_KEY, JSON.stringify({ ...item, link: linkId(stripeUrl), at: Date.now() }));
  if (!trackingActive()) return;
  window.fbq?.('track', 'InitiateCheckout', { ...metaParams(item), num_items: 1 });
  window.gtag?.('event', 'begin_checkout', {
    currency: CURRENCY,
    value: item.value,
    items: [ga4Item(item)],
  });
}

/** A form that starts a conversation succeeded (newsletter, contact, free intro). */
export function lead(source: string, category?: string): void {
  if (!trackingActive()) return;
  window.fbq?.('track', 'Lead', { content_name: source, content_category: category });
  window.gtag?.('event', 'generate_lead', { lead_source: source });
  const ads = window.aaAds;
  if (ads?.adsId && ads.leadLabel) {
    window.gtag?.('event', 'conversion', { send_to: `${ads.adsId}/${ads.leadLabel}` });
  }
}

/**
 * A payment completed. `transactionId` is Stripe's Checkout Session id, used
 * as Meta's eventID and Google's transaction_id so a repeat of the same
 * session is counted once.
 */
export function purchase(item: TrackedItem, transactionId: string): void {
  if (!trackingActive()) return;
  window.fbq?.(
    'track',
    'Purchase',
    { ...metaParams(item), num_items: 1 },
    { eventID: transactionId },
  );
  window.gtag?.('event', 'purchase', {
    transaction_id: transactionId,
    currency: CURRENCY,
    value: item.value,
    items: [ga4Item(item)],
  });
  const ads = window.aaAds;
  if (ads?.adsId && ads.purchaseLabel) {
    window.gtag?.('event', 'conversion', {
      send_to: `${ads.adsId}/${ads.purchaseLabel}`,
      value: item.value,
      currency: CURRENCY,
      transaction_id: transactionId,
    });
  }
}

/** The checkout remembered by beginCheckout, if recent; cleared once read. */
export function takePendingCheckout(): (TrackedItem & { link: string }) | null {
  const raw = store.get(PENDING_KEY);
  store.remove(PENDING_KEY);
  if (!raw) return null;
  try {
    const pending = JSON.parse(raw) as TrackedItem & { link: string; at: number };
    if (typeof pending.at !== 'number' || Date.now() - pending.at > PENDING_TTL_MS) return null;
    if (typeof pending.value !== 'number' || !pending.id) return null;
    return pending;
  } catch {
    return null;
  }
}

const FIRED_KEY = 'aa:purchases';

/** True the first time a session id is seen on this browser, false after. */
export function claimPurchase(sessionId: string): boolean {
  let fired: string[] = [];
  try {
    fired = JSON.parse(store.get(FIRED_KEY) ?? '[]') as string[];
    if (!Array.isArray(fired)) fired = [];
  } catch {
    fired = [];
  }
  if (fired.includes(sessionId)) return false;
  store.set(FIRED_KEY, JSON.stringify([...fired, sessionId].slice(-50)));
  return true;
}

/** The visitor's stored measurement choice: 'on', 'off', or null (never chosen). */
export const TRACKING_CHOICE_KEY = 'aa:tracking';
export function trackingChoice(): 'on' | 'off' | null {
  const v = store.get(TRACKING_CHOICE_KEY);
  return v === 'on' || v === 'off' ? v : null;
}
/** Saves the choice; false if this browser wouldn't store it. */
export function setTrackingChoice(choice: 'on' | 'off'): boolean {
  store.set(TRACKING_CHOICE_KEY, choice);
  return store.get(TRACKING_CHOICE_KEY) === choice;
}
