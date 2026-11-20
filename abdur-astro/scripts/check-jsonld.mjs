#!/usr/bin/env node
/**
 * Parse every JSON-LD block in the built site and count them by @type, and
 * check each page's meta description fits a search result.
 *
 *   npm run build && npm run check:jsonld
 *
 * Fails (exit 1) if any block isn't valid JSON, has no @type, or a page carries
 * more than one FAQPage, BreadcrumbList or LocalBusiness block, or if an
 * indexable page's meta description is longer than 160 characters. Prints a
 * count per @type, and per page with --pages.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const SHOW_PAGES = process.argv.includes('--pages');
/** Longest meta description before search results start cutting it off. */
const MAX_DESCRIPTION = 160;
/** Types a page should never carry twice. */
const ONCE_PER_PAGE = ['FAQPage', 'BreadcrumbList', 'LocalBusiness'];

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith('.html')) out.push(path);
  }
  return out;
}

const typesOf = (node) => {
  const t = node?.['@type'];
  return Array.isArray(t) ? t : t ? [t] : [];
};

let files;
try {
  files = (await htmlFiles(DIST)).sort();
} catch (err) {
  console.error(`No build at ${DIST} (${err.code ?? err.message}). Run \`npm run build\` first.`);
  process.exit(1);
}

const totals = new Map();
const problems = [];
let blocks = 0;

for (const file of files) {
  const page = '/' + relative(DIST, file).replace(/\.html$/, '').replace(/(^|\/)index$/, '');
  const html = await readFile(file, 'utf8');
  const perPage = new Map();
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const noindex = /<meta name="robots" content="noindex"/.test(html);
  if (description && !noindex) {
    const text = description.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    const length = [...text].length;
    if (length > MAX_DESCRIPTION) problems.push(`${page}: meta description is ${length} characters (max ${MAX_DESCRIPTION})`);
  }
  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    blocks += 1;
    let data;
    try {
      data = JSON.parse(match[1]);
    } catch (err) {
      problems.push(`${page}: invalid JSON-LD (${err.message})`);
      continue;
    }
    const nodes = Array.isArray(data) ? data : data['@graph'] ?? [data];
    for (const node of nodes) {
      const types = typesOf(node);
      if (!types.length) problems.push(`${page}: a JSON-LD block has no @type`);
      for (const type of types) {
        totals.set(type, (totals.get(type) ?? 0) + 1);
        perPage.set(type, (perPage.get(type) ?? 0) + 1);
      }
    }
  }
  for (const type of ONCE_PER_PAGE) {
    if ((perPage.get(type) ?? 0) > 1) problems.push(`${page}: ${perPage.get(type)} ${type} blocks (expected at most 1)`);
  }
  if (SHOW_PAGES) {
    const list = [...perPage].map(([type, n]) => (n > 1 ? `${type}×${n}` : type)).join(', ');
    console.log(`${page.padEnd(42)} ${list || '(none)'}`);
  }
}

console.log(`\n${blocks} JSON-LD blocks in ${files.length} pages:`);
for (const [type, n] of [...totals].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
  console.log(`  ${type.padEnd(20)} ${n}`);
}
if (problems.length) {
  console.error('\nProblems:');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log('\nAll blocks parse.');
