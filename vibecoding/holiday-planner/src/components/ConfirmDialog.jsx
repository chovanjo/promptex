import { useEffect, useRef } from "react";

/**
 * A small confirmation modal used instead of the native `window.confirm`.
 * Mirrors RangeDialog's overlay UX: dimmed backdrop (clicking it cancels),
 * a message, and Cancel / Confirm buttons. The Confirm button is focused on
 * open, so Enter activates it; Escape cancels.
 */
export default function ConfirmDialog({ message, confirmLabel = "Confirm", onConfirm, onCancel }) {
  const confirmRef = useRef(null);
  useEffect(() => { confirmRef.current.focus(); }, []);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
    >
      <div data-testid="confirm-dialog" className="bg-white rounded-xl shadow-xl p-6 w-80">
        <p className="text-gray-800 mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            data-testid="confirm-cancel"
            onClick={onCancel}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            ref={confirmRef}
            data-testid="confirm-accept"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-4 py-2"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
