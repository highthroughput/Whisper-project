/**
 * Photo credit for Google Images: an ImageObject naming the photographer and
 * the copyright, one per place a photograph appears (Google wants markup "for
 * every instance an image is used").
 *
 * `contentUrl` has to be the image URL the page actually serves, and for a
 * responsive image Google asks for the largest one. So the page's <Image> and
 * this markup take their settings from the same object: the URL here is the
 * biggest candidate of the very srcset the page renders.
 */
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

export interface ResponsiveImageSettings {
  widths: number[];
  sizes: string;
  quality: number;
}

/** The swipeable images on a print page. */
export const PRINT_SLIDE_IMAGE: ResponsiveImageSettings = {
  widths: [640, 1080, 1600, 2200],
  sizes: '(min-width: 1024px) 55vw, 100vw',
  quality: 80,
};

/** The photograph at the top of a gallery page. */
export const GALLERY_PHOTO_IMAGE: ResponsiveImageSettings = {
  widths: [640, 1080, 1600, 2200],
  sizes: '(min-width: 1280px) 1152px, 100vw',
  quality: 80,
};

export async function photoCredit(
  src: ImageMetadata,
  settings: ResponsiveImageSettings,
  site: URL | undefined,
): Promise<Record<string, unknown>> {
  const image = await getImage({ src, ...settings });
  // Astro leaves out widths larger than the original, so the largest real
  // candidate is looked up rather than assumed to be the last width asked for.
  const largest = image.srcSet.values.reduce((best, candidate) =>
    parseInt(candidate.descriptor ?? '0', 10) > parseInt(best.descriptor ?? '0', 10) ? candidate : best,
  );
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: new URL(largest.url, site).href,
    creator: { '@type': 'Person', name: 'Abdur', url: new URL('/about', site).href },
    creditText: 'Abdur Astro',
    copyrightNotice: '© Abdur Astro',
  };
}
