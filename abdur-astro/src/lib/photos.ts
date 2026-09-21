import type { CollectionEntry } from 'astro:content';

export type Photo = CollectionEntry<'photos'>;
export type Filter = NonNullable<Photo['data']['filters']>[number];

/** Total integration across all filters, in hours. 0 if not confirmed yet. */
export function totalHours(filters?: Filter[]): number {
  return (filters ?? []).reduce((sum, f) => sum + f.hours, 0);
}

/** "30.5" / "20" — trims a trailing .0 so the log stays terse. */
export function formatHours(hours: number): string {
  return (Math.round(hours * 10) / 10).toFixed(1).replace(/\.0$/, '');
}

/** "HA · OIII · SII" for card log lines. Empty string if not confirmed yet. */
export function filterNames(filters?: Filter[]): string {
  return (filters ?? []).map((f) => f.name.toUpperCase()).join(' · ');
}

/**
 * The entry's markdown body reduced to plain paragraphs, for the lightbox panel
 * where there is no place to render real markup.
 */
export function plainDescription(body?: string): string {
  return (body ?? '')
    .replace(/^---[\s\S]*?---/, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/[*_`]/g, '')
    .split(/\n\s*\n/)
    .map((para) => para.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * True when the filter set is a single unbroken total rather than a real
 * breakdown, i.e. the integration is known but the per-filter split isn't.
 */
export function isUnsplitIntegration(filters?: Filter[]): boolean {
  return filters?.length === 1 && /^total$/i.test(filters[0].name);
}

/** One-line log footer used on cards: "M 51 · 30.5 H · L R G B", skipping any part that isn't confirmed yet. */
export function logLine(photo: Photo): string {
  const total = totalHours(photo.data.filters);
  const parts = [photo.data.target];
  if (total > 0) parts.push(`${formatHours(total)} H`);
  // A lone "Total" filter is the absence of a breakdown, so naming it as one
  // would render "44.5 H · TOTAL" and say nothing the hours don't already.
  const names = isUnsplitIntegration(photo.data.filters)
    ? ''
    : filterNames(photo.data.filters);
  if (names) parts.push(names);
  return parts.join(' · ');
}

/**
 * Filter → colour for the integration bar. Narrowband filters use the
 * emission colours astrophotographers already map them to; broadband
 * LRGB stays monochrome (because LRGB channels *are* monochrome frames).
 */
export function filterColor(name: string): string {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  switch (key) {
    case 'ha':
    case 'halpha':
    case 'h':
      return 'var(--color-ha)';
    case 'sii':
    case 's2':
      return 'var(--color-dust)';
    case 'oiii':
    case 'o3':
      return 'var(--color-oiii)';
    case 'l':
    case 'lum':
      return 'color-mix(in srgb, var(--color-star) 88%, transparent)';
    case 'r':
      return 'color-mix(in srgb, var(--color-star) 62%, transparent)';
    case 'g':
      return 'color-mix(in srgb, var(--color-star) 44%, transparent)';
    case 'b':
      return 'color-mix(in srgb, var(--color-star) 28%, transparent)';
    default:
      return 'color-mix(in srgb, var(--color-star) 55%, transparent)';
  }
}

/** Newest first — the gallery's default order. */
export function byDateDesc(a: Photo, b: Photo): number {
  return b.data.date.valueOf() - a.data.date.valueOf();
}
