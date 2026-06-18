/**
 * Shared constants used across the whole test suite.
 *
 * sreality.cz describes properties with small NUMBER codes instead of words.
 * For example the category "Apartments" is the number 1, and "Sale" is also 1.
 * These maps let us turn the easy-to-read word ("byty", "prodej") into the number
 * the API expects, and turn a number back into the word used in a web URL.
 *
 * Keeping all of these in one tiny file means there is a single place to look when
 * you wonder "what number means houses again?".
 */

/** The public website. Used for full page URLs like https://www.sreality.cz/detail/... */
export const SITE = 'https://www.sreality.cz';

/** The base of the JSON API. Used when we need a full API URL (not the Playwright baseURL). */
export const API = `${SITE}/api/v1`;

/**
 * Category word -> category number (the `category_main_cb` value).
 * Example: searching for houses means sending category_main_cb=2.
 */
export const CATEGORY_CODE: Record<string, number> = {
  byty: 1, // apartments
  domy: 2, // houses
  pozemky: 3, // land
  komercni: 4, // commercial
  ostatni: 5, // other
};

/**
 * Transaction word -> transaction number (the `category_type_cb` value).
 * We only test the two common ones; auctions (3) and shares (4) also exist.
 */
export const TYPE_CODE: Record<string, number> = {
  prodej: 1, // sale
  pronajem: 2, // rent
};

/**
 * Transaction number -> the word used inside a detail-page URL.
 * Example: a listing with category_type_cb=1 lives under /detail/prodej/...
 */
export const TYPE_SLUG: Record<number, string> = {
  1: 'prodej', // sale
  2: 'pronajem', // rent
  3: 'drazba', // auction
  4: 'podil', // co-ownership share
};

/**
 * Category number -> the SINGULAR word used inside a detail-page URL.
 * Note it is singular: category 1 is "byty" (apartments) in a search, but the URL uses "byt".
 */
export const CATEGORY_SLUG: Record<number, string> = {
  1: 'byt', // apartment
  2: 'dum', // house
  3: 'pozemek', // land
  4: 'komercni-prostory', // commercial space
  5: 'ostatni', // other
};
