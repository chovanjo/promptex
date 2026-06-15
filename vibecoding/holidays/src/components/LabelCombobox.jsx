import { useState, useEffect, useRef } from "react";
import { stripDiacritics } from "../dateUtils.js";

/**
 * A "combobox": a text input combined with a styled dropdown of
 * suggestions. Unlike a native <select>, the user can still type
 * any custom text — and unlike a native <datalist>, we fully
 * control how the dropdown looks (it is just a styled <ul>).
 *
 * The text value lives in the parent (RangeDialog) — this is a
 * "controlled component": we receive `value` and report every
 * change through `onChange`. Only UI state nobody else cares
 * about (panel open/closed, which row is highlighted) stays local.
 */
export default function LabelCombobox({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1); // -1 = no row highlighted
  // Filtering only makes sense WHILE the user is typing. When the
  // panel is reopened over an already-selected value (click,
  // chevron, edit mode), all options must show — otherwise picking
  // "Praha" would forever filter the list down to just "Praha".
  const [typedSinceOpen, setTypedSinceOpen] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  /** Open the panel showing the FULL list (no filter yet). */
  function openUnfiltered() {
    setOpen(true);
    setTypedSinceOpen(false);
    setHighlighted(-1);
  }

  // Focus the input as soon as the dialog opens, so the user can
  // type immediately. (Programmatic focus does NOT open the panel —
  // it opens on click, typing, ArrowDown or the chevron.)
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  // While typing, show only the options matching the text (case-
  // and accent-insensitive); when nothing matches, the panel
  // disappears. When the panel was merely (re)opened — not typed
  // into — show the complete list regardless of the current value.
  const query = stripDiacritics(value.trim().toLowerCase());
  const visibleOptions = typedSinceOpen
    ? options.filter((option) => stripDiacritics(option.toLowerCase()).includes(query))
    : options;
  const panelVisible = open && visibleOptions.length > 0;

  // Pressing the mouse anywhere outside the combobox (Save button,
  // dialog background, …) closes the panel.
  useEffect(() => {
    function handleOutsideMouseDown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideMouseDown);
    return () => document.removeEventListener("mousedown", handleOutsideMouseDown);
  }, []);

  /** Put the chosen option into the input and close the panel. */
  function pick(option) {
    onChange(option);
    setOpen(false);
    setTypedSinceOpen(false); // next open shows the full list again
    setHighlighted(-1);
    inputRef.current.focus(); // typing must stay possible after picking
  }

  /** Keyboard support. When the panel "consumes" a key we call
      stopPropagation so the same keypress doesn't ALSO reach the
      dialog (Enter would save it, Escape would cancel it). */
  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault(); // don't move the text cursor
      if (!open) {
        openUnfiltered(); // closed panel: ArrowDown opens the full list
      }
      setHighlighted((prev) => Math.min(prev + 1, visibleOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && panelVisible && highlighted >= 0) {
      e.stopPropagation(); // pick the row, do NOT save the dialog yet
      pick(visibleOptions[highlighted]);
    } else if (e.key === "Escape" && panelVisible) {
      e.stopPropagation(); // close the panel, do NOT cancel the dialog
      setOpen(false);
    }
  }

  return (
    // `relative` wrapper + `absolute` panel = the standard CSS
    // pattern for dropdowns: the panel is positioned against the
    // wrapper and floats over whatever comes below (z-10).
    <div ref={wrapperRef} className="relative mb-4" onKeyDown={handleKeyDown}>
      <input
        id="range-label-input"
        data-testid="label-input"
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setTypedSinceOpen(true); // typing → filter the list
          setHighlighted(-1);
        }}
        onClick={openUnfiltered}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      {/* Chevron that toggles the panel by hand. */}
      <button
        type="button"
        data-testid="label-dropdown-toggle"
        aria-label="Show suggestions"
        onMouseDown={(e) => e.preventDefault()} // don't steal focus from the input
        onClick={() => (open ? setOpen(false) : openUnfiltered())}
        className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 text-xs"
      >
        ▼
      </button>

      {panelVisible && (
        <ul
          data-testid="label-options"
          className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-auto py-1"
        >
          {visibleOptions.map((option, index) => (
            <li
              key={option}
              data-testid="label-option"
              /* onMouseDown (not onClick) so picking the row wins
                 over the outside-mousedown handler and input blur. */
              onMouseDown={(e) => { e.preventDefault(); pick(option); }}
              onMouseEnter={() => setHighlighted(index)}
              className={"px-3 py-2 cursor-pointer text-sm " +
                (index === highlighted ? "bg-blue-100" : "hover:bg-blue-50")}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
