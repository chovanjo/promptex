#!/usr/bin/env node
/**
 * CLI for the "sreality-locality" skill.
 *
 * WHAT IT DOES: takes a place name (like "Brno" or "V Dolině") and prints the matching places
 * with the ids a search needs. The sreality search filters places by an entity TYPE + ID
 * (locality_entity_type + locality_entity_id), and you get those from here.
 *
 * HOW TO RUN:
 *   node locality.mjs "Brno"
 *   node locality.mjs --json "Praha 4"
 *
 * The shared API code lives one folder up the tree, in scripts/sreality-api.mjs. We import it
 * by a path relative to THIS file, so it works no matter which folder you run the command from.
 */
import { suggest } from '../../../scripts/sreality-api.mjs';

// Read the command-line arguments (everything after "node locality.mjs").
const args = process.argv.slice(2);
const wantJson = args.includes('--json'); // print machine-readable JSON instead of a table
const explicitHelp = args.includes('--help'); // user asked for help on purpose

// The place name is the first argument that is not a flag (does not start with "--").
const phrase = args.find((a) => !a.startsWith('--'));

// Show help when asked, or when no place name was given. Asking for --help is a success
// (exit 0); forgetting the required place name is a usage error (exit 1).
if (explicitHelp || !phrase) {
  console.log(`Resolve a place name into the ids a sreality search needs.

Usage:
  node locality.mjs "<place name>"      Show matching places as a table
  node locality.mjs --json "<name>"     Show matches as JSON
  node locality.mjs --help              Show this help

Example:
  node locality.mjs "Brno"`);
  process.exit(explicitHelp ? 0 : 1);
}

// Ask the API, then print the results.
try {
  const places = await suggest(phrase);

  if (wantJson) {
    console.log(JSON.stringify(places, null, 2));
  } else if (places.length === 0) {
    console.log(`No places found for "${phrase}".`);
  } else {
    console.log(`Places matching "${phrase}":\n`);
    for (const p of places) {
      // Show the type + id (what a search needs) plus a human description.
      const where = [p.municipality, p.district, p.region].filter(Boolean).join(', ');
      console.log(`  ${p.entityType} #${p.entityId}  —  ${where}`);
      console.log(`     use in search:  locality_entity_type=${p.entityType}&locality_entity_id=${p.entityId}`);
    }
  }
} catch (error) {
  // Any failure (network, bad response) ends here with a clear message and a non-zero exit code.
  console.error(`Could not resolve place: ${error.message}`);
  process.exit(1);
}
