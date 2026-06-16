// In a CDN/Babel setup these hooks were destructured from a global
// `React` object; with Vite we import them directly from the package.
import { useState, useMemo, useEffect, useLayoutEffect, useRef, useCallback } from "react";

import { MONTH_NAMES, DEFAULT_COLOR } from "./constants.js";
import { toISO, addDays, normalizeRange, overlapKind, formatShort } from "./dateUtils.js";
import { validateRangesSchema } from "./importSchema.js";
import { useHolidays } from "./useHolidays.js";

import MonthCard from "./components/MonthCard.jsx";
import RangeDialog from "./components/RangeDialog.jsx";
import Toast from "./components/Toast.jsx";
import SelectionBadge from "./components/SelectionBadge.jsx";
import HolidayLegend from "./components/HolidayLegend.jsx";

/**
 * The main <App /> component: the single "owner" of all shared state.
 * Keeping state in one place ("lifting state up") means every part of the
 * UI always shows the same data.
 */
export default function App() {
  // State:
  //   ranges:    the saved holiday ranges (the app's core data)
  //   year:      which year the calendar shows (defaults to this year)
  //   selection: { anchor, hover } while a drag is in progress, else null
  //   dialog:    config of the open dialog, else null
  //   toast:     { message, type } for the notification, else null
  const [ranges, setRanges] = useState([]);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [selection, setSelection] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState(null);

  // Czech public holidays for the selected year (fetched + cached, with a
  // load status surfaced in the header).
  const { holidays, status: holidayStatus } = useHolidays(year);

  // Derived data:
  // A Map from ISO day → the ranges covering it, rebuilt only when
  // `ranges` changes (useMemo). Most days have one range; a "travel
  // day" (one trip ends where the next begins) has two. Storing an
  // ARRAY per day keeps that case uniform. O(1) lookups while
  // rendering ~80 cells, instead of scanning `ranges` per cell.
  const dayToRanges = useMemo(() => {
    const map = new Map();
    for (const range of ranges) {
      let cursor = new Date(range.start);
      const last = new Date(range.end);
      while (cursor <= last) {
        const iso = toISO(cursor);
        if (!map.has(iso)) map.set(iso, []);
        map.get(iso).push(range);
        cursor = addDays(cursor, 1);
      }
    }
    return map;
  }, [ranges]);

  // The days covered by the in-progress drag, as a Set for O(1)
  // "is this day selected?" checks in DayCell.
  const selectionSet = useMemo(() => {
    const set = new Set();
    if (selection) {
      const [start, end] = normalizeRange(selection.anchor, selection.hover);
      let cursor = new Date(start);
      const last = new Date(end);
      while (cursor <= last) {
        set.add(toISO(cursor));
        cursor = addDays(cursor, 1);
      }
    }
    return set;
  }, [selection]);

  // The drag's normalized [start, end] (or null), used to round the
  // preview's two ends and to fill the live selection badge.
  const selectionBounds = useMemo(() => {
    if (!selection) return null;
    const [start, end] = normalizeRange(selection.anchor, selection.hover);
    return { start, end };
  }, [selection]);

  // Toast helper. Wrapped in useCallback so the function identity is
  // stable and can safely be used inside effects/handlers.
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  // Auto-dismiss the toast 2.5s after it appears. Returning a
  // cleanup function cancels the timer if a new toast replaces the
  // old one early — otherwise the old timer would hide the new toast.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Range CRUD helpers

  /**
   * Decide whether a brand-new range [start, end] may be created.
   * Returns null if it's fine, otherwise an error message.
   * Rules:
   *   - a "full" overlap (2+ shared days) with any range → rejected;
   *   - a "boundary" overlap (1 shared day) is allowed — that's a
   *     travel day — UNLESS it would put a THIRD range on that day
   *     (a day can hold at most two trips: one leaving, one arriving).
   */
  function validateNewRange(start, end) {
    for (const r of ranges) {
      if (overlapKind(start, end, r.start, r.end) === "full") {
        return `Overlaps "${r.label}" - ranges cannot overlap.`;
      }
    }
    // Count how many existing ranges already touch each boundary day
    // of the candidate; with the candidate itself that must stay ≤ 2.
    for (const day of [start, end]) {
      const alreadyThere = dayToRanges.get(day)?.length || 0;
      if (alreadyThere >= 2) {
        return "A day can hold at most two trips.";
      }
    }
    return null;
  }

  function deleteRange(id) {
    // Functional update (prev => …) always works on the latest
    // state, even if several updates happen in the same tick.
    setRanges((prev) => prev.filter((r) => r.id !== id));
  }

  // Drag-selection logic. The interaction is a tiny state machine:
  //   idle → (mousedown on any day) → pressing
  //   pressing → (mouseenter) → extend preview (now a drag)
  //   pressing → (mouseup, no move) → edit the trip / make a 1-day range
  //   pressing → (mouseup, moved) → open create dialog OR reject overlap
  //   any → (Escape) → back to idle

  /** Begin a selection anchored at `iso`. Works on free days AND on
      an existing trip's days, so you can drag outward from a trip's
      edge to start an overlapping (travel-day) range. A press that
      doesn't move is treated as a click on mouseup (see below). */
  function handleStartDrag(iso) {
    if (dialog) return; // ignore clicks while a dialog is open
    setSelection({ anchor: iso, hover: iso });
  }

  /** Open a saved range for editing. On a travel day the user clicks
      the specific half (leaving/arriving), so the right range opens. */
  function handleEditRange(range) {
    if (dialog) return;
    setDialog({ mode: "edit", range });
  }

  function handleDayMouseEnter(iso) {
    // Only extend the preview while a drag is actually in progress.
    // Functional update keeps `anchor` and replaces only `hover`.
    setSelection((prev) => (prev ? { ...prev, hover: iso } : prev));
  }

  // Finishing the drag must work even when the mouse button is
  // released OUTSIDE a day cell (e.g. over the page background),
  // so we listen on `document`, not on the cells.
  //
  // The effect re-subscribes whenever `selection` changes, so the
  // handler always sees the current selection — and the returned
  // cleanup removes the old listener first (no duplicates, no leaks).
  //
  // Why useLayoutEffect and not useEffect? useEffect runs *after*
  // the browser paints, so on a very fast click the mouseup could
  // fire before we subscribe and the selection would never be
  // finalized. useLayoutEffect runs synchronously right after the
  // mousedown re-render, closing that gap.
  useLayoutEffect(() => {
    // Subscribe only during an actual drag. Once the dialog opens we
    // keep `selection` for the preview, but the drag itself is over —
    // without the `dialog` check, releasing the mouse inside the
    // dialog would re-trigger this handler and re-open the dialog.
    if (!selection || dialog) return;

    function handleMouseUp() {
      const [start, end] = normalizeRange(selection.anchor, selection.hover);
      // A press that never moved to another day is a *click*, not a
      // drag: on an existing trip it opens that trip for editing; on
      // a free day it falls through to create a one-day range.
      if (start === end) {
        const here = dayToRanges.get(start) || [];
        if (here.length === 1) {
          setDialog({ mode: "edit", range: here[0] });
          setSelection(null);
          return;
        }
      }
      const error = validateNewRange(start, end);
      if (error) {
        showToast(error, "error");
        setSelection(null);
      } else {
        // Keep `selection` set so the preview stays highlighted
        // behind the dialog; it is cleared when the dialog closes.
        setDialog({ mode: "create", range: { start, end } });
      }
    }

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [selection, dialog, ranges]); // `ranges` too: validateNewRange reads it

  // Escape cancels an in-progress drag (the dialog handles its own
  // Escape key itself).
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") setSelection(null);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Dialog callbacks

  function closeDialog() {
    setDialog(null);
    setSelection(null); // also clears the drag preview
  }

  /** Persist the dialog result: append a new range (create) or update the matched one (edit). */
  function handleDialogSave({ label, color }) {
    if (dialog.mode === "create") {
      const { start, end } = dialog.range;
      const newRange = {
        // crypto.randomUUID() generates a unique id — using array
        // indexes as ids breaks when items are deleted or reordered.
        id: crypto.randomUUID(),
        start,
        end,
        label,
        color,
      };
      setRanges((prev) => [...prev, newRange]);
    } else {
      // Edit mode: replace the matching range with an updated copy.
      // We map to a NEW array with a NEW object — React detects
      // changes by comparing references, so mutating in place
      // would not trigger a re-render.
      setRanges((prev) =>
        prev.map((r) => (r.id === dialog.range.id ? { ...r, label, color } : r))
      );
    }
    closeDialog();
  }

  function handleDialogDelete() {
    deleteRange(dialog.range.id);
    closeDialog();
  }

  // Export / Import / Clear

  /** Download the current ranges as a JSON file. Standard browser
      trick: wrap the text in a Blob, point a temporary <a download>
      at it, click it programmatically, then free the URL. */
  function handleExport() {
    const json = JSON.stringify({ ranges }, null, 2); // `2` = pretty-print
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "holidays.json"; // the whole plan (all years)
    link.click();
    URL.revokeObjectURL(url); // release the memory the Blob URL holds
  }

  /** Validate imported data before trusting it. Never assume a
      user-supplied file has the right shape — check everything and
      reject with a clear message if anything is off. */
  function validateImportedRanges(data) {
    // Structure (shape, types, date format, colour pattern) is checked
    // against a JSON Schema; see src/importSchema.js.
    const schemaError = validateRangesSchema(data);
    if (schemaError) return schemaError;

    // The rest are domain rules a schema can't express. With the schema
    // passed, every start/end is a real YYYY-MM-DD date.
    for (const r of data.ranges) {
      if (r.start > r.end) return `Range "${r.label}" ends before it starts.`;
    }
    // Reject true (multi-day) overlaps — a single shared boundary
    // day is allowed because that's a travel day.
    for (let i = 0; i < data.ranges.length; i++) {
      for (let j = i + 1; j < data.ranges.length; j++) {
        const a = data.ranges[i], b = data.ranges[j];
        if (overlapKind(a.start, a.end, b.start, b.end) === "full") {
          return `Ranges "${a.label}" and "${b.label}" overlap.`;
        }
      }
    }
    // No day may hold more than two trips (one leaving, one arriving).
    const perDay = {};
    for (const r of data.ranges) {
      let cursor = new Date(r.start);
      const last = new Date(r.end);
      while (cursor <= last) {
        const iso = toISO(cursor);
        perDay[iso] = (perDay[iso] || 0) + 1;
        if (perDay[iso] > 2) return `More than two trips share ${formatShort(iso)}.`;
        cursor = addDays(cursor, 1);
      }
    }
    return null; // null = valid
  }

  /** Read the chosen JSON file, validate it, then replace all ranges — or toast an error and keep the current plan. */
  function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    // FileReader reads the chosen file in the browser — the file
    // never leaves the user's computer.
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const error = validateImportedRanges(data);
        if (error) {
          showToast(`Import failed: ${error}`, "error");
          return; // keep the current state untouched
        }
        // Regenerate ids so imported ranges can't collide with
        // existing ids from a previous session.
        setRanges(data.ranges.map((r) => ({ ...r, id: crypto.randomUUID() })));
        showToast(`Imported ${data.ranges.length} range(s).`);
      } catch {
        showToast("Import failed: not a valid JSON file.", "error");
      }
    };
    reader.readAsText(file);
    // Reset the input so choosing the SAME file again still fires
    // the change event next time.
    event.target.value = "";
  }

  function handleClearAll() {
    // window.confirm is a simple built-in guard for destructive
    // actions — fine for a small app like this one.
    if (window.confirm("Remove all ranges?")) {
      setRanges([]);
      showToast("All ranges cleared.");
    }
  }

  // Render. A hidden <input type="file"> does the real file picking; the
  // visible Import button just forwards its click to it (file inputs are
  // hard to style, this is the standard workaround).
  const importInputRef = useRef(null);

  return (
    <div className="p-6">
      {/* Header with title, year switcher, and toolbar */}
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Title + year switcher together on the left. */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Holiday Planner</h1>
          {/* Year switcher: step the whole 12-month calendar a year at a time. */}
          <div className="flex items-center gap-1">
          <button type="button" data-testid="year-prev" aria-label="Previous year"
            onClick={() => setYear((y) => y - 1)}
            className="bg-white border border-gray-300 hover:bg-gray-50 rounded-lg w-9 h-9 inline-flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={2} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span data-testid="year-display" className="text-xl font-bold tabular-nums w-16 text-center">{year}</span>
          <button type="button" data-testid="year-next" aria-label="Next year"
            onClick={() => setYear((y) => y + 1)}
            className="bg-white border border-gray-300 hover:bg-gray-50 rounded-lg w-9 h-9 inline-flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={2} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="button" data-testid="export-btn" onClick={handleExport}
            className="bg-white border border-gray-300 hover:bg-gray-50 rounded-lg px-4 py-2 text-sm font-medium">
            Export JSON
          </button>
          <button type="button" data-testid="import-btn" onClick={() => importInputRef.current.click()}
            className="bg-white border border-gray-300 hover:bg-gray-50 rounded-lg px-4 py-2 text-sm font-medium">
            Import JSON
          </button>
          <input ref={importInputRef} data-testid="import-input" type="file"
            accept=".json,application/json" onChange={handleImportFile} className="hidden" />
          <button type="button" data-testid="clear-btn" onClick={handleClearAll}
            className="bg-white border border-gray-300 hover:bg-red-50 text-red-600 rounded-lg px-4 py-2 text-sm font-medium">
            Clear all
          </button>
        </div>
      </header>

      {/* The full year: one card per month, like a wall calendar. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {MONTH_NAMES.map((name, i) => (
          <MonthCard
            key={name}
            name={name}
            year={year}
            month={i + 1}
            dayToRanges={dayToRanges}
            holidays={holidays}
            selectionSet={selectionSet}
            selectionBounds={selectionBounds}
            onStartDrag={handleStartDrag}
            onEditRange={handleEditRange}
            onDayMouseEnter={handleDayMouseEnter}
          />
        ))}
      </div>

      {/* The selected year's public holidays + loader status. */}
      <HolidayLegend holidays={holidays} status={holidayStatus} />

      {/* A short how-to, below the calendar. */}
      <section data-testid="usage-guide" className="bg-white rounded-xl shadow p-4 text-sm text-gray-600">
        <h2 className="font-semibold text-gray-800 mb-2">How to use</h2>
        <ul className="space-y-1">
          <li><strong>Add a trip:</strong> drag across days (or click a single day), then type a label, pick a colour, and Save.</li>
          <li><strong>Edit or delete:</strong> click a trip to change its label or colour, or remove it with Delete.</li>
          <li><strong>Travel day:</strong> drag a new trip onto another trip's first or last day - that shared day splits in two (leaving / arriving).</li>
          <li><strong>Change year:</strong> use the ‹ › arrows by the year.</li>
          <li><strong>Save or share:</strong> Export / Import JSON; Clear all starts over.</li>
        </ul>
      </section>

      {/* Overlays (rendered only when needed) */}
      {dialog && (
        <RangeDialog
          mode={dialog.mode}
          start={dialog.range.start}
          end={dialog.range.end}
          initialLabel={dialog.mode === "edit" ? dialog.range.label : ""}
          initialColor={dialog.mode === "edit" ? dialog.range.color : DEFAULT_COLOR}
          onSave={handleDialogSave}
          onDelete={handleDialogDelete}
          onCancel={closeDialog}
        />
      )}
      <Toast toast={toast} />
      <SelectionBadge bounds={selectionBounds} />
    </div>
  );
}
