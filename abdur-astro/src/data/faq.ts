/**
 * Questions and answers for /faq, and for the FAQ sections on /rentals,
 * /prints and /star-parties. Prices are read from the data the booking and
 * shop pages use, so an answer can't quote an old price.
 *
 * An answer is a list of parts: plain text, or text with a link. Pages render
 * the links; the FAQPage structured data uses the plain text.
 */
import { getCollection } from 'astro:content';
import { SITE } from '../config';
import { RENTAL_SCOPES } from './rentals';
import { LESSON_RENTAL_NIGHT, STAR_PARTY, darkSiteDistance, hoursInWords, starPartyTotal } from './star-parties';

export type AnswerPart = string | { text: string; href: string };

export interface FaqItem {
  q: string;
  a: AnswerPart[];
}

export interface FaqGroup {
  id: 'rentals' | 'star-parties' | 'prints';
  title: string;
  items: FaqItem[];
}

/** An answer as plain text, for structured data. */
export const answerText = (a: AnswerPart[]) => a.map((p) => (typeof p === 'string' ? p : p.text)).join('');

const TERM_PHRASE: Record<string, string> = { 'One night': 'a night', Weekend: 'a weekend', Weekly: 'a week' };

function rentalPrices(): string {
  return RENTAL_SCOPES.map(
    (scope) =>
      `${scope.shortName}: ${scope.rates.map((r) => `$${r.price} ${TERM_PHRASE[r.term] ?? r.term.toLowerCase()}`).join(', ')}.`,
  ).join(' ');
}

const join = (items: string[], conjunction = 'and') =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} ${conjunction} ${items.at(-1)}`;

export async function getFaqGroups(): Promise<FaqGroup[]> {
  const prints = await getCollection('prints');
  const options = prints.flatMap((p) => p.data.options);
  const sizes = [...new Set(options.map((o) => o.size))];
  const papers = [...new Set(options.map((o) => o.paper.replace(/\s*\(.*\)$/, '')))].map((p, i) =>
    i === 0 ? p.toLowerCase() : p,
  );
  const lowest = Math.min(...options.map((o) => o.price));
  const highest = Math.max(...options.map((o) => o.price));
  const sp = STAR_PARTY;
  const [small, large] = sp.examples;

  return [
    {
      id: 'rentals',
      title: 'Telescope rentals',
      items: [
        {
          q: 'Do I need experience to rent a telescope?',
          a: [
            'No. Every pickup includes a walkthrough of the scope and accessories, every rental comes with a curated observing guide, and the Orion 8″ includes a setup video (scan the QR code that comes with it).',
          ],
        },
        {
          q: 'How long can I rent for?',
          a: [
            'One night, a weekend (up to 3 nights) or a week (up to 7 nights). For other date ranges, ',
            { text: 'get in touch', href: '/contact?topic=rentals' },
            '.',
          ],
        },
        { q: 'What does it cost?', a: [`${rentalPrices()} Rates are in CAD.`] },
        {
          q: 'Where do I pick it up?',
          a: [
            'In Cochrane; the exact address comes with your booking confirmation. One night: pick up the same day, return the next day. Weekend: pick up Friday, return Sunday or Monday. Week: pick up on day 1, return on day 8.',
          ],
        },
        {
          q: 'Which telescope should I rent?',
          a: [
            'The 10″ collects about half again as much light, which you notice most on faint galaxies and nebulae from a dark site. The 8″ is lighter to carry, and on the Moon, the planets and bright clusters the difference is small. For a first night out, or to keep the cost down, start with the 8″.',
          ],
        },
        {
          q: 'Can you show me how to use it?',
          a: [
            `Yes. An observing lesson + rental night is $${LESSON_RENTAL_NIGHT.price}: an evening with Abdur and the rental scope, at least ${hoursInWords(LESSON_RENTAL_NIGHT.minHours)} of observing, with that night's rental included. `,
            { text: 'Ask through the contact form', href: '/contact?topic=tutorials' },
            '.',
          ],
        },
        {
          q: 'How do I book?',
          a: [
            "Pick your dates on the telescope's page and pay through Stripe. We allow a day between rentals to check the scope over, and confirm your dates by email after payment.",
          ],
        },
        { q: 'Do I need to be a club member?', a: ['No.'] },
      ],
    },
    {
      id: 'star-parties',
      title: 'Private star parties',
      items: [
        {
          q: 'How much is a star party?',
          a: [
            `$${sp.bookingFee} booking fee plus $${sp.perGuest} per guest (CAD). ${small} guests is $${starPartyTotal(small)}; ${large} guests is $${starPartyTotal(large)}. Groups of up to ${sp.maxGuests}; ask about larger groups.`,
          ],
        },
        {
          q: 'Where can it be held?',
          a: [
            `Your acreage, campground, lodge or venue, or any fairly dark spot. Otherwise, a dark site ${darkSiteDistance()} near ${sp.darkSite.near} in ${sp.darkSite.area}.`,
          ],
        },
        {
          q: 'How long is it?',
          a: [`At least ${hoursInWords(sp.minHours)} of guided observing. Abdur arrives early to set up his largest telescopes.`],
        },
        {
          q: "What if it's cloudy?",
          a: ['The party moves to the next clear night in the window at no extra charge, or you get a full refund and can rebook.'],
        },
        { q: 'What kinds of events?', a: ['Birthdays, family gatherings, camps, team retreats and weddings.'] },
        {
          q: 'When is the best night?',
          a: [
            'Near the new moon for galaxies and nebulae; near a full moon for the Moon and planets. See the ',
            { text: 'sky calendar', href: '/events' },
            '.',
          ],
        },
        {
          q: 'How do I book, and what if I cancel?',
          a: [
            'Send the date, place and head count through the ',
            { text: 'contact form', href: `/contact?topic=${sp.topic}` },
            ' or to ',
            { text: SITE.email, href: `mailto:${SITE.email}` },
            `. The $${sp.bookingFee} booking fee holds the date and is fully refundable if you cancel at least ${sp.refundWindowHours} hours before; the guest fee is due ${sp.guestFeeDueHours} hours before the event.`,
          ],
        },
      ],
    },
    {
      id: 'prints',
      title: 'Prints',
      items: [
        {
          q: 'What are the prints made of?',
          a: [`Archival pigment giclée on ${join(papers, 'or')} paper, with a certificate of authenticity.`],
        },
        {
          q: 'What sizes and prices?',
          a: [`${join(sizes)}, from $${lowest} to $${highest} CAD depending on size and paper.`],
        },
        {
          q: 'How long does shipping take?',
          a: [
            "Current turnaround is 7–10 business days from order to dispatch. Prints ship across North America rolled in a rigid tube. Shipping and taxes are calculated at Stripe checkout; duties, import taxes or brokerage fees on delivery are the customer's responsibility.",
          ],
        },
      ],
    },
  ];
}

/** One FAQPage block for the given items. A page should emit it once. */
export function faqPageJsonLd(items: FaqItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: answerText(item.a) },
    })),
  };
}
