#!/usr/bin/env node
/**
 * Bring every print's Stripe checkout page in line with the site:
 *
 *   1. Product name and description: on a print the site sells on Hahnemühle
 *      FineArt Pearl, "Baryta fibre" (or "baryta") becomes that paper's name,
 *      and "Open edition · signed" and its close variants are taken out of
 *      every print's name and description. Nothing else in a name changes.
 *      Text that still mentions baryta, an edition or signing after that is
 *      listed for a hand edit and left as it is.
 *   3. Checkout text: the site's duties note (DUTIES_NOTE in src/config.ts)
 *      is shown under the shipping address, or above the Pay button on a link
 *      that doesn't collect an address. Existing custom text is kept and the
 *      note is added after it.
 *
 * Only Payment Links the built site sells prints through are touched.
 *
 * Usage (from abdur-astro/):
 *   npm run build                                                   # the script reads dist/
 *   STRIPE_SECRET_KEY=rk_live_... node scripts/stripe-print-pages.mjs          # dry run: prints the plan
 *   STRIPE_SECRET_KEY=rk_live_... node scripts/stripe-print-pages.mjs --apply  # makes the changes
 *
 * A restricted key needs "Payment Links: Write", "Products: Write" and
 * "Prices: Read". Re-running is safe: anything already right is skipped, and
 * after DUTIES_NOTE changes, the note this script placed is replaced rather
 * than a second one added (it records the note in the link's metadata).
 * Before changing anything, --apply saves the current name, description and
 * checkout text of everything it will touch to
 * stripe-print-pages-backup-<timestamp>.json.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const API = process.env.STRIPE_API_BASE ?? 'https://api.stripe.com';
const KEY = process.env.STRIPE_SECRET_KEY;
const APPLY = process.argv.slice(2).includes('--apply');
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

if (!KEY) {
  console.error('Set STRIPE_SECRET_KEY (a restricted key with Payment Links: Write, Products: Write, Prices: Read).');
  process.exit(1);
}

/** Stripe allows 1,200 characters of custom text per field. */
const MAX_CUSTOM_TEXT = 1200;
/** Payment Link metadata key holding the note this script last placed. */
const NOTE_METADATA_KEY = 'duties_note';
const CUSTOM_TEXT_FIELDS = ['shipping_address', 'submit', 'terms_of_service_acceptance', 'after_submit'];

const linkIdOf = (url) => new URL(url).pathname.replace(/^\/+/, '');
const decode = (html) =>
  html
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

async function readBuilt(file) {
  try {
    return await readFile(`${DIST}${file}`, 'utf8');
  } catch (err) {
    console.error(`No build found at ${DIST}${file} (${err.code ?? err.message}). Run \`npm run build\` first.`);
    process.exit(1);
  }
}

// What the site sells, from the catalog the thank-you page embeds: link id →
// { name: "Andromeda Galaxy print", variant: "12 × 18″ · Archival matte" }.
const thankYou = await readBuilt('thank-you.html');
const catalogJson = thankYou.match(/<script[^>]*id="checkout-catalog"[^>]*>([\s\S]*?)<\/script>/)?.[1];
if (!catalogJson) {
  console.error('Could not find the checkout catalog in dist/thank-you.html.');
  process.exit(1);
}
const prints = new Map(
  Object.values(JSON.parse(catalogJson))
    .filter((entry) => entry.category === 'print')
    .map((entry) => [entry.link, entry]),
);

// The duties note, as the prints index renders it.
const printsIndex = await readBuilt('prints.html');
const noteHtml = printsIndex.match(/<span[^>]*data-duties-note[^>]*>([\s\S]*?)<\/span>/)?.[1];
if (!noteHtml) {
  console.error('Could not find the duties note (data-duties-note) in dist/prints.html.');
  process.exit(1);
}
const NOTE = decode(noteHtml.replace(/\s+/g, ' ').trim());

async function stripe(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${KEY}`, ...(init.headers ?? {}) },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path}: ${body?.error?.message ?? res.status}`);
  return body;
}

const post = (path, params) =>
  stripe(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });

async function allPaymentLinks() {
  const links = [];
  let after;
  do {
    const q = new URLSearchParams({ limit: '100', active: 'true' });
    if (after) q.set('starting_after', after);
    const page = await stripe(`/v1/payment_links?${q}`);
    links.push(...page.data);
    after = page.has_more ? page.data.at(-1).id : undefined;
  } while (after);
  return links;
}

/**
 * The edition label as a whole: "Open edition · signed", "Open edition,
 * signed", "Open edition", "Signed", "Hand-signed". It is only ever removed
 * where it stands alone, as a bracketed aside, a sentence, or a segment
 * between separators. Inside running prose ("an open edition print",
 * "signed by the artist") it is left in place and flagged for a hand edit,
 * since cutting it out of a sentence leaves the sentence broken.
 */
const LABEL_CORE = String.raw`(?:open[\s-]edition(?:\s*[·,|•–—-]\s*(?:hand[\s-])?signed)?|(?:hand[\s-])?signed)`;
const LABEL = new RegExp(`^${LABEL_CORE}$`, 'i');
const BRACKETED = new RegExp(String.raw`\s*\(\s*${LABEL_CORE}\s*\)`, 'gi');
const SEPARATOR = /(\s+[·|•–—-]\s+)/;
const BARYTA = /\bbaryta(?:[\s-]+fib(?:re|er))?\b/gi;
const LEFTOVER = /baryta|open[\s-]edition|\bsigned\b/i;

/** One sentence with any segment that is only the label dropped, keeping the separators between the rest. */
function dropLabelSegments(sentence) {
  const [, body, end] = sentence.match(/^([\s\S]*?)([.!?]?)$/);
  const parts = body.split(SEPARATOR); // segment, separator, segment, …
  const segments = parts.filter((_, i) => i % 2 === 0);
  const separators = parts.filter((_, i) => i % 2 === 1);
  const keep = segments.map((s) => !LABEL.test(s.trim()));
  if (keep.every(Boolean)) return sentence;
  // A dropped segment takes one separator with it: the one before the next
  // kept segment is the one that was before the dropped one.
  let out = '';
  let separator = '';
  segments.forEach((segment, i) => {
    if (i > 0 && !separator) separator = separators[i - 1];
    if (!keep[i]) return;
    out = out ? out + separator + segment : segment;
    separator = '';
  });
  return out ? out + end : '';
}

/** The text with the retired paper and edition wording taken out, or flagged if that isn't enough. */
function cleanText(original, paper) {
  if (!original) return { text: original, flagged: false };
  let text = original.replace(BRACKETED, '');
  // Sentences keep the whitespace that followed them, so line breaks survive.
  const pieces = text.split(/(?<=[.!?])(\s+)/);
  let rebuilt = '';
  for (let i = 0; i < pieces.length; i += 2) {
    const sentence = dropLabelSegments(pieces[i]);
    if (sentence) rebuilt += (rebuilt ? pieces[i - 1] ?? ' ' : '') + sentence;
  }
  text = rebuilt.trim();
  if (/pearl/i.test(paper)) text = text.replace(BARYTA, paper);
  if (LEFTOVER.test(text)) return { text: original, flagged: true };
  return { text, flagged: false };
}

let links;
try {
  links = await allPaymentLinks();
} catch (err) {
  console.error(`Could not list Payment Links: ${err.message}`);
  console.error('Check the key is right, is for the live account, and has Payment Links access.');
  process.exit(1);
}
const byId = new Map(links.map((l) => [linkIdOf(l.url), l]));
const missing = [...prints.keys()].filter((id) => !byId.has(id));

const productPlans = new Map(); // product id → { product, paper, wantName, wantDescription, links: [] }
const linkPlans = [];
const handEdits = [];
const problems = [];
const noAddress = [];
const noShippingRate = [];

for (const [id, entry] of prints) {
  const link = byId.get(id);
  if (!link) continue;
  const paper = entry.variant.split(' · ').at(-1);
  const option = `${entry.name} · ${entry.variant}`;

  let items;
  try {
    items = (await stripe(`/v1/payment_links/${link.id}/line_items?limit=10`)).data;
  } catch (err) {
    problems.push(`${link.url}: could not read its line items (${err.message})`);
    continue;
  }
  if (items.length !== 1) {
    problems.push(`${link.url}: has ${items.length} line items, expected 1; left alone`);
  } else {
    const productId = typeof items[0].price?.product === 'string' ? items[0].price.product : items[0].price?.product?.id;
    if (!productId) {
      problems.push(`${link.url}: its line item has no product; left alone`);
    } else {
      let plan = productPlans.get(productId);
      if (!plan) {
        const product = await stripe(`/v1/products/${productId}`);
        const name = cleanText(product.name, paper);
        const description = cleanText(product.description, paper);
        if (name.flagged || description.flagged) handEdits.push({ product, option });
        plan = { product, paper, wantName: name.text, wantDescription: description.text, links: [] };
        productPlans.set(productId, plan);
      } else if (plan.paper !== paper) {
        // One Stripe product behind options on two papers can't be named for both.
        plan.conflict = true;
      }
      plan.links.push(link.url);
    }
  }

  // Read-only shipping check: a print link that doesn't ask for an address
  // takes payment for something there's nowhere to send.
  if (!link.shipping_address_collection) noAddress.push(`${link.url} (${option})`);
  else if (!(link.shipping_options ?? []).length) noShippingRate.push(`${link.url} (${option})`);

  // Checkout text: the field a buyer reads at the point duties matter.
  const field = link.shipping_address_collection ? 'shipping_address' : 'submit';
  const current = link.custom_text?.[field]?.message ?? '';
  // The note this script last put there is kept in the link's metadata, so a
  // changed DUTIES_NOTE replaces it instead of stacking a second one below.
  const previous = link.metadata?.[NOTE_METADATA_KEY] ?? '';
  if (!current.includes(NOTE)) {
    const replacing = previous && current.includes(previous);
    const next = replacing ? current.replace(previous, NOTE) : current ? `${current}\n\n${NOTE}` : NOTE;
    if (next.length > MAX_CUSTOM_TEXT) {
      problems.push(`${link.url}: its ${field} text plus the note would pass Stripe's ${MAX_CUSTOM_TEXT} characters; left alone`);
    } else {
      linkPlans.push({ link, field, current, next, replacing });
    }
  }
}

const productUpdates = [...productPlans.values()].filter(
  (p) =>
    !p.conflict &&
    (p.product.name !== p.wantName || (p.product.description ?? '') !== (p.wantDescription ?? '')),
);
for (const p of productPlans.values()) {
  if (p.conflict) problems.push(`Product ${p.product.id} ("${p.product.name}") is behind options on two different papers (${p.links.join(', ')}); not changed`);
}

console.log(`The site sells ${prints.size} print options; ${prints.size - missing.length} were found among this key's active Payment Links.`);
console.log(`  products to update:           ${productUpdates.length}`);
console.log(`  checkout pages to add note:   ${linkPlans.length}`);
console.log(`\nDuties note:\n  "${NOTE}"`);

if (missing.length) {
  console.log(`\n${missing.length} print link(s) on the site were not found (test key, other account, or deactivated):`);
  for (const id of missing) console.log(`  https://buy.stripe.com/${id}`);
}
for (const p of productUpdates) {
  console.log(`\nProduct ${p.product.id}`);
  if (p.product.name !== p.wantName) console.log(`  name:        "${p.product.name}"\n           →  "${p.wantName}"`);
  if ((p.product.description ?? '') !== (p.wantDescription ?? ''))
    console.log(`  description: "${p.product.description}"\n           →  "${p.wantDescription}"`);
}
for (const l of linkPlans) {
  console.log(`\n${l.link.url}\n  ${l.field === 'shipping_address' ? 'under the shipping address' : 'above the Pay button'}: ${l.replacing ? 'earlier duties note replaced' : l.current ? 'note added after the existing text' : 'note added'}`);
}
if (handEdits.length) {
  console.log(`\n${handEdits.length} product(s) still mention baryta, an edition or signing in a way this script won't guess at. Edit these by hand in the Stripe Dashboard:`);
  for (const h of handEdits) console.log(`  ${h.product.id} (site option: ${h.option})\n    name: "${h.product.name}"\n    description: "${h.product.description ?? ''}"`);
}
if (problems.length) {
  console.log('\nLeft alone:');
  for (const p of problems) console.log(`  ${p}`);
}
// Reported, never changed: these are settings to fix in the Dashboard.
if (noAddress.length) {
  console.log(`\nSHIPPING: ${noAddress.length} print link(s) don't collect a shipping address, so a buyer can pay without giving one.`);
  console.log('Fix in the Dashboard: Payment Links → the link → Edit → collect customers\' shipping addresses (Canada and the US):');
  for (const l of noAddress) console.log(`  ${l}`);
}
if (noShippingRate.length) {
  console.log(`\nSHIPPING: ${noShippingRate.length} print link(s) collect an address but have no shipping rate, so buyers aren't charged for shipping:`);
  for (const l of noShippingRate) console.log(`  ${l}`);
}
if (prints.size - missing.length && !noAddress.length && !noShippingRate.length) {
  console.log('\nShipping: every print link found collects a shipping address and has a shipping rate.');
}

const work = productUpdates.length + linkPlans.length;
if (!APPLY) {
  console.log(work ? '\nDry run. Re-run with --apply to make these changes.' : '\nNothing to do.');
  process.exit(0);
}
if (!work) {
  console.log('\nNothing to do.');
  process.exit(0);
}

const backup = `stripe-print-pages-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
await writeFile(
  backup,
  JSON.stringify(
    {
      products: productUpdates.map((p) => ({ id: p.product.id, name: p.product.name, description: p.product.description })),
      payment_links: linkPlans.map((l) => ({
        id: l.link.id,
        url: l.link.url,
        custom_text: l.link.custom_text,
        metadata: l.link.metadata ?? {},
      })),
    },
    null,
    2,
  ),
);
console.log(`\nSaved the current settings to ${backup}`);

let ok = 0;
for (const p of productUpdates) {
  const params = {};
  if (p.product.name !== p.wantName) params.name = p.wantName;
  if ((p.product.description ?? '') !== (p.wantDescription ?? '')) params.description = p.wantDescription ?? '';
  try {
    await post(`/v1/products/${p.product.id}`, params);
    ok += 1;
    console.log(`updated product ${p.product.id}`);
  } catch (err) {
    console.error(`FAILED  product ${p.product.id}: ${err.message}`);
  }
}
for (const l of linkPlans) {
  // Every custom text field is sent back with the new one, so setting the
  // note can't clear text the link already shows elsewhere.
  const params = {};
  for (const f of CUSTOM_TEXT_FIELDS) {
    const message = f === l.field ? l.next : l.link.custom_text?.[f]?.message;
    if (message) params[`custom_text[${f}][message]`] = message;
  }
  params[`metadata[${NOTE_METADATA_KEY}]`] = NOTE;
  try {
    await post(`/v1/payment_links/${l.link.id}`, params);
    ok += 1;
    console.log(`updated ${l.link.url}`);
  } catch (err) {
    console.error(`FAILED  ${l.link.url}: ${err.message}`);
  }
}
console.log(`\nUpdated ${ok} of ${work}.`);
process.exit(ok === work ? 0 : 1);
