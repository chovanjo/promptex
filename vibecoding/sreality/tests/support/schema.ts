/**
 * Loads and describes our committed snapshot of the API filters: schema/filters.json.
 *
 * "Schema" here just means: our written-down list of every search filter, what API
 * parameter it maps to, and (for dropdown-style filters) every allowed value with its
 * number code and Czech label.
 *
 * The drift test (tests/schema/codebooks-drift.spec.ts) compares this snapshot against
 * the LIVE API. If they disagree, the API changed and our docs need updating.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Work out the project root from this file's location, so the path works no matter
// where the tests are started from. (import.meta.url is this file's own URL.)
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..', '..');

/**
 * One allowed value of a dropdown-style ("enum") filter.
 * Example: { code: 2, label_cs: "Cihlová", label_en: "Brick" } for a brick building.
 */
export interface EnumValue {
  code: number; // the number the API expects
  label_cs?: string; // the Czech text shown on the website
  label_en?: string | null; // our English translation (may be missing)
}

/** How one filter is described in schema/filters.json. */
export interface FilterDef {
  api_param?: string; // single-value filters: the query parameter name, e.g. "building_type"
  api_params?: { from: string; to: string }; // range filters: a pair, e.g. price_from / price_to
  type: 'enum' | 'enum_string' | 'range' | 'boolean' | 'id' | 'number' | 'string';
  applies_to: { category: string[]; type: string[] }; // where this filter is valid
  values?: EnumValue[]; // allowed values for a normal enum filter
  values_by_category?: Record<string, EnumValue[]>; // enum whose values differ per category
  example?: unknown; // a sample value, handy for docs
}

/** The whole schema/filters.json file. */
export interface Schema {
  api: Record<string, any>; // endpoint descriptions (not type-checked in detail here)
  filters: Record<string, FilterDef>; // every documented filter, keyed by a friendly name
}

// We read the file only once and remember it, because reading from disk repeatedly is wasteful.
let cached: Schema | undefined;

/** Read schema/filters.json from disk (only the first time) and return it as a typed object. */
export function loadSchema(): Schema {
  if (!cached) {
    const filePath = resolve(PROJECT_ROOT, 'schema/filters.json');
    cached = JSON.parse(readFileSync(filePath, 'utf8')) as Schema;
  }
  return cached;
}
