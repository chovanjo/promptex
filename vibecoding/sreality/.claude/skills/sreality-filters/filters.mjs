#!/usr/bin/env node
/**
 * CLI for the "sreality-filters" skill.
 *
 * WHAT IT DOES: shows what you can filter by on sreality.cz for a given property kind and
 * transaction type, including the number codes for dropdown filters (like building types or
 * dispositions). This is the live "what options exist?" lookup.
 *
 * HOW TO RUN:
 *   node filters.mjs --category byty --type prodej
 *   node filters.mjs --category domy --type pronajem --json
 *
 * It asks the live codebook endpoint (/estates/filter_page), so the answer is always current.
 */
import { filterPage, CATEGORY_CODE, TYPE_CODE } from '../../../scripts/sreality-api.mjs';

// Read "--name value" / "--flag" options into a simple object.
function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const name = argv[i].slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) opts[name] = true;
    else { opts[name] = next; i++; }
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));

if (opts.help) {
  console.log(`Show the filters and codes available for a property kind + transaction type.

Usage:
  node filters.mjs --category byty --type prodej
  node filters.mjs --category domy --type pronajem --json

Options:
  --category <byty|domy|pozemky|komercni|ostatni>   (default: byty)
  --type <prodej|pronajem|drazby|podily>            (default: prodej)
  --json    print machine-readable JSON
  --help    show this help

Tip: the committed reference snapshot is in schema/filters.json (with English labels).`);
  process.exit(0);
}

try {
  // Turn the words into number codes (default: apartments for sale).
  const categoryWord = String(opts.category ?? 'byty').toLowerCase();
  const typeWord = String(opts.type ?? 'prodej').toLowerCase();
  const categoryCode = CATEGORY_CODE[categoryWord];
  const typeCode = TYPE_CODE[typeWord];
  if (!categoryCode) throw new Error(`unknown --category "${categoryWord}" (try: ${Object.keys(CATEGORY_CODE).join(', ')})`);
  if (!typeCode) throw new Error(`unknown --type "${typeWord}" (try: ${Object.keys(TYPE_CODE).join(', ')})`);

  // Ask the API for the codebook (every filter and its allowed values).
  const codebook = await filterPage(categoryCode, typeCode);

  if (opts.json) {
    console.log(JSON.stringify(codebook, null, 2));
  } else {
    console.log(`Filters for ${categoryWord} / ${typeWord}:\n`);
    for (const [filterName, values] of Object.entries(codebook)) {
      if (values === null) {
        // No value list = a free input: a number range, some text, or an on/off switch.
        console.log(`  ${filterName}  (free input: range / text / on-off)`);
      } else {
        // A dropdown: list each "code = label" so you know what number to send.
        const shown = values.map((v) => `${v.code}=${v.label}`).join(', ');
        console.log(`  ${filterName}  (pick one or more): ${shown}`);
      }
    }
    console.log(`\nUse these names/codes with the sreality-search skill, e.g. building_type=2 (brick).`);
  }
} catch (error) {
  console.error(`Could not load filters: ${error.message}`);
  process.exit(1);
}
