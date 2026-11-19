/**
 * The telescopes for rent. Each one gets a page at /rentals/<slug>, a card on
 * /rentals, and its rates in the checkout catalog the /thank-you page reads,
 * so a price lives here once.
 *
 * A rate with an empty `stripeLink` still books: the form emails the request
 * and says a payment link will follow by email. Paste the Payment Link in
 * once it exists and the same button goes straight to Stripe.
 */
import type { ImageMetadata } from 'astro';
import type { RentalRate } from './checkout';
import skywatcherImage from '../assets/rentals/skywatcher-dobsonian.webp';
import orionImage from '../assets/rentals/orion-8-dobsonian.jpg';

export interface RentalScope {
  /** URL segment, and the product id reported to ad platforms. */
  slug: string;
  /** Full name, as the page heading and the booking email give it. */
  name: string;
  /** Short name for buttons and cross-links, e.g. "Orion 8″". */
  shortName: string;
  /** The mirror, as the hub card shows it on a scope with no photo yet. */
  aperture: string;
  /** Page <title> and meta description. */
  metaTitle: string;
  metaDescription: string;
  /** One line for the card on /rentals. */
  pitch: string;
  /** Opening paragraph, under the heading. */
  intro: string;
  /** Further paragraphs, under the photo. */
  body: string[];
  image?: ImageMetadata;
  imageAlt?: string;
  /** Everything in the case besides the telescope itself. */
  included: string[];
  /** Short summaries for the comparison table on /rentals. */
  eyepieces: string;
  extras: string;
  /** The assembly and first-use video, once it has a public link. */
  setupVideoUrl?: string;
  /** Cheapest first; a booking is charged the first rate that covers it. */
  rates: RentalRate[];
}

export const RENTAL_SCOPES: RentalScope[] = [
  {
    slug: 'sky-watcher-10-dobsonian',
    name: 'Sky-Watcher 10″ 250P Flextube Dobsonian',
    shortName: 'Sky-Watcher 10″',
    aperture: '10″',
    metaTitle: 'Sky-Watcher 10″ Dobsonian Rental',
    metaDescription:
      'Rent a Sky-Watcher 10-inch 250P Flextube Dobsonian telescope in Southern Alberta. One night, weekend, and weekly rates, with eyepiece, finder, and accessories included.',
    pitch:
      'The bigger mirror, with a zoom eyepiece, dew heater and laser collimator in the case. Built for faint galaxies and nebulae from a dark site.',
    intro:
      "A 10-inch reflector big enough to hold Saturn's rings, Jupiter's cloud bands, star clusters, and galaxies steady in the eyepiece, without the cost or the storage of owning one. The collapsible Flextube design sets up in minutes and breaks back down for the drive home.",
    body: [
      "The Dobsonian mount is push-to and point-and-look simple, so tracking an object down is no harder on your first night than your hundredth. It's the same scope for a backyard session, a camping trip, or a dark-sky drive out of the city, and it comes back with you no matter how the night went.",
    ],
    image: skywatcherImage,
    imageAlt:
      'The Sky-Watcher 10″ 250P Flextube Dobsonian telescope set up on its rocker base in a living room, showing the primary mirror, focuser with eyepiece, and collapsible truss tube.',
    included: [
      'Upgraded Baader zoom eyepiece',
      'Red dot finder',
      'Laser collimator',
      'Dew heater',
      'Red headlamp',
      'Curated observing guide',
      'Setup and assembly directions',
    ],
    eyepieces: 'Baader zoom',
    extras: 'Dew heater, laser collimator, red headlamp',
    rates: [
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
    ],
  },
  {
    slug: 'orion-8-dobsonian',
    name: 'Orion 8″ Dobsonian',
    shortName: 'Orion 8″',
    aperture: '8″',
    metaTitle: 'Orion 8″ Dobsonian Rental',
    metaDescription:
      'Rent an Orion 8-inch (200 mm) Dobsonian telescope in Southern Alberta by the night, weekend, or week, with two eyepieces, a red dot finder, an observing guide, and a setup video.',
    pitch:
      'The classic first telescope: an 8-inch reflector with two eyepieces, lighter to carry and simple to set up, at the lower rate.',
    intro:
      "An 8-inch reflector on a simple rocker base, and the telescope people most often get pointed to when they ask what to buy first. It shows the craters along the Moon's terminator, Saturn's rings, Jupiter's cloud bands and moons, and the brighter star clusters and nebulae. It comes apart into a tube and a base for the trip out the door.",
    body: [
      "Two eyepieces come with it. The 25 mm Plössl gives a wide, low-power view that makes things easy to find, and the Celestron 7 mm X-Cel takes over for close-ups of the Moon and planets once you have them centred. A setup video walks through assembly and using the scope: scan the QR code that comes with it to open it.",
      "Rent it for a weekend before deciding whether to buy one, or for a week of clear nights at the cabin.",
    ],
    image: orionImage,
    imageAlt:
      'The Orion 8″ Dobsonian telescope on its black rocker base, set up on concrete outdoors, its dark blue tube angled up with the red dot finder and eyepiece near the top, and a spruce tree and lawn behind.',
    included: [
      '25 mm Orion Plössl eyepiece',
      'Celestron 7 mm X-Cel eyepiece',
      'Red dot finder',
      'Curated observing guide',
      'Setup video for assembly and use (QR code included)',
    ],
    eyepieces: '25 mm Plössl and 7 mm X-Cel',
    extras: 'Setup video',
    // Payment Links not created yet: until they are, bookings go through as
    // emailed requests and Abdur replies with a link. See README, Rentals.
    rates: [
      { term: 'One night', nights: 1, detail: 'Up to 1 night', price: 15, stripeLink: '' },
      { term: 'Weekend', nights: 3, detail: 'Up to 3 nights', price: 30, stripeLink: '' },
      { term: 'Weekly', nights: 7, detail: 'Up to 7 nights', price: 60, stripeLink: '' },
    ],
  },
];

/** The "from" price: this scope's cheapest rate. */
export const lowestRentalRate = (scope: RentalScope) => Math.min(...scope.rates.map((r) => r.price));

/** Every rate on this scope has a Payment Link, so booking goes straight to Stripe. */
export const isPayable = (scope: RentalScope) => scope.rates.every((r) => r.stripeLink);
