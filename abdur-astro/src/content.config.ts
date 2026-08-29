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
      telescope: z.string(),
      camera: z.string(),
      mount: z.string(),
      /** Per-filter integration; total hours are computed by summing these. */
      filters: z
        .array(
          z.object({
            name: z.string(),
            hours: z.number().positive(),
          }),
        )
        .min(1),
      /** Human-readable capture window, e.g. "Mar – Apr 2025 · 11 nights". */
      captured: z.string(),
      /** Machine date (last light) used for sorting. */
      date: z.coerce.date(),
      location: z.string(),
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

export const collections = { photos, prints };
