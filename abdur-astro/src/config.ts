/**
 * Site-wide constants. Everything marked PLACEHOLDER is listed in the
 * "Replace before launch" checklist in README.md.
 */
export const SITE = {
  name: 'Abdur Astro',
  tagline: 'Deep-sky astrophotography from the dark skies of Central Alberta',

  /** PLACEHOLDER — replace with the real contact address once email forwarding is set up. */
  email: 'hello@abdurastro.ca',

  region: 'Central Alberta, Canada',
  /** Approximate — a wink at the observation log, not a home address. */
  coordinates: '52.3° N · 113.8° W',

  /** PLACEHOLDER — replace all three with real profile URLs. */
  social: {
    youtube: 'https://www.youtube.com/@PLACEHOLDER_YOUTUBE',
    instagram: 'https://www.instagram.com/PLACEHOLDER_INSTAGRAM',
    facebook: 'https://www.facebook.com/PLACEHOLDER_FACEBOOK',
  },

  /** PLACEHOLDER — create a free key at https://web3forms.com and paste it here. */
  web3formsKey: 'WEB3FORMS_ACCESS_KEY_PLACEHOLDER',
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
