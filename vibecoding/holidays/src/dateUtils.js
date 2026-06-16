// Small *pure* date/string helpers (same input → same output, no side
// effects), so they are easy to test and reason about.
//
// Trick used throughout: days are ISO strings like "2026-07-13". Because
// the parts run year → month → day with fixed widths, plain string
// comparison ("<", ">") sorts dates correctly — no Date math needed.

/** Convert a JavaScript Date to an ISO date string ("2026-07-13").
    We build it manually from the *local* date parts; using
    `date.toISOString()` would convert to UTC and could shift the
    day across midnight depending on the user's timezone. */
export function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0"); // 0-based → 1-based
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Return a new Date that is `days` after `date` (negative = before).
    We never mutate the input — mutation causes subtle bugs. */
export function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Day-of-week index in a Monday-based week: Mon=0 … Sun=6.
    JavaScript's `getDay()` is Sunday-based (Sun=0 … Sat=6), so we
    shift it with `(getDay() + 6) % 7`. */
export function mondayIndex(date) {
  return (date.getDay() + 6) % 7;
}

/** Format an ISO date for humans, e.g. "2026-07-13" → "Jul 13". */
export function formatShort(iso) {
  const [, m, d] = iso.split("-").map(Number);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[m - 1]} ${d}`;
}

/** Number of days in an inclusive ISO range, e.g. Jul 13–17 → 5. */
export function countDays(startIso, endIso) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((end - start) / MS_PER_DAY) + 1;
}

/** Do two inclusive ranges share at least one day?
    Classic interval-overlap test: they overlap unless one ends
    before the other starts. Works on ISO strings directly. */
export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && bStart <= aEnd;
}

/**
 * Classify how two ranges overlap — used to allow "travel days".
 * The shared part of two inclusive ranges is [maxStart .. minEnd]:
 *   - maxStart >  minEnd → "none"     (they don't touch)
 *   - maxStart === minEnd → "boundary" (share EXACTLY one day, which
 *       is one range's end and the other's start — a travel day)
 *   - maxStart <  minEnd → "full"     (share two or more days — not
 *       allowed: you can't be in two places for a whole day)
 */
export function overlapKind(aStart, aEnd, bStart, bEnd) {
  const maxStart = aStart > bStart ? aStart : bStart;
  const minEnd = aEnd < bEnd ? aEnd : bEnd;
  if (maxStart > minEnd) return "none";
  if (maxStart === minEnd) return "boundary";
  return "full";
}

/** Sort two ISO dates so [start, end] is always in order.
    Lets the user drag backwards (Jul 17 → Jul 13) and still get
    a normal range. */
export function normalizeRange(a, b) {
  return a <= b ? [a, b] : [b, a];
}

/**
 * Build the full calendar grid for one month (a standard, self-contained
 * month view — Monday-first, padded with adjacent-month filler days).
 *
 * Returns an array of weeks; each week is an array of 7 "day" objects:
 *   { iso:        "2026-07-13"  — unique id for the day,
 *     dayNumber:  13            — what to print in the cell,
 *     inMonth:    true          — false for filler days from the
 *                                 previous/next month (rendered dimmed),
 *     isWeekend:  false }
 *
 * Algorithm: start from the 1st of the month, walk back to the nearest
 * Monday, then emit complete weeks until we have passed the last day of
 * the month. This naturally produces the leading/trailing filler days —
 * including across year boundaries (January leads with late December of
 * the previous year; December trails with early January of the next).
 */
export function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const lastOfMonth = new Date(year, month, 0); // day 0 of next month = last day of this one

  // Walk back from the 1st to the Monday that starts its week.
  let cursor = addDays(firstOfMonth, -mondayIndex(firstOfMonth));

  const weeks = [];
  // Keep emitting weeks until the week we just finished contains the
  // last day of the month (i.e. the cursor has moved past it).
  while (cursor <= lastOfMonth) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push({
        iso: toISO(cursor),
        dayNumber: cursor.getDate(),
        inMonth: cursor.getMonth() === month - 1,
        isWeekend: mondayIndex(cursor) >= 5, // Sat (5) or Sun (6)
      });
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/** Strip accents so filtering is diacritics-insensitive: typing
    "ta" should find "Tábor". `normalize("NFD")` splits each
    accented letter into base letter + combining accent mark, and
    the regex removes those marks (Unicode range U+0300–U+036F). */
export function stripDiacritics(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
