# Abdur Astro

Astrophotography portfolio and print shop for a deep-sky imager based in Central
Alberta, Canada. Static site — no CMS, no database, no backend. Content lives in
markdown files; checkout is Stripe Payment Links; the contact form posts to Web3Forms.

**Design decisions** (palette, type, the observation-log signature element) are
documented in [DESIGN.md](./DESIGN.md).

## Stack

- [Astro 7](https://astro.build) (static output) + TypeScript
- Tailwind CSS 4 (via `@tailwindcss/vite`; theme tokens in `src/styles/global.css`)
- Astro's built-in image service — responsive `srcset`, WebP, lazy loading below
  the fold; full-resolution files never ship to mobile
- Content collections (`src/content.config.ts`) for photos and prints
- `@astrojs/sitemap`, JSON-LD (LocalBusiness site-wide, Product on print pages)
- Fonts self-hosted via Fontsource: Marcellus / Archivo / IBM Plex Mono

## Local development

Requires **Node 22.12+**.

```sh
cd abdur-astro
npm install
npm run dev        # http://localhost:4321
npm run build      # static build to dist/
npm run preview    # serve the production build locally
npm run check      # astro check (types + template diagnostics)
```

## Project structure

```
abdur-astro/
├── src/
│   ├── assets/photos/        ← image files (owned by git, optimized at build)
│   ├── content/
│   │   ├── photos/           ← one .md per gallery photograph
│   │   └── prints/           ← one .md per print for sale
│   ├── components/           ← ObservationLog, PhotoCard, PrintCard, Header, …
│   ├── layouts/Base.astro    ← head/SEO/OG/JSON-LD + header/footer shell
│   ├── pages/                ← home, gallery (+lightbox), prints, services, about, contact, 404
│   ├── scripts/              ← lightbox, reveals, contact form (all progressive enhancement)
│   ├── styles/global.css     ← palette tokens + component styles
│   └── config.ts             ← site-wide constants (email, socials, Web3Forms key)
├── public/                   ← favicon.svg, robots.txt, _headers
└── astro.config.mjs          ← site URL, sitemap
```

## Adding a new photo (under 5 minutes)

1. Export the photograph as a JPEG (sRGB, ~2200–3000 px on the long edge is
   plenty; the build generates every smaller size). Drop it in
   `src/assets/photos/`, e.g. `rosette-nebula.jpg`.
2. Create `src/content/photos/rosette-nebula.md`:

   ```markdown
   ---
   title: 'Rosette Nebula'
   target: 'NGC 2244'
   designation: 'Caldwell 49'         # optional second designation
   constellation: 'Monoceros'
   ra: '06h 33m 45s'
   dec: '+04° 59′ 54″'
   image: '../../assets/photos/rosette-nebula.jpg'
   alt: 'One full sentence describing what the photograph shows.'
   telescope: 'Sky-Watcher Esprit 100ED · f/5.5'    # optional — omit until confirmed
   camera: 'ZWO ASI2600MM Pro (mono)'               # optional — omit until confirmed
   mount: 'Sky-Watcher EQ6-R Pro'                   # optional — omit until confirmed
   filters:                            # optional — hours per filter, drives the log's integration bar
     - { name: 'Ha', hours: 9.0 }
     - { name: 'OIII', hours: 6.5 }
     - { name: 'SII', hours: 5.0 }
   captured: 'Feb – Mar 2026 · 7 nights'            # optional — omit until confirmed
   date: 2026-03-04                    # last light; used for sort order
   location: 'Backyard observatory · Southern Alberta · Bortle 4'  # optional — omit until confirmed
   featured: false                     # true = appears on the home page
   ---

   A paragraph or two about the object and the nights behind it.
   ```

3. `npm run dev` — the photo is in the gallery, in the lightbox, and has a detail
   page at `/gallery/rosette-nebula` with its observation log. Done.

Filter names map to the integration bar's colours automatically: `Ha` → emission
red, `OIII` → teal, `SII` → dust gold; `L/R/G/B` render as monochrome steps.
Anything else gets a neutral tone.

Any optional field left out of the frontmatter (telescope, camera, mount,
filters, captured, location) is simply omitted from the observation log and
gallery card, not shown as a placeholder. Add it once the real value is
confirmed.

## Adding a new print (under 5 minutes)

1. In Stripe, create one **Payment Link** per size/paper variant (see
   [Stripe setup](#stripe-payment-links)). Have the URLs ready.
2. Create `src/content/prints/rosette-nebula.md`:

   ```markdown
   ---
   title: 'Rosette Nebula'
   photo: 'rosette-nebula'             # slug of the gallery photo (links the observation log)
   image: '../../assets/photos/rosette-nebula.jpg'
   alt: 'One sentence describing the print.'
   tagline: 'One line shown under the title on the product page.'
   edition: 'Open edition · signed'
   options:
     - { size: '12 × 18″', paper: 'Archival matte', price: 145, stripeLink: 'https://buy.stripe.com/…' }
     - { size: '16 × 24″', paper: 'Archival matte', price: 210, stripeLink: 'https://buy.stripe.com/…' }
     - { size: '24 × 36″', paper: 'Baryta fibre',   price: 410, stripeLink: 'https://buy.stripe.com/…' }
   featured: false
   order: 6                            # position in the shop grid
   ---

   A paragraph about the print — how it lives on a wall, what survives at size.
   ```

3. `npm run dev` — the print is in the shop grid with a product page, price
   ledger, buy buttons, and Product JSON-LD. Done.

Once real product photography exists (the print framed and hung, or a close-up
of the physical piece), add it to the frontmatter instead of relying on the
raw astrophoto:

```yaml
lifestyleImage: '../../assets/prints/rosette-nebula-living-room.jpg' # shop grid card
closeupImage: '../../assets/prints/rosette-nebula-closeup.jpg'       # product page hero
```

Both are optional and fall back to `image` (the raw astrophoto) when omitted.

The page's prices are display-only; **the amount charged is whatever the Stripe
Payment Link says**, so keep them in sync.

## Adding a new event (under 2 minutes)

The `/events` page lists two kinds of entries, sorted together by date; past
events drop off automatically.

1. Create `src/content/events/some-slug.md`:

   ```markdown
   ---
   title: 'Private star party · Sylvan Lake'
   kind: 'hosted'                      # 'hosted' (you're running it) or 'astronomical' (a sky event)
   date: 2026-11-14                    # drives sorting and the drop-off-when-past behaviour
   when: 'Sat, Nov 14 · 7–10pm'        # human-readable, shown as-is
   location: 'Sylvan Lake, weather permitting'
   rsvpLink: 'https://buy.stripe.com/…' # optional — falls back to /contact?topic=starparty
   ---

   A line or two about the event.
   ```

2. `npm run dev` — it's on the calendar. Done.

For an `astronomical` entry, use `infoUrl` instead of `rsvpLink` if you want a
"Learn more" link (omit it to show no button, just the write-up).

## Adding a new testimonial (under a minute)

Shown on the home page, newest first, via the `<Testimonials />` component.

1. Create `src/content/testimonials/some-name-date.md`:

   ```markdown
   ---
   author: 'Jane'
   date: 2026-10-01
   rating: 5     # 1–5, defaults to 5
   ---

   The quote itself, verbatim.
   ```

2. `npm run dev` — it's on the home page. Done.

The grid follows the count: one quote runs on its own, two sit side by side,
three or more fill three columns. Keep quotes about the teaching or the
photographs. A review of the transaction ("packaged well", "fast shipping")
belongs on the marketplace listing, since here it reads as a used-gear ad.

## Stripe Payment Links

For each print variant: Stripe Dashboard → **Payment Links → New** → create a
product (e.g. "Whirlpool Galaxy — 16 × 24″ Archival matte"), price in **CAD**,
one-time. Enable **shipping address collection** (Canada and the US, per the
site's "ships across North America" copy), add your shipping rate, and (if
registered) let Stripe Tax handle GST. Copy the `https://buy.stripe.com/…`
URL over the matching placeholder token below.

## Conversion tracking

Off until you add an ID. With every ID in `SITE.tracking` (`src/config.ts`)
empty, no tag code ships at all. Each piece switches on independently:

| Setting | Where to get it | Turns on |
| --- | --- | --- |
| `metaPixelId` | Meta Events Manager → Data sources → your pixel (digits only) | Meta Pixel: PageView, ViewContent, InitiateCheckout, Lead, Purchase |
| `ga4Id` | Google Analytics → Admin → Data streams → web stream (`G-…`) | GA4: view_item, begin_checkout, generate_lead, purchase |
| `googleAdsId` | Google Ads → Goals → Conversions → Tag setup (`AW-…`) | Google Ads tag |
| `googleAdsPurchaseLabel` | The "Purchase" conversion's event snippet, the part after `AW-…/` | Ads purchase conversions with value |
| `googleAdsLeadLabel` | A "Lead" / "Submit lead form" conversion, same place | Ads lead conversions (optional) |

What fires where:

- **Every page** (all 13 templates share `Base.astro`, and there is no
  client-side routing): one page view to each configured tag, plus a Meta
  Contact / GA4 `contact` event whenever the email address is clicked.
- **Print pages**: view on load (at the "from" price), checkout when Buy is
  clicked (at the size and paper actually chosen).
- **Prints index**: a GA4 item list of every print. No Meta product view,
  since nothing is bought there; each print page sends its own.
- **Rentals** and **Services**: a product view on load (from $20; tutorials and
  consulting at one hour), since that's where they are bought.
- **Rentals / paid sessions**: checkout at the hand-off to Stripe. A paid
  session whose booking tab was blocked never reaches Stripe, so it isn't counted.
- **Free intro call, contact form, email sign-up**: lead, on success.
- **`/thank-you`**: purchase, once per Stripe Checkout Session. A refresh,
  a bookmark or a visit without a real session id reports nothing.

### One-time Stripe setup (required for purchases to count)

Stripe has to send customers back to the site after paying. The script sets
all of the site's Payment Links at once, and leaves any other links alone:

```sh
npm run build
STRIPE_SECRET_KEY=rk_live_… node scripts/stripe-redirects.mjs          # dry run, prints the plan
STRIPE_SECRET_KEY=rk_live_… node scripts/stripe-redirects.mjs --apply  # applies it
```

Use a **restricted key** (Developers → API keys → Create restricted key) with
only *Payment Links: Write*, and delete it afterwards. Each link then
redirects to `/thank-you?link=<link id>&session_id={CHECKOUT_SESSION_ID}`.
Re-run it after creating any new Payment Link. Without this step, customers
land on Stripe's own confirmation page and no purchase is recorded.

`--apply` first saves each link's previous after-payment setting to
`stripe-redirects-backup-<time>.json` (git-ignored). The dry run flags any link
with a custom confirmation message, since the redirect replaces it; move
anything a buyer needs from that message onto `/thank-you` first.

### Dashboard settings to match

The code handles most of this itself; these keep the platforms consistent
with what the site and `/privacy` say.

- **Stripe → Settings → Business → Customer emails**: turn on *Successful
  payments*. `/thank-you` tells buyers Stripe emails their receipt. Under
  *Public details*, set the support email to `info@abdurastro.com`.
- **Meta Events Manager → the pixel → Settings**: leave *Automatic advanced
  matching* off. The site already sets `autoConfig` off before `init`, so
  email fields aren't read either way; this keeps the setting and the code
  in agreement.
- **Google tag settings**: leave *user-provided data collection* and
  *automatic enhanced conversions* off, for the same reason.
- **GA4 → Admin → Data streams → web stream → Configure tag settings → List
  unwanted referrals**: add a "domain ends with" `stripe.com` rule. The site
  already sends `ignore_referrer` when a visitor comes back from Stripe; the
  rule covers anything the code can't see.

### Consent

`consent: 'opt-out'` (the default) loads the tags unless a visitor turns
measurement off on `/privacy`; `'opt-in'` shows a banner and loads nothing
until they allow it. Either way, a browser sending Global Privacy Control, or
blocking site storage (where an opt-out couldn't be saved), never loads them.
Turning measurement off stops the site's own events at once and silences the
tags on that page; the Back button can't bring a measured page back after an
opt-out. `/privacy` describes exactly the tags that are configured.

### Limits

- Values are list prices. A promotion code used at Stripe's checkout isn't
  visible to a static site, so a discounted sale reports its full price;
  Stripe's dashboard is the revenue record. For a sale that runs ads, put
  the sale price on its own Payment Link (and in the print's frontmatter,
  then re-run the redirect script) so every event carries the real amount.
- An ad blocker or a browser that clears storage mid-checkout can hide a sale.
  Expect the ad platforms to show a little less than Stripe does.

## Consult call booking

Equipment consulting on `/services` (`ConsultBooking.astro`) offers two paths
from one widget: a free 15-minute intro call, or a paid session booked by the
hour. Either way, the lead-capture form (name, email, note; posts to Web3Forms
and the lead Sheet, see below) is submitted first. The free path then opens a
Google Calendar Appointment Schedule to book the call, nothing else. The paid
path opens the matching hour's Appointment Schedule to book the call, then
redirects to the matching hourly Stripe Payment Link.

All six real Appointment Schedule URLs (intro + 1 through 5 hours, on the
`abdurastro@gmail.com` account) are live in `src/pages/services.astro`
(`CONSULTING_INTRO_CALENDAR_LINK`, `CONSULTING_HOUR_CALENDAR_LINKS`). To
create more (a different service, a schedule change), Google Calendar →
Create → Appointment schedule, then pass the resulting URL in as a prop.

## Replace before launch

Every placeholder in the project, in one list. The site builds and runs with all
of them in place — but do not launch until each box is checked.

### 1. Photography

- [x] All NASA/ESA Hubble placeholder images have been replaced with real
      photographs, including the home hero (`src/pages/index.astro`) and the
      site-wide default OG image (`src/layouts/Base.astro`), both now Andromeda
      Galaxy. The placeholder-imagery credit line in `src/components/Footer.astro`
      has been removed accordingly.

### 2. Copy

- [ ] Acquisition data (telescope, camera, mount, filters, hours, dates,
      locations) for Veil Nebula, Rosette Nebula, Pleiades, North
      America/Pelican Nebula, Andromeda Galaxy, and most of Whirlpool
      Galaxy. These fields are now `.optional()` in `content.config.ts` and
      simply omitted from each file's frontmatter until confirmed; the
      observation log and gallery cards hide a field rather than showing a
      placeholder for it. Add the real values to each `src/content/photos/*.md`
      file as they're confirmed.
- [x] All 6 print entries in `src/content/prints/` have real Stripe links and
      confirmed prices. Pleiades, Rosette, and North America/Pelican Nebulae's
      descriptions use only publicly known astronomical facts (distance,
      catalogue designation) since no personal acquisition data is confirmed
      for those three yet; revisit once real capture details come in.
- [ ] Bio on `src/pages/about.astro` (marked `PLACEHOLDER COPY` in a comment)
- [ ] Gear list on `src/pages/about.astro` (`gear` array)
- [ ] Print turnaround time ("7–10 business days") in `src/pages/prints/index.astro`
      and `src/pages/prints/[slug].astro` — the number itself is still an
      estimate, confirm before launch
- [ ] Coordinates in `src/config.ts` (`coordinates`) if 51.0° N · 114.1° W isn't right
- [ ] No real hosted events (star parties, talks) are on the calendar yet.
      `src/content/events/` currently has only `kind: 'astronomical'` entries
      (meteor showers, the winter solstice — real, well-known annual dates).
      Add `kind: 'hosted'` markdown files as real dates are confirmed; see
      "Adding a new event" above.

### 3. Stripe Payment Links

- [x] All 6 prints (Andromeda, Whirlpool, Veil, Pleiades, Rosette, North
      America/Pelican Nebulae) have real, live `https://buy.stripe.com/…`
      links for all 3 sizes × 2 papers, from the live Stripe account
      ("Buymeacoffee"). 36 links total, no shared URLs.
- [x] Scope rental rates (one night $20, weekend $35, weekly $70) have real
      live Payment Links in `src/pages/rentals.astro`.
- [x] Hourly booking links for one-on-one tutorials and equipment consulting
      (`src/pages/services.astro`, `HourlyBooking.astro` component) have real,
      live Payment Links: $100/hour, 1 to 5 hours, ten links total (five per
      service).
- [ ] Page prices match the amounts configured in Stripe (spot-check against
      the live dashboard before launch)
- [x] All six consult-call Appointment Schedule links (free intro, 1 to 5
      hours) are real and live in `src/pages/services.astro` (see "Consult
      call booking" above).

**Pricing model, decided:** the live 6-variant structure (3 sizes × 2 papers
per print, $145/$185, $210/$260, $340/$410) is the correct one and is what
every print now uses. The Stripe tracker sheet's own pricing reference (8×12
$65, 16×24 $165, 24×36 $295, one price per size, no paper choice) was wrong
and out of date; it was not used. An older Andromeda 24×36 $295 link exists
in the account but was deliberately left unused, since it doesn't match the
live pricing.

### 4. Contact form

- [x] Real access key from [web3forms.com](https://web3forms.com) set in
      `src/config.ts`
- [ ] Send a test message from the deployed site and confirm it arrives
- [x] The fallback email named in `src/scripts/contact-form.ts` matches the real one

### 5. Footer signup

- [ ] The free Siril + Seestar processing guide itself. Put the file in
      `public/` and set `newsletter.guideUrl` in `src/config.ts`. Until that is
      set the footer shows the old newsletter pitch instead, so the site never
      offers a download that does not exist.
- [ ] A real mailing list. Signups currently POST to Web3Forms, which emails
      them, and to the lead sheet. Neither can send a broadcast or deliver the
      guide automatically, so today this is a list of addresses that someone
      has to mail by hand. Kit and MailerLite both have a free tier that covers
      this; connecting one means pointing the form at their endpoint and
      matching their field names.

### 6. Testimonials

- [ ] Replace the two remaining quotes with print and tutorial reviews as they
      come in. The four marketplace reviews were removed: they reviewed the
      sale rather than the work, and one was about a used microscope.

### 7. Email, socials, domain

- [x] Domain: `site` in `astro.config.mjs` and the `Sitemap:` line in
      `public/robots.txt` are set to `https://abdurastro.com` — change only if
      the domain ever changes, then rebuild and spot-check a canonical tag
- [x] Email forwarding for `info@abdurastro.com` set up in Cloudflare Email
      Routing and tested (the address is wired into the site and the contact
      form's fallback message)
- [x] Social URLs in `src/config.ts` (`social`): YouTube, Instagram, TikTok,
      X, and Patreon

## Deploying to Cloudflare Pages

The repository root is `Whisper-project/`; the site lives in the `abdur-astro/`
subdirectory — set the **root directory** accordingly in step 4.

1. **Push to GitHub.** The project deploys from a GitHub branch (use `main` for
   production).
2. **Create the Pages project.** Cloudflare dashboard → **Workers & Pages →
   Create → Pages → Connect to Git** → authorize GitHub and pick this repository.
3. **Pick the production branch** (`main`).
4. **Build settings:**
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - **Root directory (advanced): `abdur-astro`**
   - Environment variable: `NODE_VERSION` = `22.12.0` (Astro 7 requires Node
     22.12+; Cloudflare's default may be older)
5. **Save and Deploy.** First build takes a few minutes (image optimization);
   the site goes live at `<project>.pages.dev`. Every push to `main` redeploys;
   pushes to other branches create preview deployments.
6. **Custom domain.** Pages project → **Custom domains → Set up a custom
   domain** → enter the domain (e.g. `abdurastro.com`).
   - Domain on Cloudflare (recommended — transfer or point its nameservers at
     Cloudflare first): the CNAME is created automatically and TLS issues within
     minutes. Add both `abdurastro.com` and `www.abdurastro.com`; Cloudflare
     redirects the alternate automatically.
   - Domain elsewhere: add the CNAME record Cloudflare shows you at your DNS host.
7. **Code's domain is already set** to `https://abdurastro.com`
   (`astro.config.mjs` `site` + `robots.txt`) — nothing to change unless the
   domain itself changes.
8. **Email forwarding** (so `info@abdurastro.com` works — requires the domain's
   DNS on Cloudflare): dashboard → the domain (not the Pages project) → **Email →
   Email Routing → Get started**.
   - Add the **destination address** (the personal inbox that should receive
     mail) and click the verification link Cloudflare emails to it.
   - Enable routing — Cloudflare adds the required MX and SPF records itself.
   - **Routing rules → Create address**: `info@abdurastro.com` → forward to the
     verified destination. Send a test email.
   - Note: Email Routing forwards inbound mail only. To *send* as
     `info@abdurastro.com`, add it as a send-as alias in your mail provider.
9. **Submit the sitemap** (optional, day one): Google Search Console → add the
   domain → submit `https://abdurastro.com/sitemap-index.xml`.

## Placeholder image credits

No longer applicable: every development placeholder, including the ESA/Hubble
stand-ins and the generated portrait, has been replaced with real photography.
