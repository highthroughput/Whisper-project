/**
 * The sky calendar on /events: Moon phases, meteor showers, planets, eclipses
 * and seasons for Calgary and Southern Alberta, in Alberta Time (ABT).
 *
 * Alberta stopped changing its clocks on 2026-11-01: Alberta Time is UTC-6
 * all year (alberta.ca, "Alberta's new time system (ABT)"). Times here are
 * ABT, and a date is the Alberta date of the event: an opposition or a meteor
 * maximum listed for a UTC or Hong Kong date can fall a day earlier here.
 *
 * Pages show only rows dated on or after the day the site was built, so the
 * site has to be rebuilt at least monthly (every deploy does it) for past
 * dates to drop off. Add next year's rows before the last ones here pass.
 *
 * Sources: Moon phases and seasons, US Naval Observatory. Meteor showers,
 * American Meteor Society. Planet oppositions, Hong Kong Observatory.
 * Eclipse visibility for Calgary, timeanddate.com.
 */

export type SkyEventType = 'Moon' | 'Meteor shower' | 'Planet' | 'Eclipse' | 'Season' | 'Star party';

export interface SkyEvent {
  /** YYYY-MM-DD, the date in Alberta. */
  date: string;
  /** Local time with its zone label, e.g. "18:52 ABT"; empty for all-night events. */
  time: string;
  title: string;
  type: SkyEventType;
  note: string;
  source: string;
  /**
   * Only for a real, hosted star party (`type: 'Star party'`): these three
   * are what make it eligible for Event structured data. None exist yet.
   */
  startDate?: string;
  location?: string;
  url?: string;
}

const USNO = 'US Naval Observatory';
const AMS = 'American Meteor Society';
const HKO = 'Hong Kong Observatory';
const TAD = 'timeanddate.com';

const FULL =
  'Bright Moon: good for Moon/planet-focused nights and beginner rentals; poor for faint galaxies and nebulae';
const NEW = (fri: string, sat: string) =>
  `Dark-sky window for star parties and deep-sky imaging. Nearest weekend (derived): Fri ${fri} / Sat ${sat}`;

export const SKY_EVENTS: SkyEvent[] = [
  { date: '2026-11-24', time: '08:53 ABT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2026-12-08', time: '18:52 ABT', title: 'New Moon', type: 'Moon', note: NEW('2026-12-04', '2026-12-05'), source: USNO },
  { date: '2026-12-13', time: '', title: 'Geminids peak night (Dec 13–14)', type: 'Meteor shower', note: 'Strongest shower of the year; active Dec 4–17, 2026', source: AMS },
  { date: '2026-12-22', time: '', title: 'Ursids peak night (Dec 22–23)', type: 'Meteor shower', note: 'Low rates, and a nearly full Moon up all night: a poor year; active Dec 17–26, 2026', source: AMS },
  { date: '2026-12-21', time: '', title: 'Winter solstice', type: 'Season', note: 'Longest night of the year', source: USNO },
  { date: '2026-12-23', time: '19:28 ABT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-01-03', time: '', title: 'Quadrantids peak night (Jan 3–4)', type: 'Meteor shower', note: 'Short ~6 h peak; ~12% waning crescent Moon that rises at dawn, favourable; ~25/hr under dark skies', source: AMS },
  { date: '2027-01-07', time: '14:24 ABT', title: 'New Moon', type: 'Moon', note: NEW('2027-01-08', '2027-01-09'), source: USNO },
  { date: '2027-01-22', time: '06:17 ABT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-02-06', time: '09:56 ABT', title: 'New Moon', type: 'Moon', note: NEW('2027-02-05', '2027-02-06'), source: USNO },
  { date: '2027-02-10', time: '', title: 'Jupiter at opposition', type: 'Planet', note: 'Jupiter visible all night, biggest and brightest; great for star parties', source: HKO },
  { date: '2027-02-19', time: '', title: 'Mars at opposition', type: 'Planet', note: 'Mars visible all night, and closest to Earth that evening, about 101 million km away', source: HKO },
  { date: '2027-02-20', time: '19:06–19:13 ABT', title: 'Penumbral lunar eclipse (not observable from Calgary)', type: 'Eclipse', note: 'The deepest part, about 5:12 pm, is before moonrise; the Moon comes up in the ENE at 7:06 pm, in bright twilight, as the eclipse ends 7 minutes later. No shading to see', source: TAD },
  { date: '2027-02-20', time: '17:23 ABT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-03-08', time: '03:29 ABT', title: 'New Moon', type: 'Moon', note: NEW('2027-03-05', '2027-03-06'), source: USNO },
  { date: '2027-03-20', time: '14:25 ABT', title: 'March equinox', type: 'Season', note: 'Equinox periods are often cited as active aurora times', source: USNO },
  { date: '2027-03-22', time: '04:44 ABT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-04-06', time: '17:51 ABT', title: 'New Moon', type: 'Moon', note: NEW('2027-04-02', '2027-04-03'), source: USNO },
  { date: '2027-04-20', time: '16:27 ABT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-04-22', time: '', title: 'Lyrids peak night (Apr 22–23)', type: 'Meteor shower', note: 'Waning gibbous Moon (about 94%) rises before midnight: significant interference', source: AMS },
  { date: '2027-05-05', time: '', title: 'Eta Aquariids peak night (May 5–6)', type: 'Meteor shower', note: 'No Moon, but from Calgary the radiant only clears the horizon in morning twilight: a few meteors an hour at best', source: AMS },
  { date: '2027-05-06', time: '04:58 ABT', title: 'New Moon', type: 'Moon', note: NEW('2027-05-07', '2027-05-08'), source: USNO },
  { date: '2027-05-20', time: '04:59 ABT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-06-04', time: '13:40 ABT', title: 'New Moon', type: 'Moon', note: NEW('2027-06-04', '2027-06-05'), source: USNO },
  { date: '2027-06-18', time: '18:44 ABT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-06-21', time: '08:11 ABT', title: 'June solstice', type: 'Season', note: 'Shortest nights; Alberta never gets fully dark near solstice, so plan Moon/planet/social nights, not deep-sky', source: USNO },
  { date: '2027-07-03', time: '21:02 ABT', title: 'New Moon', type: 'Moon', note: NEW('2027-07-02', '2027-07-03'), source: USNO },
  { date: '2027-07-18', time: '09:45 ABT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-07-30', time: '', title: 'Southern Delta Aquariids + Alpha Capricornids (Jul 30–31)', type: 'Meteor shower', note: '~7% waning crescent Moon that rises at dawn, favourable; Alpha Capricornids known for fireballs', source: AMS },
  { date: '2027-08-02', time: '', title: 'Total solar eclipse (not visible from Alberta)', type: 'Eclipse', note: 'The path of totality crosses Spain, North Africa and the Middle East', source: TAD },
  { date: '2027-08-02', time: '04:05 ABT', title: 'New Moon', type: 'Moon', note: NEW('2027-07-30', '2027-07-31'), source: USNO },
  { date: '2027-08-12', time: '', title: 'Perseids peak night (Aug 12–13)', type: 'Meteor shower', note: '~86% waxing gibbous Moon sets about 2 am, leaving dark sky before dawn; 30–50/hr from rural sites', source: AMS },
  { date: '2027-08-16', time: '23:24 ABT – 03:03 ABT Aug 17', title: 'Penumbral lunar eclipse', type: 'Eclipse', note: 'Calgary: max ~1:13 am Aug 17; subtle shading', source: TAD },
  { date: '2027-08-17', time: '01:29 ABT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-08-31', time: '11:41 ABT', title: 'New Moon', type: 'Moon', note: NEW('2027-08-27', '2027-08-28'), source: USNO },
  { date: '2027-09-15', time: '17:03 ABT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-09-23', time: '00:02 ABT', title: 'September equinox', type: 'Season', note: 'Start of long dark nights; aurora and deep-sky season ramps up', source: USNO },
  { date: '2027-09-29', time: '20:36 ABT', title: 'New Moon', type: 'Moon', note: NEW('2027-10-01', '2027-10-02'), source: USNO },
  { date: '2027-10-15', time: '07:47 ABT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-10-17', time: '', title: 'Saturn at opposition', type: 'Planet', note: 'Saturn visible all night', source: HKO },
  { date: '2027-10-21', time: '', title: 'Orionids peak (Oct 21–22)', type: 'Meteor shower', note: 'Moon just past half, rising before midnight near the radiant: significant interference', source: AMS },
  { date: '2027-10-29', time: '07:36 ABT', title: 'New Moon', type: 'Moon', note: NEW('2027-10-29', '2027-10-30'), source: USNO },
  { date: '2027-11-13', time: '21:26 ABT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-11-17', time: '', title: 'Leonids peak night (Nov 17–18)', type: 'Meteor shower', note: '~80% waning gibbous Moon; best before dawn on Nov 18', source: AMS },
  { date: '2027-11-27', time: '21:24 ABT', title: 'New Moon', type: 'Moon', note: NEW('2027-11-26', '2027-11-27'), source: USNO },
  { date: '2027-12-13', time: '10:09 ABT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-12-14', time: '', title: 'Geminids peak night (Dec 14–15)', type: 'Meteor shower', note: 'Nearly full Moon (about 98%) up all night: a poor year', source: AMS },
  { date: '2027-12-21', time: '20:42 ABT', title: 'December solstice', type: 'Season', note: 'Longest night', source: USNO },
  { date: '2027-12-22', time: '', title: 'Ursids peak night (Dec 22–23)', type: 'Meteor shower', note: '~21% waning crescent Moon; the short peak is late in the evening of Dec 22', source: AMS },
  { date: '2027-12-27', time: '14:12 ABT', title: 'New Moon', type: 'Moon', note: NEW('2027-12-24', '2027-12-25'), source: USNO },
];

/** Alberta Time's offset from UTC, all year since 2026-11-01. */
const ALBERTA_OFFSET_HOURS = -6;

/**
 * Today's date in Alberta as YYYY-MM-DD: the build date the lists filter on.
 * A fixed offset rather than the America/Edmonton zone, so a build machine
 * with older time zone data can't put the date an hour out.
 */
export function albertaToday(now = new Date()): string {
  return new Date(now.getTime() + ALBERTA_OFFSET_HOURS * 3_600_000).toISOString().slice(0, 10);
}

/** Rows dated today or later (Alberta Time), in date order. */
export function upcomingSkyEvents(events = SKY_EVENTS, today = albertaToday()): SkyEvent[] {
  return events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
}

/** The Friday and Saturday a New Moon row's note names, or null. */
export function darkWeekend(event: SkyEvent): { fri: string; sat: string } | null {
  const m = event.note.match(/Fri (\d{4}-\d{2}-\d{2}) \/ Sat (\d{4}-\d{2}-\d{2})/);
  return m ? { fri: m[1], sat: m[2] } : null;
}

/** "2026-12-04" → "Dec 4", read as a calendar date with no time zone shift. */
export function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** "Dark weekend: Fri Dec 4 / Sat Dec 5" for a New Moon row. */
export function darkWeekendLabel(event: SkyEvent): string | null {
  const w = darkWeekend(event);
  return w ? `Dark weekend: Fri ${shortDate(w.fri)} / Sat ${shortDate(w.sat)}` : null;
}

/**
 * The next `count` dark weekends whose Saturday hasn't passed. Judged on the
 * weekend, not the New Moon: a weekend can fall a few days either side of
 * its New Moon, so filtering on the New Moon's date would drop a weekend
 * still to come or keep one already gone.
 */
export function upcomingDarkWeekends(count: number, events = SKY_EVENTS, today = albertaToday()): SkyEvent[] {
  return events
    .filter((e) => e.type === 'Moon' && e.title === 'New Moon' && (darkWeekend(e)?.sat ?? '') >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count);
}

/**
 * Event structured data, only for real hosted star parties that are still to
 * come and have everything Google needs. Astronomical phenomena never get it:
 * a meteor shower isn't an event anyone organises or sells.
 */
export function starPartyEventJsonLd(events = SKY_EVENTS, today = albertaToday()): Record<string, unknown>[] {
  return events
    .filter((e) => e.type === 'Star party' && e.startDate && e.location && e.url && e.date >= today)
    .map((e) => ({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: e.title,
      description: e.note,
      startDate: e.startDate,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: e.location, address: { '@type': 'PostalAddress', addressRegion: 'AB', addressCountry: 'CA' } },
      organizer: { '@id': 'https://abdurastro.com/#business' },
      url: e.url,
    }));
}
