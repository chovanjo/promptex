/**
 * Builds the public web address (URL) of a single listing's detail page.
 *
 * WHY THIS FILE EXISTS: we once guessed this URL wrong (we used "x/x" as placeholder
 * parts) and every link was broken (404). The website needs the REAL parts in the URL,
 * not placeholders. So this builder is treated as important, shared code and is covered
 * by its own test (tests/estates/detail.spec.ts).
 *
 * The URL looks like this:
 *   https://www.sreality.cz/detail/{type}/{category}/{disposition}/{city-citypart-street}/{hash_id}
 * Example:
 *   https://www.sreality.cz/detail/prodej/byt/4+kk/praha-michle-krnkova/1986822220
 */
import { SITE, TYPE_SLUG, CATEGORY_SLUG } from './constants';

/**
 * Turn any text into a "slug": lower-case, no accents, spaces become dashes.
 * Example: "6 a více" -> "6-a-vice". This is the safe form used inside URLs.
 */
function slugify(text: string | number): string {
  return String(text)
    .trim()
    .toLowerCase()
    .normalize('NFD') // split accented letters into letter + accent mark...
    .replace(/[̀-ͯ]/g, '') // ...then drop the accent marks
    .replace(/\s+/g, '-'); // spaces -> dashes
}

/**
 * Read a category-style field from a search result.
 * In SEARCH results these fields arrive as little objects like { name: "Byty", value: 1 }.
 * We usually want the number, so this returns the `value` if it is an object, else the
 * field as-is.
 */
function codeOf(field: any): number {
  return field && typeof field === 'object' ? field.value : field;
}

/**
 * Build the detail-page URL for one search result object.
 *
 * It reads:
 *  - the transaction type number  -> the word "prodej"/"pronajem"/...
 *  - the category number          -> the word "byt"/"dum"/...
 *  - the disposition name         -> a slug like "4+kk"
 *  - the locality SEO names       -> "city-citypart-street"
 *  - the hash_id                  -> the listing's unique id (last part of the URL)
 */
export function buildDetailUrl(result: any): string {
  const loc = result.locality ?? {};

  // Join the location parts that exist, skipping any that are missing.
  // citypart is sometimes called "quarter", so we accept either.
  const localitySlug = [loc.city_seo_name, loc.citypart_seo_name || loc.quarter_seo_name, loc.street_seo_name]
    .filter(Boolean)
    .join('-');

  const type = TYPE_SLUG[codeOf(result.category_type_cb)];
  const category = CATEGORY_SLUG[codeOf(result.category_main_cb)];
  // The disposition (e.g. "4+kk") comes as a name; fall back to the number if needed.
  const disposition = slugify(result.category_sub_cb?.name ?? codeOf(result.category_sub_cb));

  return `${SITE}/detail/${type}/${category}/${disposition}/${localitySlug}/${result.hash_id}`;
}
