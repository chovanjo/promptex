// Fixed configuration values for the planner. Naming convention:
// UPPER_SNAKE_CASE.

/** The 12 month names, indexed 0 (January) … 11 (December). The app
    renders one card per month; the human-friendly 1-based month number
    is the array index + 1 (we only convert to JavaScript's 0-based
    months inside the date helpers). */
export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Column headers — the week starts on Monday (European convention). */
export const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Suggested labels shown as a dropdown on the label input.
    These are just suggestions — the user can still type anything. */
export const PRESET_LABELS = ["Dekýš", "Praha", "Nemšová", "Grécko"];

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
