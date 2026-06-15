// A presentational component: it receives everything via props ("props
// down") and reports interactions through callback props ("callbacks
// up") — it never changes shared state itself.

/**
 * One day cell in a month grid. It receives the array of ranges
 * covering this day (0, 1, or — on a travel day — 2):
 *   - 0 → empty day: white / weekend tint / live drag preview;
 *   - 1 → painted with that range's color, label on every day;
 *   - 2 → TRAVEL DAY: split into a top half (the trip you're
 *         leaving) and a bottom half (the trip you're arriving at).
 * Empty days start a drag (onStartDrag); occupied days/halves open
 * the matching range for editing (onEditRange).
 */
export default function DayCell({ day, ranges, isSelected, isSelectionStart, isSelectionEnd, onStartDrag, onEditRange, onMouseEnter }) {
  const { iso, dayNumber, inMonth, isWeekend, holiday } = day;
  const isTravelDay = ranges.length === 2;

  // The little red holiday dot + the day number, shared by every
  // layout below. Kept in one place so the three branches agree.
  const holidayDot = holiday && (
    <span
      data-testid="holiday-marker"
      className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500"
    />
  );

  // Travel day: two stacked, independently-clickable halves.
  if (isTravelDay) {
    // One trip ENDS here (the half you're leaving), the other STARTS
    // here (the half you're arriving at). Derive each by its boundary.
    const leaving = ranges.find((r) => r.end === iso) || ranges[0];
    const arriving = ranges.find((r) => r.start === iso) || ranges[1];

    // A reusable half. onMouseDown edits ITS range. The top half is
    // padded left so its label clears the floating day number.
    const Half = ({ range, testid, padForNumber }) => (
      <div
        data-testid={testid}
        onMouseDown={(e) => { e.preventDefault(); onEditRange(range); }}
        className={`${range.color} text-gray-800 h-1/2 px-1 flex items-center overflow-hidden ${padForNumber ? "pl-6" : ""}`}
      >
        <span className="text-[10px] font-semibold leading-none truncate w-full">
          {range.label}
        </span>
      </div>
    );

    const wrapperClasses = "relative h-14 border border-gray-100 cursor-pointer select-none";

    return (
      <div
        data-date={iso}
        data-testid="travel-day"
        className={wrapperClasses}
        title={`${leaving.label} → ${arriving.label}`}
        onMouseEnter={() => onMouseEnter(iso)}
      >
        <Half range={leaving} testid="travel-leaving" padForNumber />
        <Half range={arriving} testid="travel-arriving" />
        {/* Day number floats in the top-left over the leaving half. */}
        <span className="absolute top-0.5 left-1 text-sm text-gray-800">{dayNumber}</span>
        {holidayDot}
      </div>
    );
  }

  // Empty day or single range.
  const range = ranges[0] || null;
  // Cursor signals what a click does: occupied days edit (pointer),
  // free days start a selection (cell — the spreadsheet "select"
  // cursor). The right one is added per-branch below.
  const classes = ["relative h-14 p-1 text-sm border border-gray-100",
                   "select-none transition-colors"];

  if (range) {
    // Saved range: paint with its pastel background class. All the
    // pastels are light, so dark text is always readable on them.
    classes.push(range.color, "text-gray-800", "cursor-pointer");
    // Round the outer corners so each range reads as one "pill" per row.
    if (iso === range.start) classes.push("rounded-l-lg");
    if (iso === range.end) classes.push("rounded-r-lg");
    // If the live drag is reaching onto this existing day (it will
    // become the shared travel day), ring it so the user can see it's
    // included — without hiding the trip that's already here.
    if (isSelected) classes.push("ring-2 ring-inset ring-blue-500");
  } else if (isSelected) {
    // Live preview while dragging — a strong blue that forms one
    // continuous pill (rounded only at the selection's two ends).
    classes.push("cursor-cell bg-blue-300 ring-2 ring-inset ring-blue-500 text-blue-900");
    if (isSelectionStart) classes.push("rounded-l-lg");
    if (isSelectionEnd) classes.push("rounded-r-lg");
  } else if (isWeekend) {
    classes.push("cursor-cell bg-gray-50 hover:bg-blue-50");
  } else {
    classes.push("cursor-cell bg-white hover:bg-blue-50");
  }

  if (!inMonth && !range) classes.push("text-gray-400"); // dim filler days

  return (
    <div
      data-date={iso}
      className={classes.join(" ")}
      title={range ? range.label : ""}
      onMouseDown={(e) => {
        e.preventDefault(); // stop the browser from text-selecting while we drag
        // Begin a selection anchored here — on a free day OR on an
        // existing trip's day (so you can drag outward from a trip's
        // edge to start an overlapping range). Whether this turns into
        // an edit (plain click) or a new range (a drag) is decided on
        // mouseup; see handleMouseUp.
        onStartDrag(iso);
      }}
      onMouseEnter={() => onMouseEnter(iso)}
    >
      <span className={holiday && !range ? "font-bold text-red-600" : ""}>
        {dayNumber}
      </span>
      {holidayDot}
      {range && (
        <div data-testid="range-label" className="text-xs font-semibold truncate">
          {range.label}
        </div>
      )}
    </div>
  );
}
