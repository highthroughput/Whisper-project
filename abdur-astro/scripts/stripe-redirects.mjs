#!/usr/bin/env node
/**
 * Point every Stripe Payment Link the site uses at the thank-you page:
 *
 *   https://abdurastro.com/thank-you?link=<link id>&session_id={CHECKOUT_SESSION_ID}
 *
 * Stripe fills in {CHECKOUT_SESSION_ID} itself. `link` tells the page what
 * was bought; the session id makes each purchase count once.
 *
 * Usage (from abdur-astro/):
 *   npm run build                                   # the script reads dist/ to know which links the site uses
 *   STRIPE_SECRET_KEY=rk_live_... node scripts/stripe-redirects.mjs          # dry run: prints the plan
 *   STRIPE_SECRET_KEY=rk_live_... node scripts/stripe-redirects.mjs --apply  # makes the changes
 *
 * A restricted key needs only "Payment Links: Write". Links on the account
 * that the site doesn't use are listed and left alone. Re-running is safe:
 * links already pointing at the right URL are skipped. Before changing
 * anything, --apply saves every affected link's current after-payment
 * setting to stripe-redirects-backup-<timestamp>.json, including any custom
 * confirmation message, which the redirect replaces.
 *
 * Options:
 *   --apply           actually update the links (default is a dry run)
 *   --site <origin>   default https://abdurastro.com
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = process.env.STRIPE_API_BASE ?? 'https://api.stripe.com';
const KEY = process.env.STRIPE_SECRET_KEY;
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const siteArg = args.indexOf('--site');
const SITE = (siteArg >= 0 ? args[siteArg + 1] : 'https://abdurastro.com').replace(/\/+$/, '');
// fileURLToPath, not .pathname: a checkout path with a space or a non-ASCII
// character would otherwise stay percent-encoded and never be found.
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

if (!KEY) {
  console.error('Set STRIPE_SECRET_KEY (a restricted key with Payment Links: Write is enough).');
  process.exit(1);
}

const linkIdOf = (url) => new URL(url).pathname.replace(/^\/+/, '');
const targetFor = (id) => `${SITE}/thank-you?link=${encodeURIComponent(id)}&session_id={CHECKOUT_SESSION_ID}`;

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(p)));
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

async function siteLinkIds() {
  let files;
  try {
    files = await htmlFiles(DIST);
  } catch (err) {
    console.error(`No build found at ${DIST} (${err.code ?? err.message}). Run \`npm run build\` first.`);
    process.exit(1);
  }
  const ids = new Set();
  for (const f of files) {
    const html = await readFile(f, 'utf8');
    for (const m of html.matchAll(/https:\/\/buy\.stripe\.com\/[A-Za-z0-9_]+/g)) ids.add(linkIdOf(m[0]));
  }
  return ids;
}

async function stripe(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${KEY}`, ...(init.headers ?? {}) },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path}: ${body?.error?.message ?? res.status}`);
  return body;
}

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

const onSite = await siteLinkIds();
let links;
try {
  links = await allPaymentLinks();
} catch (err) {
  console.error(`Could not list Payment Links: ${err.message}`);
  console.error('Check the key is right, is for the live account, and has Payment Links access.');
  process.exit(1);
}
const byId = new Map(links.map((l) => [linkIdOf(l.url), l]));

const toUpdate = [];
const alreadySet = [];
for (const id of onSite) {
  const link = byId.get(id);
  if (!link) continue;
  const want = targetFor(id);
  const now = link.after_completion?.type === 'redirect' ? link.after_completion.redirect?.url : null;
  if (now === want) alreadySet.push(id);
  else toUpdate.push({ id, link, want, now });
}
const missing = [...onSite].filter((id) => !byId.has(id));
const untouched = links.filter((l) => !onSite.has(linkIdOf(l.url)));

console.log(`Site uses ${onSite.size} Payment Links; the Stripe account has ${links.length} active.`);
console.log(`  already redirecting correctly: ${alreadySet.length}`);
console.log(`  to update:                     ${toUpdate.length}`);
if (missing.length) {
  console.log(`\n${missing.length} link(s) on the site were not found among this key's active links.`);
  console.log('Wrong mode (test vs live key), a different account, or deactivated:');
  for (const id of missing) console.log(`  https://buy.stripe.com/${id}`);
}
if (untouched.length) {
  console.log(`\n${untouched.length} active link(s) on the account aren't on the site and will be left alone:`);
  for (const l of untouched) console.log(`  ${l.url}`);
}
const messageOf = (link) => link.after_completion?.hosted_confirmation?.custom_message ?? null;
const withMessages = toUpdate.filter((u) => messageOf(u.link));
for (const u of toUpdate) {
  console.log(`\n${u.link.url}\n  now:  ${u.now ?? `(${u.link.after_completion?.type ?? 'default'} confirmation page)`}\n  new:  ${u.want}`);
  if (messageOf(u.link)) console.log(`  note: its confirmation message will no longer show: "${messageOf(u.link)}"`);
}
if (withMessages.length) {
  console.log(`\n${withMessages.length} link(s) have a custom confirmation message that the redirect replaces.`);
  console.log('Anything a buyer needs from it (pickup details, next steps) should be on /thank-you first.');
}

if (!APPLY) {
  console.log(toUpdate.length ? '\nDry run. Re-run with --apply to make these changes.' : '\nNothing to do.');
  process.exit(0);
}

// A record of what each link did before, so any of them can be put back.
const backup = `stripe-redirects-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
await writeFile(
  backup,
  JSON.stringify(
    toUpdate.map((u) => ({ id: u.link.id, url: u.link.url, after_completion: u.link.after_completion })),
    null,
    2,
  ),
);
console.log(`\nSaved the current settings of ${toUpdate.length} link(s) to ${backup}`);

let ok = 0;
for (const u of toUpdate) {
  const body = new URLSearchParams({
    'after_completion[type]': 'redirect',
    'after_completion[redirect][url]': u.want,
  });
  try {
    await stripe(`/v1/payment_links/${u.link.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    ok += 1;
    console.log(`updated ${u.link.url}`);
  } catch (err) {
    console.error(`FAILED  ${u.link.url}: ${err.message}`);
  }
}
console.log(`\nUpdated ${ok} of ${toUpdate.length}.`);
process.exit(ok === toUpdate.length ? 0 : 1);
