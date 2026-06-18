/**
 * Shared library for talking to the public sreality.cz property API.
 *
 * WHO USES THIS: the four skill CLIs in .claude/skills/ all import these functions, so the
 * "how to call the API" knowledge lives in ONE place. If the API ever changes, we fix it here
 * and every skill is fixed too.
 *
 * No API key is needed and no extra packages are required — this uses Node's built-in `fetch`
 * (available in Node 18+).
 *
 * A few facts about this API that are easy to get wrong (we learned these the hard way):
 *  - The search endpoint is GET /estates/search. Filters go in the URL query string.
 *  - Most filter values are NUMBER codes, not words (e.g. apartments = 1, sale = 1).
 *  - A detail-page URL needs REAL parts, not placeholders, or it gives a 404.
 *  - In SEARCH results, category fields look like { name, value } — use `.value` for the number.
 *  - Never trust an exact result count; listings appear and disappear all day.
 */

// The base address of the JSON API. Every request starts with this.
export const API = 'https://www.sreality.cz/api/v1';

// The public website (used only to build links to a listing's web page).
export const SITE = 'https://www.sreality.cz';

// Headers we send on every request. A real User-Agent is polite; Accept asks for JSON back.
const HEADERS = { 'User-Agent': 'sreality-skill/1.0', Accept: 'application/json' };

// --- Word <-> number maps -------------------------------------------------------------
// People say "byty" (apartments); the API wants the number 1. These maps translate.

/** Category word -> the number used in `category_main_cb`. */
export const CATEGORY_CODE = {
  byty: 1, // apartments
  domy: 2, // houses
  pozemky: 3, // land
  komercni: 4, // commercial
  ostatni: 5, // other
};

/** Transaction word -> the number used in `category_type_cb`. */
export const TYPE_CODE = {
  prodej: 1, // sale
  pronajem: 2, // rent
  drazby: 3, // auction
  podily: 4, // co-ownership share
};

/** Transaction number -> the word used INSIDE a detail-page URL. */
export const TYPE_SLUG = { 1: 'prodej', 2: 'pronajem', 3: 'drazba', 4: 'podil' };

/** Category number -> the SINGULAR word used inside a detail-page URL (byty -> "byt"). */
export const CATEGORY_SLUG = { 1: 'byt', 2: 'dum', 3: 'pozemek', 4: 'komercni-prostory', 5: 'ostatni' };

// --- The lowest-level helper ----------------------------------------------------------

/**
 * Make one GET request to the API and return the parsed JSON.
 * `path` is everything after the base, e.g. "estates/search?...".
 * If the server answers with an error status, we throw a clear message.
 */
async function apiGet(path) {
  const res = await fetch(`${API}/${path}`, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`sreality API request failed (status ${res.status}) for: ${path}`);
  }
  return res.json();
}

/**
 * Turn a plain object of filters into a URL query string.
 * A value can be a single value OR an array. An array means "this value OR that value" (for
 * example several dispositions at once) — and this API expects those as ONE comma-separated
 * value, e.g. `category_sub_cb=6,7,8`.
 *
 * IMPORTANT (learned the hard way): do NOT repeat the parameter
 * (`category_sub_cb=6&category_sub_cb=7`). When repeated, the API silently keeps only the FIRST
 * value and ignores the rest — so your search is wrong without any error. A pipe (`6|7`) makes
 * the server crash with a 500. Comma is the only form that works.
 *
 * Values that are null/undefined/empty are skipped, so callers can pass optional filters freely.
 */
export function buildQuery(params) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    // Join arrays with commas into a single parameter (URLSearchParams safely encodes the comma).
    qs.append(key, Array.isArray(value) ? value.join(',') : String(value));
  }
  return qs;
}

// --- The main API calls ---------------------------------------------------------------

/**
 * Suggest places for a typed phrase (autocomplete), e.g. suggest("Brno").
 * Returns a simplified list where each item has the bits a search needs.
 */
export async function suggest(phrase) {
  const json = await apiGet(`localities/suggest?phrase=${encodeURIComponent(phrase)}`);
  // Each raw result keeps the useful fields under `userData`. We flatten them out.
  return (json.results ?? []).map((r) => {
    const u = r.userData ?? {};
    return {
      name: r.category, // the kind of place, e.g. "municipality_cz"
      entityType: u.entityType, // e.g. "municipality" — goes into locality_entity_type
      entityId: u.id, // e.g. 5740 — goes into locality_entity_id
      municipality: u.municipality,
      district: u.district,
      districtId: u.district_id,
      region: u.region,
      regionId: u.region_id,
      latitude: u.latitude,
      longitude: u.longitude,
    };
  });
}

/**
 * Run a property search. `params` is an object of filters, e.g.
 *   { category_main_cb: 1, category_type_cb: 1, price_to: 2000000 }
 * Returns the parsed response: { pagination: { total, limit, offset }, results: [...] }.
 */
export async function search(params) {
  const qs = buildQuery(params);
  if (!qs.has('per_page')) qs.set('per_page', '20'); // a sensible default page size
  return apiGet(`estates/search?${qs.toString()}`);
}

/** Fetch the full data for one listing by its hash_id. Throws (404) if the id is not real. */
export async function getListing(hashId) {
  const json = await apiGet(`estates/${hashId}`);
  return json.result; // the listing lives under `result`
}

/**
 * Fetch the "codebooks" for one category + transaction type.
 * A codebook is the list of filters available for that combination, and for each dropdown
 * filter, the allowed values. We reshape the answer into a simple object:
 *   { filterName: [ { code, label }, ... ] }
 * Filters that are free text / numbers / on-off switches have no value list, so they map to null.
 */
export async function filterPage(categoryCode, typeCode) {
  const json = await apiGet(`estates/filter_page?category_main_cb=${categoryCode}&category_type_cb=${typeCode}`);
  const out = {};
  for (const f of json.results ?? []) {
    out[f.id_name] = f.values ? f.values.map((v) => ({ code: v.id, label: v.name })) : null;
  }
  return out;
}

// --- Helpers that turn human words into API values ------------------------------------

/**
 * Find the `category_sub_cb` number code(s) for one or more disposition words.
 * Dispositions differ per category (a flat's "4+kk" vs a house's "Villa"), so we ask the live
 * codebook for the chosen category and match by the label text.
 *
 * `words` can be a single word ("4+kk") or many (["4+kk", "5+kk"]).
 * Matching is forgiving: it ignores case and spaces, so "6 a vice" matches "6 a více".
 * Returns an array of number codes (empty if nothing matched).
 */
export async function resolveDispositions(words, categoryCode, typeCode) {
  const wanted = (Array.isArray(words) ? words : [words]).map(normalise);
  const codebook = await filterPage(categoryCode, typeCode);
  const options = codebook.category_sub_cb ?? [];
  const codes = [];
  for (const option of options) {
    if (wanted.includes(normalise(option.label))) codes.push(option.code);
  }
  return codes;
}

/** Lower-case and remove spaces/accents so two labels can be compared loosely. */
function normalise(text) {
  return String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '');
}

/**
 * Turn any text into a URL-safe "slug": lower-case, no accents, spaces become dashes.
 * Example: "6 a více" -> "6-a-vice".
 */
export function slugify(text) {
  return String(text).trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');
}

/**
 * Build the public web-page URL for one search result.
 * The website needs the REAL parts (placeholders give a 404), so we read them from the result.
 * Remember: in search results the category fields are objects like { name, value }.
 *   /detail/{type}/{category}/{disposition}/{city-citypart-street}/{hash_id}
 */
export function buildDetailUrl(result) {
  const codeOf = (field) => (field && typeof field === 'object' ? field.value : field);
  const loc = result.locality ?? {};
  const localitySlug = [loc.city_seo_name, loc.citypart_seo_name || loc.quarter_seo_name, loc.street_seo_name]
    .filter(Boolean)
    .join('-');
  const type = TYPE_SLUG[codeOf(result.category_type_cb)];
  const category = CATEGORY_SLUG[codeOf(result.category_main_cb)];
  const disposition = slugify(result.category_sub_cb?.name ?? codeOf(result.category_sub_cb));
  return `${SITE}/detail/${type}/${category}/${disposition}/${localitySlug}/${result.hash_id}`;
}

/**
 * Pull the hash_id (the listing's unique number) out of a detail URL.
 * It is always the last part of the path. Returns null if none is found.
 * Example: ".../praha-michle-krnkova/1986822220" -> "1986822220".
 */
export function hashIdFromUrl(url) {
  const match = String(url).match(/(\d{6,})(?:[/?#].*)?$/);
  return match ? match[1] : null;
}
