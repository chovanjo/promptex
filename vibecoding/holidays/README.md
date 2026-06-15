# Holiday Planner 2026

A single-file holiday planner for **July & August 2026**: drag across days to
create labelled, colour-coded trips, and mark "travel days" where one trip
ends as the next begins. Built as one `index.html` with **React 18** +
**Tailwind CSS 4** + **Babel Standalone**, all from CDN — **no build step**.

> This file is the project's source of truth for anyone (human or AI assistant)
> picking it up. It describes what the app does, how it's built, and the
> conventions to keep when changing it.

---

## Run it

- **App:** open `index.html` in any modern browser. That's all.
- **Internet is required** — React, Tailwind and Babel load from CDNs at runtime
  (also true when running the tests).
- **Tests** (Playwright, 74 e2e tests):
  ```bash
  npm install                 # installs @playwright/test
  npx playwright install chromium
  npm test                    # headless
  npm run test:headed         # watch it drive a real browser
  npm run test:report         # open the HTML report of the last run
  ```

---

## Tech & constraints

- **One file:** all app code lives in `index.html` inside a
  `<script type="text/babel">` block (Babel compiles the JSX in the browser).
- **React 18 UMD** (`React`, `ReactDOM` globals) — *not* React 19 (which dropped
  the UMD builds the CDN approach needs).
- **State is in-memory only.** Nothing is saved to `localStorage`/disk; use
  **Export / Import JSON** to persist or share a plan.
- **Styling is Tailwind classes only — no custom CSS and no inline `style`.**
  Colours are stored as Tailwind classes (e.g. `bg-blue-200`), not hex.
- **Dates are hardcoded to 2026** (`YEAR` constant).

---

## Features

**Calendar**
- July and August 2026 side by side, **Monday-first** weeks.
- July also shows an **extra week of June** (from Mon **Jun 22**); August shows
  September filler to complete its last week.
- The shared **Jul/Aug boundary week is de-duplicated**: each real date appears
  in exactly one card; the other card shows blank placeholder cells.
- Weekends get a subtle tint; **Czech public holidays** (Jul 5 — Saints Cyril &
  Methodius, Jul 6 — Jan Hus) get a red dot, listed in a legend below the grids.

**Creating & editing trips**
- **Drag** across days to select a range (works **backwards** and **across the
  two months**); a **single click** on a free day makes a one-day trip.
- A dialog captures a **label** and **colour**:
  - **Label** is a custom combobox: five place suggestions
    (`Dekýš, Praha, Tábor, Nemšová, Grécko`) **plus free text**; filtering is
    **accent-insensitive** ("ta" → Tábor); arrow-key navigation, Enter to pick,
    Escape closes the dropdown first then the dialog, chevron toggles it.
  - **Colour** is one of **9 pastel swatches** (no custom colour picker).
- **Click a trip** (or use the list) to rename, recolour, or delete it.

**Travel days** (the headline feature)
- When one trip **ends on the same day** the next trip **begins**, that shared
  day becomes a **travel day**: the cell splits **top = the place you're
  leaving**, **bottom = where you're arriving**, with both labels and an
  "X → Y" tooltip. Clicking a half edits that half's trip.
- Create one by dragging a new trip **onto the start or end day** of an existing
  trip (from a free day, or by pressing the existing trip's edge and dragging
  outward). The shared boundary day is ringed while you drag.
- **Overlap rules:** a multi-day overlap is rejected (toast); a **single shared
  boundary day is allowed**; a day may hold **at most two trips**.

**Feedback & data**
- **Live selection feedback:** free days show the `cell` (select) cursor,
  occupied days the pointer; the in-progress drag is a blue pill with a
  floating "Jul 13 – Jul 17 · 5 days" badge.
- **Export / Import JSON** (validated on import); **Clear all** (confirmed).

---

## Data model

```js
ranges: [
  { id, start: "2026-07-13", end: "2026-07-17", label: "Praha", color: "bg-blue-200" },
  …
]
```

- `color` is a **Tailwind background class**, not a hex value.
- A **travel day is not a special record** — it's simply **two ranges that share
  one boundary date** (`A.end === B.start`). Everything about the split is
  derived.
- Derived in `App` via `useMemo`: **`dayToRanges`** — a `Map` from ISO date to
  the 1–2 ranges covering it (this is what `DayCell` renders from).

---

## Code map (`index.html`)

Organised into commented sections:

- **Section 1 — Constants:** `YEAR`; `MONTHS` (each with `extraWeeksBefore`,
  `hideBefore`/`hideAfter` to drive the extra June week and the de-duplicated
  boundary week); `WEEKDAY_NAMES`; `CZ_HOLIDAYS`; `PRESET_LABELS`;
  `PRESET_COLORS` (9 pastels) and `DEFAULT_COLOR`.
- **Section 2 — Date utils (pure):** `toISO`, `addDays`, `mondayIndex`,
  `formatShort`, `countDays`, `rangesOverlap`, **`overlapKind`** (none / boundary
  / full — the heart of the travel-day rule), `normalizeRange`,
  **`buildMonthGrid`** (builds a month's weeks incl. filler/extra/blank days),
  and `stripDiacritics` (accent-insensitive label filtering).
- **Section 3 — Components:** `LabelCombobox`, `RangeDialog`, `RangeList`,
  `HolidayLegend`, `Toast`, `SelectionBadge`, `DayCell` (renders empty / single /
  split-travel days), `MonthCard`.
- **Section 4 — `App`:** owns all state (`ranges`, `selection`, `dialog`,
  `toast`, `hoveredRangeId`); derives `dayToRanges`, `selectionSet`,
  `selectionBounds`; holds `validateNewRange` (create rules) and
  `validateImportedRanges` (import rules), plus the drag state machine.
- **Section 5 — Mount:** `ReactDOM.createRoot(...).render(<App />)`.

**Interaction model (important):** `mousedown` on **any** day anchors a
selection; whether it becomes an **edit** (a click that didn't move) or a **new
range** (a real drag) is decided on **`mouseup`**. The document-level `mouseup`
listener means a drag can be released anywhere. Travel-day halves edit their own
trip directly on mousedown.

---

## Conventions (please keep)

- **Junior-readable, heavily commented code** — comments explain the *why*
  (date math, the drag state machine, overlap rules, the combobox). Match this
  style in new code.
- **Tailwind only** — no custom CSS, no inline `style`. Dynamic colours are
  Tailwind classes (so the CDN's runtime scanner picks them up).
- **Every interactive element has a `data-testid`** — tests rely on these.
- **Keep the Playwright suite green and grow it** — add a test for each new
  behaviour. The suite is the safety net for this single mutable file.
- **Local git commits per change** (small, descriptive messages).

---

## Testing notes & gotchas

- Tests live in `tests/holidays.spec.js`; Playwright loads the app over a
  `file://` URL (no server needed).
- **Assert Tailwind class membership, not computed colour** — Tailwind 4 renders
  palette colours as `oklch()`, so `toHaveCSS("background-color", "rgb(...)")`
  is brittle; use `toHaveClass(/bg-blue-200/)` instead.
- **The label dropdown floats over the colour swatches.** After typing a label,
  dismiss the dropdown (click the dialog heading — see the `dismissSuggestions`
  helper) before clicking a colour, or the click is intercepted.
- **Imports require the current format:** colours must be Tailwind classes, so
  JSON exported before the pastel/classes refactor (hex colours) is rejected.
- Needs **internet** for the CDN scripts during test runs.
