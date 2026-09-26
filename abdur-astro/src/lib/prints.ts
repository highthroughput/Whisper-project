/**
 * Stable, URL-safe names for a print's size and paper options. The print page
 * (preselecting an option from `?size=16x24&paper=baryta-fibre`), its
 * structured data and the Merchant Center feed all build on these, so a link
 * in any of them opens the page on exactly that option.
 *
 * No framework imports: this also runs in the browser.
 */

export interface PrintOption {
  size: string;
  paper: string;
  price: number;
  stripeLink: string;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** "16 × 24″" → "16x24". */
export function sizeKey(size: string): string {
  const numbers = size.match(/\d+(?:\.\d+)?/g);
  return numbers && numbers.length >= 2 ? numbers.join('x') : slugify(size);
}

/** "Baryta fibre" → "baryta-fibre". */
export function paperKey(paper: string): string {
  return slugify(paper);
}

/** "16 × 24″" → "16 × 24 in": the same size, spelled out for machines. */
export function sizeInInches(size: string): string {
  const numbers = size.match(/\d+(?:\.\d+)?/g);
  return numbers && numbers.length >= 2 ? `${numbers[0]} × ${numbers[1]} in` : size;
}

/** The query string that preselects this option: "size=16x24&paper=baryta-fibre". */
export function variantQuery(option: Pick<PrintOption, 'size' | 'paper'>): string {
  return `size=${sizeKey(option.size)}&paper=${paperKey(option.paper)}`;
}

/** Merchant Center caps an item id at 50 characters. */
const MAX_ID_LENGTH = 50;

export interface PrintVariant {
  option: PrintOption;
  /** Unique per print option, e.g. "andromeda-galaxy-16x24-baryta-fibre". */
  sku: string;
  query: string;
}

/**
 * Every option of one print with its SKU and query. Fails the build rather
 * than publish two options under one URL or an id Merchant Center rejects.
 */
export function printVariants(printId: string, options: PrintOption[]): PrintVariant[] {
  const seen = new Set<string>();
  return options.map((option) => {
    const query = variantQuery(option);
    const sku = `${printId}-${sizeKey(option.size)}-${paperKey(option.paper)}`;
    if (seen.has(query)) {
      throw new Error(`Print "${printId}": two options share ${query}. Sizes and papers must be distinct.`);
    }
    if (sku.length > MAX_ID_LENGTH) {
      throw new Error(`Print "${printId}": SKU "${sku}" is ${sku.length} characters; Merchant Center allows ${MAX_ID_LENGTH}.`);
    }
    seen.add(query);
    return { option, sku, query };
  });
}
