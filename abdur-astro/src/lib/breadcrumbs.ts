/**
 * Breadcrumb trails: the visible one (components/Breadcrumbs.astro) and the
 * BreadcrumbList structured data are built from the same list, so they can't
 * disagree. "Home" is added here; pages pass only what comes after it.
 */

export interface Crumb {
  label: string;
  /** Site path, e.g. "/rentals". The last crumb (this page) may omit it. */
  href?: string;
}

/** The full trail, Home first. */
export const trail = (crumbs: Crumb[]): Crumb[] => [{ label: 'Home', href: '/' }, ...crumbs];

/** BreadcrumbList for `crumbs`, ending at the page at `pageUrl`. */
export function breadcrumbJsonLd(crumbs: Crumb[], site: URL | undefined, pageUrl: string): Record<string, unknown> {
  const items = trail(crumbs);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      item: i === items.length - 1 ? pageUrl : new URL(crumb.href ?? '/', site).href,
    })),
  };
}
