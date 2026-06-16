// JSON Schema for the import/export file, validated at runtime with ajv.
//
// The schema covers STRUCTURE only — shape, types, the date format, the
// colour pattern. The travel-day domain rules a schema can't express
// (start ≤ end, no multi-day overlap, ≤ 2 trips per day) stay in
// validateImportedRanges in App.jsx.
import Ajv from "ajv";
import addFormats from "ajv-formats";

/** The contract for an exported plan: `{ ranges: [ {label,color,start,end, id?} ] }`. */
export const RANGES_SCHEMA = {
  type: "object",
  required: ["ranges"],
  additionalProperties: false,
  properties: {
    ranges: {
      type: "array",
      items: {
        type: "object",
        required: ["label", "color", "start", "end"],
        additionalProperties: false,
        properties: {
          // `id` is present in exports (regenerated on import), so allow it.
          id: { type: "string" },
          label: { type: "string" },
          // Colours are Tailwind background classes like "bg-blue-200".
          color: { type: "string", pattern: "^bg-[a-z]+-\\d{2,3}$" },
          // `format: "date"` (ajv-formats) enforces YYYY-MM-DD *and* a real
          // calendar date, so impossible dates like 2026-02-30 are rejected.
          start: { type: "string", format: "date" },
          end: { type: "string", format: "date" },
        },
      },
    },
  },
};

// Compile once at module load. allErrors:false → stop at the first problem,
// which is all we need to show a single friendly message.
const ajv = new Ajv({ allErrors: false });
addFormats(ajv);
const validate = ajv.compile(RANGES_SCHEMA);

/**
 * Validate the parsed file structure against RANGES_SCHEMA.
 * Returns null when valid, otherwise a friendly, user-facing message
 * (ajv's own messages are too technical) derived from the first error.
 */
export function validateRangesSchema(data) {
  if (validate(data)) return null;

  const error = validate.errors[0];
  const path = error.instancePath; // e.g. "" or "/ranges/0/color"

  // Anything wrong at the top level (missing/!array `ranges`, unknown key)
  // → the file just isn't the right shape.
  if (!path.startsWith("/ranges/")) {
    return "File must contain a { ranges: [...] } object.";
  }
  // A bad colour gets its own message, naming the offending range.
  if (path.endsWith("/color")) {
    const index = Number(path.split("/")[2]);
    const label = data?.ranges?.[index]?.label;
    return `Range "${label}" has an invalid color — expected a Tailwind class like "bg-blue-200".`;
  }
  // Any other per-range problem (label/start/end type or format, a missing
  // field, a non-object entry, an unknown extra field).
  return "Each range needs label, color, start and end (YYYY-MM-DD).";
}
