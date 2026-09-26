/**
 * Stripe Payment Links for everything the site sells outside the print
 * collection (prints keep theirs in each `src/content/prints/*.md` file).
 *
 * These live here rather than in the pages that render them because the
 * `/thank-you` page needs the same list: Stripe redirects back with the link
 * that was paid, and this is how the page knows what was bought and for how
 * much. One source means a price change can't leave tracking reporting the
 * old amount.
 */

/** Hourly rate for tutorials and consulting, CAD. Not shown on the site. */
export const HOURLY_RATE = 100;

/** One Payment Link per hour, index 0 = 1 hour. */
export const TUTORIAL_HOUR_LINKS: [string, string, string, string, string] = [
  'https://buy.stripe.com/3cI3cxewu3cFe7v9bu3Nm0E',
  'https://buy.stripe.com/9B67sN3RQ8wZgfDbjC3Nm0F',
  'https://buy.stripe.com/7sYfZj5ZY7sVaVj87q3Nm0G',
  'https://buy.stripe.com/4gMaEZageeVn2oN87q3Nm0H',
  'https://buy.stripe.com/fZuaEZewudRjbZn87q3Nm0I',
];

/** One Payment Link per hour, index 0 = 1 hour. */
export const CONSULTING_HOUR_LINKS: [string, string, string, string, string] = [
  'https://buy.stripe.com/cNi28tdsq3cF4wVdrK3Nm0J',
  'https://buy.stripe.com/14A00l4VU7sVbZn87q3Nm0K',
  'https://buy.stripe.com/8x28wRage3cF2oNcnG3Nm0L',
  'https://buy.stripe.com/14A3cx2NM9B39RffzS3Nm0M',
  'https://buy.stripe.com/cNidRbage9B38Nbafy3Nm0N',
];

export interface RentalRate {
  term: string;
  /** The most nights this rate covers. */
  nights: number;
  detail: string;
  /** CAD. Must match the amount on the Stripe Payment Link. */
  price: number;
  stripeLink: string;
}

/**
 * The three published scope-rental rates, cheapest first. A booking is
 * charged the first rate that covers its length, so the tier follows from the
 * dates rather than being picked.
 */
export const RENTAL_RATES: RentalRate[] = [
  {
    term: 'One night',
    nights: 1,
    detail: 'Up to 1 night',
    price: 20,
    stripeLink: 'https://buy.stripe.com/5kQ7sN9cabJb0gFgDW3Nm0B',
  },
  {
    term: 'Weekend',
    nights: 3,
    detail: 'Up to 3 nights',
    price: 35,
    stripeLink: 'https://buy.stripe.com/28E6oJ4VUbJbfbz2N63Nm0C',
  },
  {
    term: 'Weekly',
    nights: 7,
    detail: 'Up to 7 nights',
    price: 70,
    stripeLink: 'https://buy.stripe.com/dRm28tewu9B3gfD4Ve3Nm0D',
  },
];
