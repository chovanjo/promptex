import { CZ_HOLIDAYS } from "../constants.js";
import { formatShort } from "../dateUtils.js";

/**
 * Legend explaining the red holiday markers in the calendars.
 * Built straight from the CZ_HOLIDAYS constant — add a holiday
 * there and it automatically appears here too (single source of
 * truth: the data lives in one place, the UI just reflects it).
 */
export default function HolidayLegend() {
  // Object.entries turns { "2026-07-05": "…" } into [iso, name]
  // pairs we can map over. Object keys keep insertion order, so the
  // holidays appear in date order as long as the constant is sorted.
  const holidays = Object.entries(CZ_HOLIDAYS);
  return (
    <div data-testid="holiday-legend" className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600 mb-6 px-1">
      <span className="font-semibold">Public holidays (CZ):</span>
      {holidays.map(([iso, name]) => (
        <span key={iso} className="flex items-center gap-1.5">
          {/* Same red dot as in the day cells, so the connection is obvious. */}
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {formatShort(iso)} — {name}
        </span>
      ))}
    </div>
  );
}
