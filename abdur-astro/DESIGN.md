# Abdur Astro — design plan

A photography site. The photographs carry the design; everything else stays quiet,
disciplined, and specific to astrophotography. No decorative starfields, no stock
"space" styling — the only imagery on the site is the photography itself.

## Palette

Derived from what deep-sky images are actually made of: a stretched noise-floor sky,
warm starlight, hydrogen emission, dust, and ionized oxygen. Six named values:

| Token | Hex | Name | Job |
| --- | --- | --- | --- |
| `--color-sky` | `#0B0A09` | **Background sky** | Base. Near-black with faint warmth — a well-stretched background, not `#000`. |
| `--color-star` | `#EAE3D6` | **Star white** | Primary text. Stars are never pure white. |
| `--color-faint` | `#9C9184` | **Faint magnitude** | Secondary text — stars near the detection limit. |
| `--color-ha` | `#A63A28` | **Hydrogen-alpha** | Primary accent: buy buttons, key actions. Deep Hα emission red. |
| `--color-dust` | `#B4713D` | **Dust lane** | Secondary accent: links, eyebrow labels, log markings. Burnt-sienna dust. |
| `--color-oiii` | `#7FA9A3` | **Oxygen-III** | Data-only accent, used inside the observation log (filter ticks, coordinates). |

Surfaces are derived, not branded: cards at `#14110F` (sky, lifted), hairlines at
star-white / 12%. Contrast: star on sky ≈ 15:1, faint on sky ≈ 6:1, dust on sky ≈ 4.9:1,
star on hydrogen-alpha ≈ 5:1 — all clear of WCAG AA for their roles.

## Typography

- **Display — Marcellus.** Inscriptional Roman capitals; the lapidary letterforms of
  engraved star atlases (Uranometria, Norton's). One weight only, which enforces
  restraint. Wordmark and page titles in tracked caps, target names in mixed case.
- **Body — Archivo.** A sturdy grotesque that stays quiet on a dark ground and
  disappears behind the photography.
- **Data — IBM Plex Mono.** The observation log, acquisition captions, nav eyebrows,
  price ledgers. Tabular figures for integration times.

All three self-hosted via Fontsource — no runtime Google Fonts request.

## Layout concept

Photographs run full-bleed or near-full; everything else sits on wide margins with
thin hairline rules and small mono eyebrow labels (`OBSERVATION 04 — M 51`). The
gallery is a uniform plate-archive grid, not a masonry wall. Prints are shown
"matted": a lifted surface and hairline around the image, so the shop reads
differently from the archive. Motion is limited to soft reveals and restrained
hover states, all gated behind `prefers-reduced-motion`.

## Signature element — the observation log

Acquisition data set as design material, the way an astrophotographer actually keeps
it: a monospaced field log with dotted leaders, a catalog header (`M 51 · NGC 5194`,
RA/Dec), and an **integration bar** — a proportional bar of exposure hours per filter,
tinted in the mapping astrophotographers already use (Hα → hydrogen-alpha red,
OIII → oxygen teal, SII → dust gold; broadband LRGB stays monochrome, because LRGB
*is* monochrome). Total integration is set large, in hours — the number this
community actually brags about. The log grammar recurs everywhere: gallery cards
carry a one-line log footer (`M 42 · 22.4 H · HA OIII SII`), the gear list on the
About page is an equipment inventory, and print options are a price ledger.

## Critique pass (what changed and why)

1. **Type, first draft: Space Grotesk + Inter.** That's the default "space site"
   pairing on half the developer portfolios shipped this decade — rejected.
   Replaced with Marcellus / Archivo / IBM Plex Mono, chosen for star-atlas
   engraving and log-book credibility rather than sci-fi flavor.
2. **Palette, first draft: one teal accent doing every job.** A single acid accent
   on near-black is exactly the generic move the brief bans. Reworked into three
   emission-derived colors with strict, separate jobs — and Oxygen-III demoted to
   log data only, so the UI never reads "teal template."
3. **Gallery, first draft: masonry.** Masonry is a Pinterest default and fights
   deep-sky framing, which is mostly consistent aspect ratios. Replaced with a
   uniform grid that reads as a plate archive.
4. **Hero, first draft: faint animated star canvas behind the title.** Explicitly
   banned by the brief, and rightly — the real photograph is the background. Cut.
