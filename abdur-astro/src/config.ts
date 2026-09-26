/**
 * Site-wide constants. Everything marked PLACEHOLDER is listed in the
 * "Replace before launch" checklist in README.md.
 */
export const SITE = {
  name: 'Abdur Astro',
  tagline: 'Deep-sky astrophotography from the dark skies of Southern Alberta',

  /** Goes live once Cloudflare Email Routing forwards it (see README deploy steps). */
  email: 'info@abdurastro.com',

  region: 'Southern Alberta, Canada',
  /** Approximate — a wink at the observation log, not a home address. */
  coordinates: '51.0° N · 114.1° W',

  social: {
    youtube: 'https://www.youtube.com/@AbdurAstro',
    instagram: 'https://www.instagram.com/abdurastro/',
    tiktok: 'https://www.tiktok.com/@abdurastro',
    x: 'https://x.com/AbdurAstro',
    patreon: 'https://www.patreon.com/cw/AbdurAstro',
  },

  /** Google Business Profile — used for the "Leave a review" link. */
  googleBusiness: 'https://share.google/iRm8W7WB9Pi92lIkK',

  web3formsKey: '53ec3c86-9b83-4d21-898a-f083a4706887',

  /**
   * Footer signup. Set `guideUrl` to the free Siril + Seestar processing guide
   * and the footer switches from a general newsletter pitch to offering the
   * guide in exchange for an email. While it is empty the footer keeps the
   * newsletter copy, so the site never promises a download that isn't there.
   *
   * PLACEHOLDER: no guide file exists yet. Drop it in `public/` (or use a
   * hosted URL) and set the path here.
   *
   * NOTE: submissions currently go to Web3Forms, which emails them, and to the
   * lead sheet below. That is a record of signups, not a mailing list: nothing
   * here can send a broadcast or an automated delivery. Connecting Kit or
   * MailerLite is listed in README "Replace before launch".
   */
  newsletter: {
    guideUrl: '',
  },

  /**
   * Conversion tracking. Every ID empty = no tag is loaded at all, which is
   * the state the site ships in. Paste an ID in and rebuild to switch that
   * tag on; see README "Conversion tracking" for where each comes from and
   * the one-time Stripe redirect setup that makes purchases reportable.
   */
  tracking: {
    /** Meta Pixel ID, digits only (Events Manager → Data sources). */
    metaPixelId: '',
    /** Google Analytics 4 measurement ID, `G-XXXXXXXXXX`. */
    ga4Id: '',
    /** Google Ads account tag, `AW-XXXXXXXXXX`. */
    googleAdsId: '',
    /** Label half of the Ads "Purchase" conversion's send_to (`AW-…/LABEL`). */
    googleAdsPurchaseLabel: '',
    /** Label for an Ads "Lead" conversion (form sign-ups); optional. */
    googleAdsLeadLabel: '',
    /**
     * `opt-out`: tags load unless the visitor turns measurement off on the
     * privacy page (or their browser sends Global Privacy Control).
     * `opt-in`: nothing loads until the visitor accepts a consent banner.
     */
    consent: 'opt-out' as 'opt-out' | 'opt-in',
  },

  /** Google Apps Script Web App that logs every form submission to a lead-capture Google Sheet. */
  leadSheetWebhook:
    'https://script.google.com/macros/s/AKfycbxL0anvH5TP99RPXLD3oDZYR8-mEF8n1Pg7naXcEzjBdv2GgDngOPv8zvd90rJNBcg/exec',
} as const;

/** Subjects offered on the contact form; services link here with ?topic=<key>. */
export const INQUIRY_TOPICS = {
  general: 'General inquiry',
  prints: 'Print order question',
  tutorials: 'One-on-one tutorial',
  consulting: 'Equipment consulting',
  rentals: 'Equipment rental',
  speaking: 'Public speaking',
  starparty: 'Private star party',
} as const;

export type InquiryTopic = keyof typeof INQUIRY_TOPICS;
