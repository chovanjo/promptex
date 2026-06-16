# Holiday Planner

A holiday planner showing a **full 12-month calendar** for any year: pick the
year, drag across days to create labelled, colour-coded trips, and mark "travel
days" where one trip ends as the next begins. Built with **Vite** + **React 19**
+ **Tailwind CSS 4** — JSX and Tailwind are compiled ahead of time, so there are
no CDN scripts and nothing is compiled in the browser.

> This file is the project's source of truth for anyone (human or AI assistant)
> picking it up. It describes what the app does, how it's built, and the
> conventions to keep when changing it.

---

## Run it

```bash
npm install                 # React, Vite, Tailwind, ajv, Playwright
npm run dev                 # start the dev server, then open the printed URL
npm run build               # production build into dist/
npm run preview             # serve the production build locally
```

- **Tests** (Playwright, 84 e2e tests). Playwright starts the Vite dev server
  itself, so no separate step is needed:
  ```bash
  npx playwright install chromium   # once
  npm test                          # headless
  npm run test:headed               # watch it drive a real browser
  npm run test:report               # open the HTML report of the last run
  ```

---

## Tech & constraints

- **Vite project, modular source.** App code lives under `src/` (see the Code
  map). `@vitejs/plugin-react` compiles the JSX and `@tailwindcss/vite` builds
  the CSS — no in-browser Babel, no CDN scripts, no internet needed at runtime.
- **React 19** (`react` / `react-dom` from npm; mounted via
  `react-dom/client`).
- **State is in-memory only.** Nothing is saved to `localStorage`/disk; use
  **Export / Import JSON** to persist or share a plan.
- **One plan spans all years.** Trips carry absolute ISO dates; the calendar
  shows the selected year, but every year's trips stay in memory and in the
  export. Export / Import / Clear act on the whole plan.
- **Import is validated.** The file *structure* is checked against a JSON Schema
  (`src/importSchema.js`, via **ajv** + ajv-formats) — shape, types, a real
  `date` format, and the colour pattern. The travel-day domain rules a schema
  can't express (start ≤ end, no multi-day overlap, ≤ 2 trips/day) stay in
  `validateImportedRanges`.
- **Styling is Tailwind classes only — no custom CSS and no inline `style`.**
  Colours are stored as Tailwind classes (e.g. `bg-blue-200`), not hex. Because
  colours are applied dynamically, the preset classes are written out as full
  literal strings in `src/constants.js` so Tailwind's build-time scanner emits
  them.
- **Year is chosen at runtime** (defaults to the current year); no date is
  hardcoded.

---

## Features

**Calendar**
- All **12 months** of the selected year, in a responsive grid (1–4 columns),
  each a standard **Monday-first** month.
- **Year switcher:** `‹ year ›` arrows in the header step the whole calendar a
  year at a time; it opens on the current year.
- Each month is padded with greyed **filler days** from the adjacent months —
  including across year boundaries (January shows late December of the previous
  year; December shows early January of the next). Filler days are inert
  placeholders: they aren't clickable and never hold a trip, so each real date
  has exactly one cell and every trip renders once.
- Weekends get a subtle tint. (No public-holiday markers.)

**Creating & editing trips**
- **Drag** across days to select a range (works **backwards** and **across month
  boundaries**); a **single click** on a free day makes a one-day trip.
- A dialog captures a **label** and **colour**:
  - **Label** is a custom combobox: five place suggestions
    (`Dekýš, Praha, Tábor, Nemšová, Grécko`) **plus free text**; filtering is
    **accent-insensitive** ("ta" → Tábor); arrow-key navigation, Enter to pick,
    Escape closes the dropdown first then the dialog, chevron toggles it.
  - **Colour** is one of **9 pastel swatches** (no custom colour picker).
- **Click a trip** (a day cell, or a travel-day half) to rename, recolour, or
  delete it — the calendar is the only view of planned trips; there is no
  separate list.

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
- **Export / Import JSON** (validated on import; exported as `holidays.json`,
  the whole multi-year plan); **Clear all** (confirmed).

---

## Data model

```js
ranges: [
  { id, start: "2026-07-13", end: "2026-07-17", label: "Praha", color: "bg-blue-200" },
  …
]
```

- `color` is a **Tailwind background class**, not a hex value.
- Dates are **absolute** (full ISO), so a plan can span multiple years; the
  calendar just shows one year at a time.
- A **travel day is not a special record** — it's simply **two ranges that share
  one boundary date** (`A.end === B.start`). Everything about the split is
  derived.
- Derived in `App` via `useMemo`: **`dayToRanges`** — a `Map` from ISO date to
  the 1–2 ranges covering it (this is what `DayCell` renders from).

---

## Code map (`src/`)

```
index.html              Vite entry: <div id="root"> + <script src="/src/main.jsx">
src/
  main.jsx              mounts <App/> via react-dom/client; imports index.css
  index.css             @import "tailwindcss";
  constants.js          configuration values
  dateUtils.js          pure date/string helpers
  importSchema.js       JSON Schema + ajv validator for imported files
  App.jsx               the stateful root component
  components/           one presentational component per file
```

- **`constants.js`:** `MONTH_NAMES` (the 12 month names, index + 1 = month
  number); `WEEKDAY_NAMES`; `PRESET_LABELS`; `PRESET_COLORS` (9 pastels) and
  `DEFAULT_COLOR`.
- **`dateUtils.js` (pure):** `toISO`, `addDays`, `mondayIndex`, `formatShort`,
  `countDays`, `rangesOverlap`, **`overlapKind`** (none / boundary / full — the
  heart of the travel-day rule), `normalizeRange`, **`buildMonthGrid(year, month)`**
  (one month's Monday-first weeks with adjacent-month filler), and
  `stripDiacritics` (accent-insensitive label filtering).
- **`importSchema.js`:** `RANGES_SCHEMA` (the export/import contract) and
  `validateRangesSchema` (ajv-compiled; maps the first error to a friendly
  message). Used by `App.jsx`'s `validateImportedRanges` for the structural part.
- **`components/`:** `LabelCombobox`, `RangeDialog`, `Toast`, `SelectionBadge`,
  `DayCell` (renders filler / empty / single / split-travel days), `MonthCard`
  (one month, takes `year` + `month`). Each file has a default export.
- **`App.jsx`:** owns all state (`ranges`, `year`, `selection`, `dialog`,
  `toast`); renders the 12 `MonthCard`s + year switcher; derives `dayToRanges`,
  `selectionSet`, `selectionBounds`; holds `validateNewRange` (create rules) and
  `validateImportedRanges` (import rules), plus the drag state machine.
- **`main.jsx`:** `createRoot(...).render(<App />)`.

**Interaction model (important):** `mousedown` on **any** day anchors a
selection; whether it becomes an **edit** (a click that didn't move) or a **new
range** (a real drag) is decided on **`mouseup`**. The document-level `mouseup`
listener means a drag can be released anywhere. Travel-day halves edit their own
trip directly on mousedown.

---

## Conventions (please keep)

- **Junior-readable, heavily commented code** — comments explain the *why*
  (date math, the drag state machine, overlap rules, the combobox). Match this
  style in new code. Document the non-obvious; let clear names speak for the rest.
- **One comment style:** `/** … */` for a doc-comment directly above a function,
  component, or constant; `//` for everything else (file/group headers, inline
  notes, rationale). The only `/* … */` blocks left sit between JSX tag
  attributes, where `//` is illegal.
- **Tailwind only** — no custom CSS, no inline `style`. Dynamic colours are
  Tailwind classes; keep the preset list as full literal strings in
  `constants.js` so Tailwind's build-time scanner emits them.
- **Every interactive element has a `data-testid`** — tests rely on these.
- **Keep the Playwright suite green and grow it** — add a test for each new
  behaviour. The suite is the safety net for this codebase.
- **Local git commits per change** (small, descriptive messages).

---

## Testing notes & gotchas

- Tests live under `tests/`, one `*.spec.js` file per feature area, with shared
  helpers (`openApp`, `cell`, `dragSelect`, `createRange`, `expectEmptyCalendar`, …)
  in `tests/helpers.js`. With no separate list, tests assert against the calendar
  itself — a trip's `range-label` on its cells, travel-day testids, and
  `expectEmptyCalendar` for "nothing planned". They navigate to `/` against the Vite dev server, which
  Playwright starts and stops automatically (`webServer` in
  `playwright.config.js`). Run `npm run dev` in another terminal first and it
  will be reused.
- **The app opens on the current year, so tests pin a fixed year for
  determinism:** `openApp` steps the `‹ year ›` switcher to `TEST_YEAR` (2026) via
  the `setYear` helper, so date-specific assertions are stable regardless of the
  real clock. `year-selection.spec.js` covers the switcher itself (default year,
  arrows, grid re-render, cross-year trip persistence, all-years export/clear).
- **Only real days carry `data-date`** (filler days are inert), so
  `[data-date="…"]` resolves to one cell page-wide — handy for assertions.
- **Assert Tailwind class membership, not computed colour** — Tailwind 4 renders
  palette colours as `oklch()`, so `toHaveCSS("background-color", "rgb(...)")`
  is brittle; use `toHaveClass(/bg-blue-200/)` instead.
- **The label dropdown floats over the colour swatches.** After typing a label,
  dismiss the dropdown (click the dialog heading — see the `dismissSuggestions`
  helper) before clicking a colour, or the click is intercepted.
- **Imports require the current format:** colours must be Tailwind classes, so
  JSON exported before the pastel/classes refactor (hex colours) is rejected.
- No internet is required at runtime — all dependencies are bundled by Vite.
