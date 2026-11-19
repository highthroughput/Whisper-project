/**
 * The sky calendar on /events: Moon phases, meteor showers, planets, eclipses
 * and seasons for Calgary and Southern Alberta, in Mountain Time.
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
  /** YYYY-MM-DD, Mountain Time. */
  date: string;
  /** Local time with its zone label, e.g. "17:52 MST"; empty for all-night events. */
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
  { date: '2026-11-24', time: '07:53 MST', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2026-12-08', time: '17:52 MST', title: 'New Moon', type: 'Moon', note: NEW('2026-12-04', '2026-12-05'), source: USNO },
  { date: '2026-12-13', time: '', title: 'Geminids peak night (Dec 13–14)', type: 'Meteor shower', note: 'Strongest shower of the year; active Dec 4–17, 2026', source: AMS },
  { date: '2026-12-21', time: '', title: 'Ursids peak night (Dec 21–22)', type: 'Meteor shower', note: 'Low rates; active Dec 17–26, 2026', source: AMS },
  { date: '2026-12-21', time: '', title: 'Winter solstice', type: 'Season', note: 'Longest night of the year', source: USNO },
  { date: '2026-12-23', time: '18:28 MST', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-01-03', time: '', title: 'Quadrantids peak night (Jan 3–4)', type: 'Meteor shower', note: 'Short ~6 h peak; AMS: ~18% waning crescent Moon, favourable; ~25/hr under dark skies', source: AMS },
  { date: '2027-01-07', time: '13:24 MST', title: 'New Moon', type: 'Moon', note: NEW('2027-01-08', '2027-01-09'), source: USNO },
  { date: '2027-01-22', time: '05:17 MST', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-02-06', time: '08:56 MST', title: 'New Moon', type: 'Moon', note: NEW('2027-02-05', '2027-02-06'), source: USNO },
  { date: '2027-02-11', time: '', title: 'Jupiter at opposition', type: 'Planet', note: 'Jupiter visible all night, biggest and brightest; great for star parties (date per Hong Kong Observatory, HKT; may be Feb 10 in Alberta)', source: HKO },
  { date: '2027-02-19', time: '', title: 'Mars at opposition', type: 'Planet', note: 'Mars visible all night (date per HKO, HKT; may be Feb 18 in Alberta)', source: HKO },
  { date: '2027-02-20', time: '18:06–18:13 MST', title: 'Penumbral lunar eclipse (barely visible)', type: 'Eclipse', note: 'Calgary: Moon very low in ENE at moonrise, max ~6:09 pm; subtle shading only', source: TAD },
  { date: '2027-02-20', time: '16:23 MST', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-03-08', time: '02:29 MST', title: 'New Moon', type: 'Moon', note: NEW('2027-03-05', '2027-03-06'), source: USNO },
  { date: '2027-03-20', time: '14:25 MDT', title: 'March equinox', type: 'Season', note: 'Equinox periods are often cited as active aurora times', source: USNO },
  { date: '2027-03-22', time: '04:44 MDT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-04-06', time: '17:51 MDT', title: 'New Moon', type: 'Moon', note: NEW('2027-04-02', '2027-04-03'), source: USNO },
  { date: '2027-04-20', time: '16:27 MDT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-04-21', time: '', title: 'Lyrids peak night (Apr 21–22)', type: 'Meteor shower', note: 'AMS: full Moon on peak night, significant interference', source: AMS },
  { date: '2027-05-05', time: '', title: 'Eta Aquariids peak night (May 5–6)', type: 'Meteor shower', note: 'AMS: ~2% Moon, very favourable; 10–30/hr before dawn in northern hemisphere', source: AMS },
  { date: '2027-05-06', time: '04:58 MDT', title: 'New Moon', type: 'Moon', note: NEW('2027-05-07', '2027-05-08'), source: USNO },
  { date: '2027-05-20', time: '04:59 MDT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-06-04', time: '13:40 MDT', title: 'New Moon', type: 'Moon', note: NEW('2027-06-04', '2027-06-05'), source: USNO },
  { date: '2027-06-18', time: '18:44 MDT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-06-21', time: '08:11 MDT', title: 'June solstice', type: 'Season', note: 'Shortest nights; Alberta never gets fully dark near solstice, so plan Moon/planet/social nights, not deep-sky', source: USNO },
  { date: '2027-07-03', time: '21:02 MDT', title: 'New Moon', type: 'Moon', note: NEW('2027-07-02', '2027-07-03'), source: USNO },
  { date: '2027-07-18', time: '09:45 MDT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-07-30', time: '', title: 'Southern Delta Aquariids + Alpha Capricornids (Jul 30–31)', type: 'Meteor shower', note: 'AMS: ~14% Moon, favourable; Alpha Capricornids known for fireballs', source: AMS },
  { date: '2027-08-02', time: '', title: 'Total solar eclipse (NOT visible from Alberta)', type: 'Eclipse', note: 'Path over N Africa/Spain/Middle East; content hook only', source: TAD },
  { date: '2027-08-02', time: '04:05 MDT', title: 'New Moon', type: 'Moon', note: NEW('2027-07-30', '2027-07-31'), source: USNO },
  { date: '2027-08-12', time: '', title: 'Perseids peak night (Aug 12–13)', type: 'Meteor shower', note: 'AMS: ~79% waxing gibbous Moon; 30–50/hr from rural sites', source: AMS },
  { date: '2027-08-16', time: '23:24 MDT – 03:03 MDT Aug 17', title: 'Penumbral lunar eclipse', type: 'Eclipse', note: 'Calgary: max ~1:13 am Aug 17; subtle shading', source: TAD },
  { date: '2027-08-17', time: '01:29 MDT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-08-31', time: '11:41 MDT', title: 'New Moon', type: 'Moon', note: NEW('2027-08-27', '2027-08-28'), source: USNO },
  { date: '2027-09-15', time: '17:03 MDT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-09-23', time: '00:02 MDT', title: 'September equinox', type: 'Season', note: 'Start of long dark nights; aurora and deep-sky season ramps up', source: USNO },
  { date: '2027-09-29', time: '20:36 MDT', title: 'New Moon', type: 'Moon', note: NEW('2027-10-01', '2027-10-02'), source: USNO },
  { date: '2027-10-15', time: '07:47 MDT', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-10-18', time: '', title: 'Saturn at opposition', type: 'Planet', note: 'Saturn visible all night (date per HKO, HKT; may be Oct 17 in Alberta)', source: HKO },
  { date: '2027-10-21', time: '', title: 'Orionids peak (Oct 21–22)', type: 'Meteor shower', note: 'Moon roughly last-quarter/half lit per AMS & MeteorShowerCal', source: AMS },
  { date: '2027-10-29', time: '07:36 MDT', title: 'New Moon', type: 'Moon', note: NEW('2027-10-29', '2027-10-30'), source: USNO },
  { date: '2027-11-13', time: '20:26 MST', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-11-18', time: '', title: 'Leonids peak (Nov 18, UTC)', type: 'Meteor shower', note: '~80% waning gibbous Moon', source: AMS },
  { date: '2027-11-27', time: '20:24 MST', title: 'New Moon', type: 'Moon', note: NEW('2027-11-26', '2027-11-27'), source: USNO },
  { date: '2027-12-13', time: '09:09 MST', title: 'Full Moon', type: 'Moon', note: FULL, source: USNO },
  { date: '2027-12-14', time: '', title: 'Geminids peak (Dec 14, UTC)', type: 'Meteor shower', note: '~98% full Moon on peak: poor year', source: AMS },
  { date: '2027-12-21', time: '19:42 MST', title: 'December solstice', type: 'Season', note: 'Longest night', source: USNO },
  { date: '2027-12-23', time: '', title: 'Ursids peak (Dec 23, UTC)', type: 'Meteor shower', note: '~21% waning crescent Moon', source: AMS },
  { date: '2027-12-27', time: '13:12 MST', title: 'New Moon', type: 'Moon', note: NEW('2027-12-24', '2027-12-25'), source: USNO },
];

/** Today's date in Mountain Time as YYYY-MM-DD: the build date the lists filter on. */
export function mountainToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Edmonton',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Rows dated today or later (Mountain Time), in date order. */
export function upcomingSkyEvents(events = SKY_EVENTS, today = mountainToday()): SkyEvent[] {
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
 * Event structured data, only for real hosted star parties that are still to
 * come and have everything Google needs. Astronomical phenomena never get it:
 * a meteor shower isn't an event anyone organises or sells.
 */
export function starPartyEventJsonLd(events = SKY_EVENTS, today = mountainToday()): Record<string, unknown>[] {
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
