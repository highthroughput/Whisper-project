/**
 * Site-wide constants. Everything marked PLACEHOLDER is listed in the
 * "Replace before launch" checklist in README.md.
 */
export const SITE = {
  name: 'Abdur Astro',
  tagline: 'Deep-sky astrophotography from the dark skies of Central Alberta',

  /** Goes live once Cloudflare Email Routing forwards it (see README deploy steps). */
  email: 'info@abdurastro.com',

  region: 'Central Alberta, Canada',
  /** Approximate — a wink at the observation log, not a home address. */
  coordinates: '52.3° N · 113.8° W',

  social: {
    youtube: 'https://www.youtube.com/@AbdurAstro',
    instagram: 'https://www.instagram.com/abdurastro/',
    tiktok: 'https://www.tiktok.com/@abdurastro',
    x: 'https://x.com/AbdurAstro',
    patreon: 'https://www.patreon.com/cw/AbdurAstro',
  },

  web3formsKey: 'c3c0b6ec-abf3-4103-935c-fffd766dbb08',
} as const;

/** Subjects offered on the contact form; services link here with ?topic=<key>. */
export const INQUIRY_TOPICS = {
  general: 'General inquiry',
  prints: 'Print order question',
  tutorials: 'One-on-one tutorial',
  consulting: 'Equipment consulting',
  speaking: 'Public speaking',
  starparty: 'Private star party',
} as const;

export type InquiryTopic = keyof typeof INQUIRY_TOPICS;
