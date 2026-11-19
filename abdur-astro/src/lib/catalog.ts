/**
 * Everything the site sells, keyed by Stripe Payment Link, built at compile
 * time from the same data that renders the prices. The thank-you page embeds
 * it so a returning checkout (`?link=<id>`) can be named and valued.
 */
import { getCollection } from 'astro:content';
import { CONSULTING_HOUR_LINKS, HOURLY_RATE, TUTORIAL_HOUR_LINKS } from '../data/checkout';
import { RENTAL_SCOPES } from '../data/rentals';
import { linkId, type TrackedItem } from './track';

export type CatalogEntry = TrackedItem & { link: string };

const hours = (n: number) => `${n} hour${n > 1 ? 's' : ''}`;

export async function getCheckoutCatalog(): Promise<CatalogEntry[]> {
  const prints = await getCollection('prints');

  const entries: CatalogEntry[] = [
    ...prints.flatMap((print) =>
      print.data.options.map((option) => ({
        link: linkId(option.stripeLink),
        id: print.id,
        name: `${print.data.title} print`,
        variant: `${option.size} · ${option.paper}`,
        category: 'print' as const,
        value: option.price,
      })),
    ),
    // A rate without a Payment Link yet is booked by email, so nothing
    // comes back from Stripe for it to name.
    ...RENTAL_SCOPES.flatMap((scope) =>
      scope.rates
        .filter((rate) => rate.stripeLink)
        .map((rate) => ({
          link: linkId(rate.stripeLink),
          id: scope.slug,
          name: `${scope.name} rental`,
          variant: rate.term,
          category: 'rental' as const,
          value: rate.price,
        })),
    ),
    ...TUTORIAL_HOUR_LINKS.map((url, i) => ({
      link: linkId(url),
      id: 'tutorial',
      name: 'One-on-one tutorial',
      variant: hours(i + 1),
      category: 'tutorial' as const,
      value: HOURLY_RATE * (i + 1),
    })),
    ...CONSULTING_HOUR_LINKS.map((url, i) => ({
      link: linkId(url),
      id: 'consulting',
      name: 'Equipment consulting',
      variant: hours(i + 1),
      category: 'consulting' as const,
      value: HOURLY_RATE * (i + 1),
    })),
  ];

  // Two products sharing a Payment Link would make a sale unattributable.
  // Fail the build rather than ship a catalog that reports the wrong item.
  const seen = new Map<string, CatalogEntry>();
  for (const entry of entries) {
    if (!entry.link) throw new Error(`Checkout catalog: unparseable Stripe link for ${entry.name} ${entry.variant}`);
    const prior = seen.get(entry.link);
    if (prior) {
      throw new Error(
        `Checkout catalog: Stripe link ${entry.link} is used by both "${prior.name} ${prior.variant}" and "${entry.name} ${entry.variant}"`,
      );
    }
    seen.set(entry.link, entry);
  }
  return entries;
}
