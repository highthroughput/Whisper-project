/**
 * With `build.format: 'file'`, Astro 7's `Astro.url.pathname` includes the
 * generated file name (`/gallery.html`, `/index.html`). Canonical, OG, and
 * JSON-LD URLs must instead match the clean URLs Cloudflare Pages serves.
 */
export function cleanPathname(pathname: string): string {
  return pathname.replace(/index\.html$/, '').replace(/\.html$/, '');
}
