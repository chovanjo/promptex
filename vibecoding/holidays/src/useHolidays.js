import { useState, useEffect, useRef } from "react";

/** Czech public holidays for one year, from the free, keyless Nager.Date API. */
const apiUrl = (year) => `https://date.nager.at/api/v3/PublicHolidays/${year}/CZ`;

/**
 * Fetch Czech public holidays for `year`.
 * Returns `{ holidays, status }`:
 *   - holidays: Map(ISO date → Czech localName) for the year (empty until loaded
 *               and on error),
 *   - status:   "loading" | "ok" | "error".
 *
 * Results are cached per year, so revisiting a year is instant and offline. A
 * failed/unknown year degrades gracefully to an empty map + "error" — the rest
 * of the planner keeps working.
 */
export function useHolidays(year) {
  const [holidays, setHolidays] = useState(() => new Map());
  const [status, setStatus] = useState("loading");
  const cache = useRef(new Map()); // year → Map(iso → localName)

  useEffect(() => {
    // Serve from cache when we've already loaded this year.
    if (cache.current.has(year)) {
      setHolidays(cache.current.get(year));
      setStatus("ok");
      return;
    }

    // `cancelled` stops a slow response from a previous year clobbering a newer
    // one (the user can click through years faster than the network replies).
    let cancelled = false;
    setStatus("loading");
    setHolidays(new Map());

    fetch(apiUrl(year))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const map = new Map(data.map((h) => [h.date, h.localName]));
        cache.current.set(year, map);
        if (!cancelled) {
          setHolidays(map);
          setStatus("ok");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHolidays(new Map());
          setStatus("error");
        }
      });

    return () => { cancelled = true; };
  }, [year]);

  return { holidays, status };
}
