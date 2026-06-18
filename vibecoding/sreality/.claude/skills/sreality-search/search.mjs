#!/usr/bin/env node
/**
 * CLI for the "sreality-search" skill — the main one.
 *
 * WHAT IT DOES: searches sreality.cz for properties using easy-to-read options, and prints the
 * matching listings with their price, location, and a WORKING link to each listing's web page.
 *
 * HOW TO RUN (examples):
 *   node search.mjs --category byty --type prodej --place "Brno" --price-max 5000000
 *   node search.mjs --category byty --type prodej --disposition "4+kk,5+kk" \
 *                    --place "V Dolině" --radius 1 --price-min 5000000 --area-min 80
 *   node search.mjs --category domy --type pronajem --place "Praha" --balcony --json
 *
 * The real API work is done by the shared library in scripts/sreality-api.mjs. This file just
 * reads the command-line options, turns words into the number codes the API wants, and prints.
 */
import {
  search,
  suggest,
  resolveDispositions,
  buildDetailUrl,
  CATEGORY_CODE,
  TYPE_CODE,
} from '../../../scripts/sreality-api.mjs';

// -------------------------------------------------------------------------------------
// Step 1: read the command-line options into a simple object.
// We accept "--name value" and "--flag" (a flag on its own means "yes/true").
// -------------------------------------------------------------------------------------
function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const name = arg.slice(2); // drop the leading "--"
    const next = argv[i + 1];
    // If the next item is another flag (or missing), treat this as an on/off flag = true.
    if (next === undefined || next.startsWith('--')) {
      opts[name] = true;
    } else {
      opts[name] = next;
      i++; // we consumed the value, so skip it next loop
    }
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
const wantJson = Boolean(opts.json);

// -------------------------------------------------------------------------------------
// Help text. Shown with --help or when no useful options are given.
// -------------------------------------------------------------------------------------
if (opts.help) {
  console.log(`Search sreality.cz for properties.

Required-ish:
  --category <byty|domy|pozemky|komercni|ostatni>   property kind (default: byty)
  --type <prodej|pronajem|drazby|podily>            sale/rent/... (default: prodej)

Where:
  --place "<name>"     town/district/street to search in (resolved automatically)
  --radius <km>        search within this many km of --place

What:
  --disposition "4+kk,5+kk"   layout(s); words are matched to the right codes per category
  --sub "8,10"                OR raw category_sub_cb codes if you already know them
  --rooms <n>                 number of rooms (houses use this, code 1..6)
  --price-min <czk>  --price-max <czk>
  --area-min <m2>    --area-max <m2>           (usable floor area)
  --building-type <code>      e.g. 2 = brick
  --balcony --terrace --lift --garage --parking --cellar --garden   (on/off features)
  --furnished                 rentals only

Output:
  --limit <n>   how many listings to print (default 10)
  --json        print machine-readable JSON instead of a table
  --help        show this help

Example:
  node search.mjs --category byty --type prodej --disposition "4+kk" \\
                  --place "V Dolině" --radius 1 --price-min 5000000 --area-min 80`);
  process.exit(0);
}

// -------------------------------------------------------------------------------------
// Step 2: translate the friendly options into the API's number codes and parameter names.
// -------------------------------------------------------------------------------------
async function buildSearchParams() {
  // Category and type: turn the word into a number (default to apartments for sale).
  const categoryWord = String(opts.category ?? 'byty').toLowerCase();
  const typeWord = String(opts.type ?? 'prodej').toLowerCase();
  const categoryCode = CATEGORY_CODE[categoryWord];
  const typeCode = TYPE_CODE[typeWord];
  if (!categoryCode) throw new Error(`unknown --category "${categoryWord}" (try: ${Object.keys(CATEGORY_CODE).join(', ')})`);
  if (!typeCode) throw new Error(`unknown --type "${typeWord}" (try: ${Object.keys(TYPE_CODE).join(', ')})`);

  // Start building the query with the two required filters.
  const params = { category_main_cb: categoryCode, category_type_cb: typeCode };

  // Disposition: either raw codes via --sub, or words via --disposition (matched per category).
  if (opts.sub) {
    params.category_sub_cb = String(opts.sub).split(',').map((s) => Number(s.trim()));
  } else if (opts.disposition) {
    const words = String(opts.disposition).split(',').map((s) => s.trim());
    const codes = await resolveDispositions(words, categoryCode, typeCode);
    if (codes.length === 0) throw new Error(`no dispositions matched "${opts.disposition}" for ${categoryWord}`);
    params.category_sub_cb = codes;
  }

  // Place: ask autocomplete for the name and use the first match. Optionally add a radius.
  if (opts.place) {
    const matches = await suggest(String(opts.place));
    if (matches.length === 0) throw new Error(`could not find a place named "${opts.place}"`);
    const place = matches[0];
    params.locality_entity_type = place.entityType;
    params.locality_entity_id = place.entityId;
    if (opts.radius) params.locality_radius = Number(opts.radius);
  }

  // Simple number ranges. We only add a bound if the user gave it.
  if (opts['price-min']) params.price_from = Number(opts['price-min']);
  if (opts['price-max']) params.price_to = Number(opts['price-max']);
  if (opts['area-min']) params.usable_area_from = Number(opts['area-min']);
  if (opts['area-max']) params.usable_area_to = Number(opts['area-max']);
  if (opts.rooms) params.room_count_cb = Number(opts.rooms);
  if (opts['building-type']) params.building_type = Number(opts['building-type']);

  // On/off feature flags. Each becomes "name=1" only when the flag is present.
  const booleanFlags = {
    balcony: 'balcony',
    terrace: 'terrace',
    lift: 'elevator',
    garage: 'garage',
    parking: 'parking_lots',
    cellar: 'cellar',
    garden: 'garden',
    furnished: 'furnished',
  };
  for (const [flag, param] of Object.entries(booleanFlags)) {
    if (opts[flag]) params[param] = 1;
  }

  // We only need a small page of results to print.
  params.per_page = Math.max(Number(opts.limit) || 10, 1);
  return params;
}

// -------------------------------------------------------------------------------------
// Step 3: run the search and print the results.
// -------------------------------------------------------------------------------------
try {
  const params = await buildSearchParams();
  const response = await search(params);
  const limit = Math.max(Number(opts.limit) || 10, 1);
  const listings = response.results.slice(0, limit);

  if (wantJson) {
    // Machine-readable: include the total, and for each listing the key facts + its URL.
    const out = {
      total: response.pagination.total,
      shown: listings.length,
      listings: listings.map((it) => ({
        hashId: it.hash_id,
        name: it.advert_name,
        priceCzk: it.price_czk,
        locality: it.locality?.value ?? it.locality,
        url: buildDetailUrl(it),
      })),
    };
    console.log(JSON.stringify(out, null, 2));
  } else {
    // Human-readable list. Remember: the total is a snapshot and changes over time.
    console.log(`Found ${response.pagination.total} listings (showing ${listings.length}):\n`);
    for (const it of listings) {
      const price = it.price_czk ? `${it.price_czk.toLocaleString('cs-CZ')} CZK` : (it.price_summary ?? 'price on request');
      console.log(`• ${it.advert_name} — ${price}`);
      console.log(`   ${buildDetailUrl(it)}`);
    }
  }
} catch (error) {
  console.error(`Search failed: ${error.message}`);
  process.exit(1);
}
