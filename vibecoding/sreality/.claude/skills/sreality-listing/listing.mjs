#!/usr/bin/env node
/**
 * CLI for the "sreality-listing" skill.
 *
 * WHAT IT DOES: given one listing (by its id, or by pasting its web URL), prints a clean summary
 * of the most useful facts: price, layout, size, building type/condition, energy rating,
 * ownership, address and map position.
 *
 * HOW TO RUN:
 *   node listing.mjs 1986822220
 *   node listing.mjs "https://www.sreality.cz/detail/prodej/byt/4+kk/praha-michle-krnkova/1986822220"
 *   node listing.mjs --json 1986822220
 *
 * The id is just the long number at the end of a detail URL.
 */
import { getListing, buildDetailUrl, hashIdFromUrl } from '../../../scripts/sreality-api.mjs';

const args = process.argv.slice(2);
const wantJson = args.includes('--json');
const explicitHelp = args.includes('--help'); // user asked for help on purpose
const input = args.find((a) => !a.startsWith('--')); // the id or URL

// Show help when asked, or when no listing was given. Asking for --help is a success (exit 0);
// forgetting the required id is a usage error (exit 1).
if (explicitHelp || !input) {
  console.log(`Show a summary of one sreality.cz listing.

Usage:
  node listing.mjs <hash_id>
  node listing.mjs "<detail page URL>"
  node listing.mjs --json <hash_id>

Example:
  node listing.mjs 1986822220`);
  process.exit(explicitHelp ? 0 : 1);
}

// The input may be a bare id or a full URL. If it looks like a URL, pull the id out of it.
const hashId = /^\d+$/.test(input) ? input : hashIdFromUrl(input);
if (!hashId) {
  console.error(`Could not find a listing id in "${input}". Pass the long number from the URL.`);
  process.exit(1);
}

/**
 * Many fields come as { name, value } objects (the human label + the number code).
 * This returns the human label when present, otherwise the plain value.
 */
function label(field) {
  if (field && typeof field === 'object') return field.name ?? field.value;
  return field;
}

try {
  const listing = await getListing(hashId);

  if (wantJson) {
    console.log(JSON.stringify(listing, null, 2));
    process.exit(0);
  }

  const loc = listing.locality ?? {};
  const address = [loc.street, loc.housenumber, loc.city, loc.district].filter(Boolean).join(' ');
  const price = listing.price_czk ? `${listing.price_czk.toLocaleString('cs-CZ')} CZK` : (listing.price_summary ?? 'on request');

  // Print a tidy summary. We only show a line when the listing actually has that fact.
  console.log(`${listing.advert_name ?? 'Listing'} (#${hashId})\n`);
  const line = (labelText, value) => { if (value !== undefined && value !== null && value !== '') console.log(`  ${labelText}: ${value}`); };

  line('Price', price);
  line('Layout', label(listing.category_sub_cb));
  line('Usable area', listing.usable_area ? `${listing.usable_area} m²` : undefined);
  line('Land area', listing.estate_area ? `${listing.estate_area} m²` : undefined);
  line('Building', label(listing.building_type));
  line('Condition', label(listing.building_condition));
  line('Ownership', label(listing.ownership));
  line('Energy rating', label(listing.energy_efficiency_rating_cb));
  line('Address', address || undefined);
  if (loc.gps_lat && loc.gps_lon) line('Map', `${loc.gps_lat}, ${loc.gps_lon}`);
  line('Web page', buildDetailUrl(listing));
} catch (error) {
  // getListing throws a 404 message when the id is not a real listing.
  console.error(`Could not load listing ${hashId}: ${error.message}`);
  process.exit(1);
}
