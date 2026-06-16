import { formatShort } from "../dateUtils.js";
import HolidayStatus from "./HolidayStatus.jsx";

/**
 * The selected year's Czech public holidays, below the calendar: a heading
 * with the loader status (dot + visible text), then the list in date order,
 * each with the same red dot used as the in-cell marker.
 *
 * Always rendered (so the status is visible while loading / on error);
 * `holidays` is a Map(ISO date → Czech localName), `status` is the loader
 * state from useHolidays.
 */
export default function HolidayLegend({ holidays, status }) {
  // ISO strings sort chronologically as plain strings.
  const entries = [...holidays.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <section data-testid="holiday-legend" className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="font-semibold text-gray-800 text-sm">Public holidays (CZ)</h2>
        <HolidayStatus status={status} />
      </div>
      {entries.length > 0 ? (
        <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
          {entries.map(([iso, name]) => (
            <li key={iso} data-testid="holiday-legend-item" className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {formatShort(iso)} — {name}
            </li>
          ))}
        </ul>
      ) : (
        status === "ok" && <p className="text-sm text-gray-400">None this year.</p>
      )}
    </section>
  );
}
