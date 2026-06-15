import { formatShort, countDays } from "../dateUtils.js";

/** A floating badge shown at the top while a drag is in progress,
    telling the user exactly what they're selecting (e.g.
    "Jul 13 – Jul 17 · 5 days"). Mirrors <Toast> but lives at the top
    so it never sits under the cursor. */
export default function SelectionBadge({ bounds }) {
  if (!bounds) return null;
  const days = countDays(bounds.start, bounds.end);
  return (
    <div
      data-testid="selection-badge"
      className="fixed top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50"
    >
      {formatShort(bounds.start)} – {formatShort(bounds.end)} · {days} day{days > 1 ? "s" : ""}
    </div>
  );
}
