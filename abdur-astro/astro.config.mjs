// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // PLACEHOLDER — replace with the real production domain before launch.
  // Used for canonical URLs, the sitemap, Open Graph URLs, and JSON-LD.
  site: 'https://abdurastro.ca',
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
