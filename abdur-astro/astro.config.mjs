// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Production domain (registered via Cloudflare). Drives canonical URLs,
  // the sitemap, Open Graph URLs, and JSON-LD — change only if the domain changes.
  site: 'https://abdurastro.com',
  // `file` build format + no trailing slashes matches how Cloudflare Pages
  // canonicalizes clean URLs (/gallery -> gallery.html), so canonical tags,
  // the sitemap, and the served URLs all agree.
  trailingSlash: 'never',
  build: { format: 'file' },
  // The post-checkout page is noindex and means nothing without a Stripe
  // session, and /404 isn't a page anyone should land on from search, so
  // both stay out. lastmod is the build time: every deploy rebuilds every
  // page (the sky calendar drops past dates), so it is honest for all of them.
  integrations: [
    sitemap({
      filter: (page) => !/\/(thank-you|404)$/.test(page),
      lastmod: new Date(),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
