/* =================================================================
   SECTION 1 — CONSTANTS
   Fixed configuration values live in one module so they are easy to
   find and change. Naming convention: UPPER_SNAKE_CASE.
   ================================================================= */

/** The year this planner is built for. */
export const YEAR = 2026;

/** The two months we display: July (7) and August (8).
    We use human-friendly 1-based month numbers everywhere and only
    convert to JavaScript's 0-based months inside the date helpers.

    `extraWeeksBefore` shows that many additional full weeks BEFORE
    the month's own first week — July gets one, so the planner also
    covers Jun 22–28 (holidays often start in late June).

    `hideAfter` / `hideBefore` blank out the filler cells in the
    Jul 27 – Aug 2 week where the two cards would otherwise show
    the SAME dates twice: July hides Aug 1–2, August hides
    Jul 27–31. Every real date appears in exactly one grid. */
export const MONTHS = [
  { month: 7, name: "July", extraWeeksBefore: 1, hideAfter: "2026-07-31" },
  { month: 8, name: "August", extraWeeksBefore: 0, hideBefore: "2026-08-01" },
];

/** Column headers — the week starts on Monday (European convention). */
export const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Czech public holidays that fall inside the displayed date window
    (Jun 29 – Sep 6, 2026). Keyed by ISO date for O(1) lookup. */
export const CZ_HOLIDAYS = {
  "2026-07-05": "Saints Cyril and Methodius Day",
  "2026-07-06": "Jan Hus Day",
};

/** Suggested labels shown as a dropdown on the label input.
    These are just suggestions — the user can still type anything. */
export const PRESET_LABELS = ["Dekýš", "Praha", "Tábor", "Nemšová", "Grécko"];

/** The 9 pastel colors offered in the dialog — Tailwind's light
    200-shade background classes. We store the CLASS NAME (not a
    hex value) in state and in exported JSON, so every color in the
    app is styled by Tailwind alone, with no inline CSS. All 200
    shades are light, so dark text is always readable on them.

    NOTE: these are full literal class strings, which is what lets
    Tailwind's build-time scanner discover and emit them even though
    they are applied dynamically (via `range.color`). */
export const PRESET_COLORS = [
  { cls: "bg-red-200", name: "Red" },
  { cls: "bg-orange-200", name: "Orange" },
  { cls: "bg-yellow-200", name: "Yellow" },
  { cls: "bg-lime-200", name: "Lime" },
  { cls: "bg-green-200", name: "Green" },
  { cls: "bg-teal-200", name: "Teal" },
  { cls: "bg-blue-200", name: "Blue" },
  { cls: "bg-violet-200", name: "Violet" },
  { cls: "bg-pink-200", name: "Pink" },
];

/** Color a brand-new range starts with (pastel blue). */
export const DEFAULT_COLOR = "bg-blue-200";
