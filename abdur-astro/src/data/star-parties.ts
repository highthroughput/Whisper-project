/**
 * Private star parties and the observing lesson + rental night: the prices
 * and terms, in one place. /star-parties, /services, /rentals, /faq and the
 * structured data all read from here, so a price change is one edit.
 *
 * Neither has online checkout yet (phase 2): booking starts with the contact
 * form and Abdur replies with payment details.
 */

export const STAR_PARTY = {
  /** CAD. Holds the date; refundable up to the cancellation window. */
  bookingFee: 150,
  /** CAD per guest, due before the event. */
  perGuest: 25,
  /** Largest group the standard price covers; bigger groups ask. */
  maxGuests: 20,
  /** Worked examples shown with the price. */
  examples: [10, 15],
  /** Hours before the event: full refund of the booking fee if cancelled earlier. */
  refundWindowHours: 24,
  /** Hours before the event the guest fee is due. */
  guestFeeDueHours: 24,
  /** Minimum guided observing once the group arrives. */
  minHours: 2,
  /** The fallback site when the client has no dark spot of their own. */
  darkSite: 'a dark site near Big Hill Springs in Rocky View County, about 40 minutes from downtown Calgary',
  /** Contact form topic key (see INQUIRY_TOPICS in src/config.ts). */
  topic: 'starparty',
} as const;

/** What a party for this many guests costs, CAD. */
export const starPartyTotal = (guests: number) => STAR_PARTY.bookingFee + STAR_PARTY.perGuest * guests;

export const LESSON_RENTAL_NIGHT = {
  /** CAD, that night's rental included. Inquiry only for now. */
  price: 140,
  /** Minimum observing. */
  minHours: 2,
} as const;
