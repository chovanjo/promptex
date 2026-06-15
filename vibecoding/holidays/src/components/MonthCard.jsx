import { useMemo } from "react";
import { YEAR, WEEKDAY_NAMES } from "../constants.js";
import { buildMonthGrid } from "../dateUtils.js";
import DayCell from "./DayCell.jsx";

/**
 * One month: title, weekday header row, and the day grid.
 * The grid itself is just CSS Grid with 7 columns — each week from
 * `buildMonthGrid` flows naturally into one row.
 */
export default function MonthCard({ name, month, gridOptions, dayToRanges, selectionSet, selectionBounds, hoveredRangeId, onStartDrag, onEditRange, onDayMouseEnter }) {
  // useMemo caches the computed grid: the calendar for July 2026
  // never changes, so there is no reason to rebuild it on every render.
  const weeks = useMemo(
    () => buildMonthGrid(YEAR, month, gridOptions),
    [month, gridOptions]
  );

  return (
    <section
      data-testid={`month-${name.toLowerCase()}`}
      className="bg-white rounded-xl shadow p-4 flex-1 min-w-[320px]"
    >
      <h2 className="text-lg font-bold text-center mb-3">{name} {YEAR}</h2>

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
          Hidden days (the Jul/Aug boundary dates owned by the OTHER
          card) render as empty placeholders that keep their column. */}
      <div className="grid grid-cols-7">
        {weeks.flat().map((day) => {
          if (day.hidden) {
            return <div key={day.iso} data-testid="blank-day" className="h-14" />;
          }
          const dayRanges = dayToRanges.get(day.iso) || [];
          return (
            <DayCell
              key={day.iso}
              day={day}
              ranges={dayRanges}
              isSelected={selectionSet.has(day.iso)}
              isSelectionStart={!!selectionBounds && day.iso === selectionBounds.start}
              isSelectionEnd={!!selectionBounds && day.iso === selectionBounds.end}
              isRangeHovered={hoveredRangeId !== null && dayRanges.some((r) => r.id === hoveredRangeId)}
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
