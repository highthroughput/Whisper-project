/**
 * Google Merchant Center product feed: every size and paper of every print as
 * one item, grouped by print. Built from the same content as the print pages,
 * so a price or option change reaches the feed on the next deploy.
 *
 * Merchant Center fetches it on a schedule from
 * https://abdurastro.com/google-merchant-feed.xml (README "Google Merchant
 * Center"). Shipping and returns are set on the Merchant Center account, not
 * per item. The title and description are visitor-facing text in Google
 * Shopping, so CLAUDE.md's copy rules apply to them.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';
import { printVariants, sizeKey } from '../lib/prints';

/** "Home & Garden > Decor > Artwork > Posters, Prints, & Visual Artwork". */
const GOOGLE_PRODUCT_CATEGORY = '500044';

const xml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const GET: APIRoute = async ({ site }) => {
  const prints = (await getCollection('prints')).sort((a, b) => a.data.order - b.data.order);
  const items: string[] = [];

  for (const print of prints) {
    const { data } = print;
    const page = new URL(`/prints/${print.id}`, site).href;

    // The same three crops the print page's structured data lists; Shopping
    // shows the square one.
    const [square, fourByThree, wide] = await Promise.all(
      [
        [1200, 1200],
        [1200, 900],
        [1200, 675],
      ].map(async ([width, height]) => {
        const image = await getImage({ src: data.image, width, height, fit: 'cover', format: 'jpeg', quality: 80 });
        return new URL(image.src, site).href;
      }),
    );

    for (const { option, sku, query } of printVariants(print.id, data.options)) {
      const [w, h] = sizeKey(option.size).split('x');
      const paper = option.paper.toLowerCase();
      const title = `${data.title} Astrophotography Print, ${w}x${h} in, ${option.paper}`;
      const description =
        `${data.tagline} Archival pigment giclée on ${paper} cotton paper, ${w} × ${h} inches, ` +
        'signed, with a certificate of authenticity. Ships rolled in a rigid tube.';

      items.push(
        [
          '    <item>',
          `      <g:id>${xml(sku)}</g:id>`,
          `      <g:item_group_id>${xml(print.id)}</g:item_group_id>`,
          `      <g:title>${xml(title)}</g:title>`,
          `      <g:description>${xml(description)}</g:description>`,
          `      <g:link>${xml(`${page}?${query}`)}</g:link>`,
          `      <g:image_link>${xml(square)}</g:image_link>`,
          `      <g:additional_image_link>${xml(fourByThree)}</g:additional_image_link>`,
          `      <g:additional_image_link>${xml(wide)}</g:additional_image_link>`,
          '      <g:availability>in_stock</g:availability>',
          `      <g:price>${option.price.toFixed(2)} CAD</g:price>`,
          '      <g:brand>Abdur Astro</g:brand>',
          '      <g:condition>new</g:condition>',
          // Original artwork has no GTIN or manufacturer part number.
          '      <g:identifier_exists>no</g:identifier_exists>',
          `      <g:google_product_category>${GOOGLE_PRODUCT_CATEGORY}</g:google_product_category>`,
          `      <g:product_type>${xml('Fine art prints > Astrophotography')}</g:product_type>`,
          `      <g:size>${xml(`${w}x${h} in`)}</g:size>`,
          `      <g:material>${xml(option.paper)}</g:material>`,
          '    </item>',
        ].join('\n'),
      );
    }
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '  <channel>',
    '    <title>Abdur Astro prints</title>',
    `    <link>${xml(new URL('/prints', site).href)}</link>`,
    '    <description>Fine art astrophotography prints from Southern Alberta, Canada.</description>',
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
