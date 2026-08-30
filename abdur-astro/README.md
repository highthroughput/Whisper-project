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
   telescope: 'Sky-Watcher Esprit 100ED · f/5.5'
   camera: 'ZWO ASI2600MM Pro (mono)'
   mount: 'Sky-Watcher EQ6-R Pro'
   filters:                            # hours per filter — drives the log's integration bar
     - { name: 'Ha', hours: 9.0 }
     - { name: 'OIII', hours: 6.5 }
     - { name: 'SII', hours: 5.0 }
   captured: 'Feb – Mar 2026 · 7 nights'
   date: 2026-03-04                    # last light; used for sort order
   location: 'Backyard observatory · Central Alberta · Bortle 4'
   featured: false                     # true = appears on the home page
   ---

   A paragraph or two about the object and the nights behind it.
   ```

3. `npm run dev` — the photo is in the gallery, in the lightbox, and has a detail
   page at `/gallery/rosette-nebula` with its observation log. Done.

Filter names map to the integration bar's colours automatically: `Ha` → emission
red, `OIII` → teal, `SII` → dust gold; `L/R/G/B` render as monochrome steps.
Anything else gets a neutral tone.

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

The page's prices are display-only; **the amount charged is whatever the Stripe
Payment Link says**, so keep them in sync.

## Stripe Payment Links

For each print variant: Stripe Dashboard → **Payment Links → New** → create a
product (e.g. "Whirlpool Galaxy — 16 × 24″ Archival matte"), price in **CAD**,
one-time. Enable **shipping address collection** (Canada), add your shipping
rate, and (if registered) let Stripe Tax handle GST. Copy the
`https://buy.stripe.com/…` URL over the matching placeholder token below.

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
      locations) and body text for Veil Nebula, Rosette Nebula, Pleiades,
      North America/Pelican Nebula, and Whirlpool Galaxy's mount — all
      currently marked "pending" in `src/content/photos/`
- [ ] All 5 print entries in `src/content/prints/` — descriptions, editions, prices
- [ ] Bio on `src/pages/about.astro` (marked `PLACEHOLDER COPY` in a comment)
- [ ] Gear list on `src/pages/about.astro` (`gear` array)
- [ ] Print turnaround time ("7–10 business days") in `src/pages/prints/index.astro`
      and `src/pages/prints/[slug].astro`
- [ ] Coordinates in `src/config.ts` (`coordinates`) if 52.3° N · 113.8° W isn't right

### 3. Stripe Payment Links (30 tokens)

Replace each token in the named file under `src/content/prints/` with a real
`https://buy.stripe.com/…` URL. Until then, Buy buttons point at the literal token.

| File | Tokens |
| --- | --- |
| `whirlpool-galaxy.md` | `STRIPE_LINK_WHIRLPOOL_12X18` · `STRIPE_LINK_WHIRLPOOL_12X18_BARYTA` · `STRIPE_LINK_WHIRLPOOL_16X24` · `STRIPE_LINK_WHIRLPOOL_16X24_BARYTA` · `STRIPE_LINK_WHIRLPOOL_24X36` · `STRIPE_LINK_WHIRLPOOL_24X36_BARYTA` |
| `pillars-of-creation.md` | `STRIPE_LINK_PILLARS_12X18` · `STRIPE_LINK_PILLARS_12X18_BARYTA` · `STRIPE_LINK_PILLARS_16X24` · `STRIPE_LINK_PILLARS_16X24_BARYTA` · `STRIPE_LINK_PILLARS_24X36` · `STRIPE_LINK_PILLARS_24X36_BARYTA` |
| `veil-nebula.md` | `STRIPE_LINK_VEIL_12X18` · `STRIPE_LINK_VEIL_12X18_BARYTA` · `STRIPE_LINK_VEIL_16X24` · `STRIPE_LINK_VEIL_16X24_BARYTA` · `STRIPE_LINK_VEIL_24X36` · `STRIPE_LINK_VEIL_24X36_BARYTA` |

- [ ] Remaining tokens above replaced
- [ ] Page prices match the amounts configured in Stripe

### 4. Contact form

- [x] Real access key from [web3forms.com](https://web3forms.com) set in
      `src/config.ts`
- [ ] Send a test message from the deployed site and confirm it arrives
- [x] The fallback email named in `src/scripts/contact-form.ts` matches the real one

### 5. Email, socials, domain

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

Development placeholders are ESA/Hubble releases, © NASA/ESA et al., used under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): heic0506a (M51),
heic0601a (M42), heic1501a (M16), heic1307a (Horsehead), heic0515a (M1),
heic1608a (NGC 7635), heic1808a (M8), heic1520a (Veil). The portrait placeholder
is generated. All are resized dev stand-ins — none may remain at launch.
