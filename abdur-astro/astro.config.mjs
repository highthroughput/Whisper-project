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
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
