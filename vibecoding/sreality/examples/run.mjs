#!/usr/bin/env node
/**
 * Runnable examples for the public sreality.cz search API.
 *
 *   What it does: runs a handful of real searches and prints how many listings match each.
 *   How to run:   node examples/run.mjs
 *   Needs:        Node 18+ (it uses the built-in `fetch`). No API key is required.
 *
 * This file is kept STANDALONE on purpose (it does not import the test helpers) so you can
 * copy it anywhere and it just works. The test suite has its own typed copy of the same ideas.
 */

// The base address of the JSON API.
const BASE = "https://www.sreality.cz/api/v1";

// Headers we send with every request. A real User-Agent is polite; Accept asks for JSON.
const HEADERS = { "User-Agent": "sreality-docs-example/1.0", Accept: "application/json" };

/**
 * Run one search and return only the total number of matching listings.
 * `query` is the filter part of the URL, e.g. "category_main_cb=1&category_type_cb=1".
 * We add per_page=1 because we only want the count, not the listings themselves.
 */
async function total(query) {
  const res = await fetch(`${BASE}/estates/search?${query}&per_page=1`, { headers: HEADERS });
  const json = await res.json();
  return json.pagination?.total;
}

// --- Building a listing's web page URL ------------------------------------------------
// These maps turn a number into the word used in a detail-page URL.
const TYPE_WORD = { 1: "prodej", 2: "pronajem", 3: "drazba", 4: "podil" }; // sale / rent / auction / share
const CATEGORY_WORD = { 1: "byt", 2: "dum", 3: "pozemek", 4: "komercni-prostory", 5: "ostatni" };

// Turn text into a URL-safe "slug": lower-case, no accents, spaces become dashes.
const slugify = (text) =>
  String(text).trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");

/**
 * Build the public detail-page URL for one search result.
 * The website needs the REAL parts in the URL (placeholders give a 404), so we read them
 * from the result. In search results, category fields look like { name, value }, so we
 * pull out `.value` when needed.
 */
export function detailUrl(result) {
  const codeOf = (field) => (field && typeof field === "object" ? field.value : field);
  const loc = result.locality || {};
  const localitySlug = [loc.city_seo_name, loc.citypart_seo_name || loc.quarter_seo_name, loc.street_seo_name]
    .filter(Boolean)
    .join("-");
  const type = TYPE_WORD[codeOf(result.category_type_cb)];
  const category = CATEGORY_WORD[codeOf(result.category_main_cb)];
  const disposition = slugify(result.category_sub_cb?.name ?? codeOf(result.category_sub_cb));
  return `https://www.sreality.cz/detail/${type}/${category}/${disposition}/${localitySlug}/${result.hash_id}`;
}

// --- The example searches -------------------------------------------------------------
// A friendly name -> the filter part of the search URL. Each one shows a different filter.
const examples = {
  "Apartments for sale (baseline)": "category_main_cb=1&category_type_cb=1",
  "2+kk apartments for sale": "category_main_cb=1&category_type_cb=1&category_sub_cb=4",
  "Apartments for sale, max 2,000,000 CZK": "category_main_cb=1&category_type_cb=1&price_to=2000000",
  "Brick apartments for sale": "category_main_cb=1&category_type_cb=1&building_type=2",
  "Apartments for sale in Prague (region 10)": "category_main_cb=1&category_type_cb=1&locality_region_id=10",
  "Apartments for sale with balcony": "category_main_cb=1&category_type_cb=1&balcony=1",
  "Furnished apartments for rent": "category_main_cb=1&category_type_cb=2&furnished=1",
  "Villas for sale (houses, sub 39)": "category_main_cb=2&category_type_cb=1&category_sub_cb=39",
  "Houses for sale, plot >= 500 m2": "category_main_cb=2&category_type_cb=1&estate_area_from=500",
  "Building land for sale, <=1000 CZK/m2": "category_main_cb=3&category_type_cb=1&category_sub_cb=19&price_m2_to=1000",
  "Apartments posted today": "category_main_cb=1&category_type_cb=1&advert_age_to=1",
};

/**
 * Show the two-step "search by place" flow:
 *   1. ask /localities/suggest for "Brno" to get its type + id,
 *   2. search using that place.
 */
async function searchByPlaceExample() {
  const res = await fetch(`${BASE}/localities/suggest?phrase=Brno`, { headers: HEADERS });
  const json = await res.json();
  const place = json.results?.[0]?.userData; // the best match
  const count = await total(
    `category_main_cb=1&category_type_cb=1&locality_entity_type=${place.entityType}&locality_entity_id=${place.id}`,
  );
  return { entityType: place.entityType, id: place.id, total: count };
}

// Run everything and print the results as a simple aligned list.
async function main() {
  for (const [name, query] of Object.entries(examples)) {
    const count = await total(query);
    console.log(String(count).padStart(8), " ", name);
  }
  const place = await searchByPlaceExample();
  console.log(
    String(place.total).padStart(8),
    `  Apartments for sale in ${place.entityType} #${place.id} (Brno, via /localities/suggest)`,
  );
}

// Start the program. If anything throws, print it and exit with a non-zero code.
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
