/** A small notification that appears at the bottom of the screen
    (e.g. "Ranges cannot overlap") and disappears by itself —
    the auto-dismiss timer lives in App. */
export default function Toast({ toast }) {
  if (!toast) return null;
  const colorClass = toast.type === "error" ? "bg-red-600" : "bg-gray-800";
  return (
    <div
      data-testid="toast"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 ${colorClass} text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50`}
    >
      {toast.message}
    </div>
  );
}
