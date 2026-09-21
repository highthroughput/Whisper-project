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
