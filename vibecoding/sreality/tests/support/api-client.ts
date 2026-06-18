/**
 * Small, friendly wrappers around the sreality.cz API calls our tests need.
 *
 * Instead of every test writing out URLs and reading JSON by hand, they call these
 * helpers. That keeps the tests short and easy to read, and if the API ever changes
 * we only have to fix it here in one place.
 *
 * Note about URLs: Playwright already knows the API base (see playwright.config.ts,
 * baseURL = ".../api/v1/"). So here we pass only the RELATIVE path, e.g.
 * "estates/search". Important: do NOT start the path with "/" — a leading slash would
 * throw away the "/api/v1" part of the base URL.
 */
import type { APIRequestContext } from '@playwright/test';
import type { EnumValue } from './schema';

/** The "how many results and which page" part of a search response. */
export interface Pagination {
  total: number; // how many listings match in total
  limit: number; // how many are returned on this page
  offset: number; // how far into the list this page starts
}

/** The shape of a /estates/search response (only the parts we use). */
export interface SearchResponse {
  pagination: Pagination;
  results: any[]; // each item is one listing; its exact shape is not type-checked here
  status_code: number;
}

/**
 * Turn a plain object of filters into a URL query string.
 * A value can be a single value OR an array. An array means "this value OR that value" (e.g.
 * several dispositions) and must be sent as ONE comma-separated value.
 * Example: { category_sub_cb: [4, 5] } -> "category_sub_cb=4,5".
 *
 * IMPORTANT: do NOT repeat the parameter ("category_sub_cb=4&category_sub_cb=5"). When repeated,
 * the API silently keeps only the FIRST value and ignores the rest — a wrong result with no
 * error. Comma is the only form that works (a pipe "4|5" makes the server return 500).
 */
function toQueryString(params: Record<string, string | number | Array<string | number>>): URLSearchParams {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    qs.append(key, Array.isArray(value) ? value.join(',') : String(value));
  }
  return qs;
}

/**
 * Run a property search (GET /estates/search) and return the parsed JSON.
 * `request` is Playwright's HTTP client (handed to every test).
 * `params` are the filters, e.g. { category_main_cb: 1, category_type_cb: 1 }.
 * We default per_page to 1 because most tests only care about the total count, not the items.
 */
export async function search(
  request: APIRequestContext,
  params: Record<string, string | number | Array<string | number>>,
): Promise<SearchResponse> {
  const qs = toQueryString(params);
  if (!qs.has('per_page')) qs.set('per_page', '1');

  const res = await request.get(`estates/search?${qs.toString()}`);
  if (!res.ok()) {
    throw new Error(`search failed with status ${res.status()} for query: ${qs.toString()}`);
  }
  return res.json();
}

/**
 * Convenience helper: run a search and return ONLY the total match count.
 * Many tests just want to check "did this filter make the count go down?".
 */
export async function searchTotal(
  request: APIRequestContext,
  params: Record<string, string | number | Array<string | number>>,
): Promise<number> {
  const response = await search(request, params);
  return response.pagination.total;
}

/**
 * Fetch the "codebooks" for one category + transaction type.
 *
 * A "codebook" is the list of filters available for that combination, and for each
 * dropdown filter, the allowed values. We ask GET /estates/filter_page and reshape its
 * answer into a simple object: { filterName: [ {code, label_cs}, ... ] }.
 * Filters that are free text / numbers / on-off switches have no value list, so they
 * map to `null`.
 */
export async function filterPage(
  request: APIRequestContext,
  categoryMain: number,
  categoryType: number,
): Promise<Record<string, EnumValue[] | null>> {
  const res = await request.get(`estates/filter_page?category_main_cb=${categoryMain}&category_type_cb=${categoryType}`);
  if (!res.ok()) {
    throw new Error(`filter_page failed with status ${res.status()}`);
  }
  const json = await res.json();

  // The API calls the value list "values" and uses {id, name}. We rename to our friendlier
  // {code, label_cs} so the rest of the codebase speaks one consistent language.
  const out: Record<string, EnumValue[] | null> = {};
  for (const filter of json.results as Array<{ id_name: string; values?: Array<{ id: number; name: string }> }>) {
    out[filter.id_name] = filter.values
      ? filter.values.map((v) => ({ code: v.id, label_cs: v.name }))
      : null;
  }
  return out;
}
