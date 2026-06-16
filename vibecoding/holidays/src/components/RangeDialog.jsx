import { useState } from "react";
import { formatShort, countDays } from "../dateUtils.js";
import { PRESET_LABELS, PRESET_COLORS } from "../constants.js";
import LabelCombobox from "./LabelCombobox.jsx";

/**
 * The dialog for naming and coloring a range.
 * Used in two modes:
 *   - "create": after the user finishes a drag selection
 *   - "edit":   after clicking an existing range (adds a Delete button)
 *
 * It keeps its own *local* state for the form fields and only
 * reports the final result via onSave / onDelete / onCancel.
 * Local state for form inputs is a common React pattern: the rest
 * of the app does not care about every keystroke.
 */
export default function RangeDialog({ mode, start, end, initialLabel, initialColor, onSave, onDelete, onCancel }) {
  const [label, setLabel] = useState(initialLabel);
  const [color, setColor] = useState(initialColor);

  /** Save on Enter, cancel on Escape — small keyboard niceties.
      (The combobox consumes these keys first when its dropdown is
      open, so they only reach this handler when it is closed.) */
  function handleKeyDown(e) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onCancel();
  }

  function handleSave() {
    // `trim()` so a label of only spaces doesn't count; fall back
    // to a default name instead of blocking the save.
    onSave({ label: label.trim() || "Holiday", color });
  }

  return (
    // Fixed overlay that dims the page; clicking it cancels.
    // `e.target === e.currentTarget` makes sure we only cancel when
    // the dim background itself was clicked — not the white card
    // (clicks inside the card "bubble" up to this handler too).
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div data-testid="range-dialog" className="bg-white rounded-xl shadow-xl p-6 w-80" onKeyDown={handleKeyDown}>
        {/* The range itself is the heading — its dates in bold, with the
            day count. (Create vs edit is conveyed by the Delete button.) */}
        <h3 className="font-bold text-lg mb-4">
          {formatShort(start)} – {formatShort(end)} · {countDays(start, end)} day{countDays(start, end) > 1 ? "s" : ""}
        </h3>

        {/* Label: a combobox — suggestions in a styled dropdown,
            free custom text still allowed. */}
        <label className="block text-sm font-medium mb-1" htmlFor="range-label-input">Label</label>
        <LabelCombobox
          value={label}
          onChange={setLabel}
          options={PRESET_LABELS}
          placeholder="Choose or type a label…"
        />

        {/* Color picker: the 9 pastel presets, nothing else. */}
        <span className="block text-sm font-medium mb-1">Color</span>
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.cls}
              type="button"
              data-testid={`color-${preset.name.toLowerCase()}`}
              title={preset.name}
              onClick={() => setColor(preset.cls)}
              /* The swatch itself is colored by the same Tailwind
                 class the range will use; the currently selected
                 one gets a dark ring. */
              className={`${preset.cls} w-7 h-7 rounded-full border border-gray-200 transition-transform hover:scale-110 ` +
                (color === preset.cls ? "ring-2 ring-offset-2 ring-gray-700" : "")}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            data-testid="save-btn"
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2"
          >
            Save
          </button>
          {mode === "edit" && (
            <button
              type="button"
              data-testid="delete-btn"
              onClick={onDelete}
              className="bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg px-4 py-2"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            data-testid="cancel-btn"
            onClick={onCancel}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
