import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Gallery photographs.
 * Adding a photo = drop an image in src/assets/photos/ + one markdown file in
 * src/content/photos/. See "Adding a new photo" in README.md.
 */
const photos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/photos' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Messier / common catalogue handle shown in the log, e.g. "M 51". */
      target: z.string(),
      /** Secondary designation, e.g. "NGC 5194 / 5195". */
      designation: z.string().optional(),
      constellation: z.string(),
      ra: z.string(),
      dec: z.string(),
      image: image(),
      alt: z.string().min(10),
      /** Omit any of these until the real acquisition data is confirmed; the log hides missing fields rather than showing a placeholder. */
      telescope: z.string().optional(),
      camera: z.string().optional(),
      mount: z.string().optional(),
      /** Per-filter integration; total hours are computed by summing these. Omit until confirmed. */
      filters: z
        .array(
          z.object({
            name: z.string(),
            hours: z.number().positive(),
          }),
        )
        .min(1)
        .optional(),
      /** Human-readable capture window, e.g. "Mar – Apr 2025 · 11 nights". */
      captured: z.string().optional(),
      /** Machine date (last light) used for sorting. */
      date: z.coerce.date(),
      location: z.string().optional(),
      /** Featured photos appear on the home page. */
      featured: z.boolean().default(false),
    }),
});

/**
 * Prints for sale.
 * Adding a print = one markdown file in src/content/prints/ referencing an
 * image, with one option row (size + paper + price + Stripe Payment Link)
 * per variant. See "Adding a new print" in README.md.
 */
const prints = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/prints' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Slug of the matching gallery photo, for the acquisition-log cross-link. */
      photo: z.string().optional(),
      image: image(),
      alt: z.string().min(10),
      /**
       * Real photograph of the print framed and hung. Used as the shop grid card
       * and as the first image on the product page, ahead of the artwork itself.
       */
      lifestyleImage: image().optional(),
      /** Alt text for `lifestyleImage`. Required whenever that image is set. */
      lifestyleAlt: z.string().min(10).optional(),
      /** One line under the title on the product page. */
      tagline: z.string(),
      edition: z.string().default('Open edition, signed'),
      options: z
        .array(
          z.object({
            size: z.string(),
            paper: z.string(),
            /** CAD. Must match the amount configured on the Stripe Payment Link. */
            price: z.number().positive(),
            /** Placeholder token (see README) — replaced with a real Stripe Payment Link URL. */
            stripeLink: z.string(),
          }),
        )
        .min(1),
      featured: z.boolean().default(false),
      order: z.number().default(99),
    }),
});

/**
 * Calendar entries: star parties and other events being hosted, plus
 * astronomical events happening regardless (meteor showers, solstices, etc).
 * Adding an event = one markdown file in src/content/events/. See
 * "Adding a new event" in README.md.
 */
const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    /** 'hosted' = a star party or talk being run personally; 'astronomical' = a sky event happening regardless. */
    kind: z.enum(['hosted', 'astronomical']),
    /** Machine date used for sorting; past events drop off the calendar. */
    date: z.coerce.date(),
    /** Human-readable date/time shown in the log, e.g. "Peak night, Oct 8" or "Sat Nov 14 · 7–10pm". */
    when: z.string(),
    location: z.string().optional(),
    /** Hosted events: where to book or RSVP. */
    rsvpLink: z.string().optional(),
    /** Astronomical events: link to more detail. */
    infoUrl: z.string().optional(),
  }),
});

/**
 * Testimonials from people Abdur has taught or sold to. Adding one = one
 * markdown file in src/content/testimonials/ with the quote as the body.
 * See "Adding a new testimonial" in README.md.
 *
 * Quotes about the transaction rather than the work ("packaged well", "fast
 * shipping") belong on the marketplace listing, not here.
 */
const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    author: z.string(),
    date: z.coerce.date(),
    rating: z.number().min(1).max(5).default(5),
    source: z.string().default('Facebook Marketplace'),
  }),
});

export const collections = { photos, prints, events, testimonials };
