import { useMemo } from "react";
import { WEEKDAY_NAMES } from "../constants.js";
import { buildMonthGrid } from "../dateUtils.js";
import DayCell from "./DayCell.jsx";

/**
 * One month: title, weekday header row, and the day grid.
 * The grid itself is just CSS Grid with 7 columns — each week from
 * `buildMonthGrid` flows naturally into one row.
 */
export default function MonthCard({ name, year, month, dayToRanges, selectionSet, selectionBounds, onStartDrag, onEditRange, onDayMouseEnter }) {
  // useMemo caches the computed grid: a given month/year never changes,
  // so there is no reason to rebuild it on every render.
  const weeks = useMemo(
    () => buildMonthGrid(year, month),
    [year, month]
  );

  return (
    <section
      data-testid={`month-${name.toLowerCase()}`}
      className="bg-white rounded-xl shadow p-4"
    >
      <h2 className="text-lg font-bold text-center mb-3">{name}</h2>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_NAMES.map((dayName) => (
          // `key` lets React track list items between renders.
          <div key={dayName} className="text-center text-xs font-semibold text-gray-500 py-1">
            {dayName}
          </div>
        ))}
      </div>

      {/* Day cells: `weeks.flat()` turns [[7 days], [7 days], …]
          into one flat list that fills the 7-column grid row by row.
          Filler days from adjacent months are rendered (greyed) by
          DayCell itself. */}
      <div className="grid grid-cols-7">
        {weeks.flat().map((day) => {
          const dayRanges = dayToRanges.get(day.iso) || [];
          return (
            <DayCell
              key={day.iso}
              day={day}
              ranges={dayRanges}
              isSelected={selectionSet.has(day.iso)}
              isSelectionStart={!!selectionBounds && day.iso === selectionBounds.start}
              isSelectionEnd={!!selectionBounds && day.iso === selectionBounds.end}
              onStartDrag={onStartDrag}
              onEditRange={onEditRange}
              onMouseEnter={onDayMouseEnter}
            />
          );
        })}
      </div>
    </section>
  );
}
