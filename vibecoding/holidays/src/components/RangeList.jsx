import { formatShort, countDays } from "../dateUtils.js";

/**
 * The list of all saved ranges under the calendars.
 * Hovering a row highlights the matching days in the calendar
 * (reported up via onHoverRange), which helps users connect the
 * list entry with its place in the calendar.
 */
export default function RangeList({ ranges, onEdit, onDelete, onHoverRange }) {
  if (ranges.length === 0) {
    return (
      <p data-testid="empty-hint" className="text-center text-gray-400 text-sm py-4">
        No ranges yet — drag across days in the calendar to plan your first holiday.
      </p>
    );
  }

  // Show ranges in date order, not creation order. `toSorted` would
  // be nicer but `[...ranges].sort` works in every browser:
  // we copy first because `.sort()` mutates, and props must never
  // be mutated.
  const sorted = [...ranges].sort((a, b) => a.start.localeCompare(b.start));

  return (
    <ul data-testid="range-list" className="divide-y divide-gray-100">
      {sorted.map((range) => (
        <li
          key={range.id}
          data-testid="range-item"
          className="flex items-center gap-3 py-2 px-1 hover:bg-gray-50 rounded"
          onMouseEnter={() => onHoverRange(range.id)}
          onMouseLeave={() => onHoverRange(null)}
        >
          <span className={`${range.color} w-4 h-4 rounded-full shrink-0`} />
          <span className="font-medium flex-1 truncate">{range.label}</span>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {formatShort(range.start)} – {formatShort(range.end)} · {countDays(range.start, range.end)}d
          </span>
          <button
            type="button"
            data-testid="edit-range-btn"
            onClick={() => onEdit(range)}
            className="text-sm text-blue-600 hover:underline"
          >
            Edit
          </button>
          <button
            type="button"
            data-testid="delete-range-btn"
            onClick={() => onDelete(range.id)}
            className="text-sm text-red-600 hover:underline"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
