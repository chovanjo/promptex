/** A small status dot + visible label for the public-holiday loader:
    amber while loading, green when loaded, red on failure. Lives in the
    holidays legend. */
const STATES = {
  loading: { cls: "bg-amber-400 animate-pulse", text: "Loading…" },
  ok: { cls: "bg-green-500", text: "Loaded" },
  error: { cls: "bg-red-500", text: "Couldn't load" },
};

export default function HolidayStatus({ status }) {
  const { cls, text } = STATES[status] || STATES.loading;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500" role="status">
      <span
        data-testid="holiday-status"
        data-state={status}
        aria-hidden="true"
        className={`inline-block w-2.5 h-2.5 rounded-full ${cls}`}
      />
      <span data-testid="holiday-status-text">{text}</span>
    </span>
  );
}
