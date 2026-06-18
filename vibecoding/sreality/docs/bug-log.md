# Bug log & API gotchas

A running record of bugs we found in the **API behaviour, our scripts, or our tests** — and how
we fixed them. The point is simple: the sreality.cz API has surprising quirks, and writing each
one down means the next person (or assistant) does not have to rediscover it the hard way.

**House rule:** whenever you find and fix a bug here, add an entry below. Keep it short and use the
template. Newest first.

```
### YYYY-MM-DD — <short title>
- Area: API behaviour | script | test
- Symptom: what went wrong, in plain English
- Root cause: why it happened
- Fix: which file(s) changed
- Guardrail: the test/assertion that now prevents it coming back (or "none — be careful")
```

---

## Bugs found & fixed

### 2026-06-17 — Multiple dispositions only applied the first one
- **Area:** script + test (how we sent the request)
- **Symptom:** Searching for several layouts at once (e.g. "4+kk and bigger") quietly returned
  results for only the **first** layout. Worse, narrowing a filter sometimes returned **fewer**
  results than it should, with no error.
- **Root cause:** We sent multi-value filters by **repeating** the parameter
  (`category_sub_cb=6&category_sub_cb=7`). This API keeps only the **first** value when a
  parameter is repeated. The correct form is **comma-joined** in one parameter
  (`category_sub_cb=6,7`). (A pipe, `6|7`, makes the server return HTTP 500.)
- **Fix:** `buildQuery()` in [`scripts/sreality-api.mjs`](../scripts/sreality-api.mjs) and
  `toQueryString()` in [`tests/support/api-client.ts`](../tests/support/api-client.ts) now
  comma-join arrays. Documented in [`docs/api.md`](./api.md) ("How filters map to query params").
- **Guardrail:** [`tests/estates/filters.spec.ts`](../tests/estates/filters.spec.ts) — the
  "multi-value enum (several dispositions) is the sum of each single value" test. Because a flat
  has exactly one disposition, the choices are disjoint, so `count([4,5,6])` must equal
  `count(4)+count(5)+count(6)`. The old repeated-parameter bug fails this immediately.

### 2026-06-17 — Detail-page URL was wrong (404 on placeholder slugs)
- **Area:** script (building a listing's web URL)
- **Symptom:** Links to listing pages all 404'd. We had built them like
  `/detail/prodej/byt/x/x/<hash_id>` with placeholder parts.
- **Root cause:** The website's detail route **requires the real slug parts** (type, category,
  disposition, and `city-citypart-street`); they are not decorative. A wrong slug returns 404.
- **Fix:** `buildDetailUrl()` builds the URL from the result's real fields — in
  [`scripts/sreality-api.mjs`](../scripts/sreality-api.mjs),
  [`tests/support/detail-url.ts`](../tests/support/detail-url.ts), and
  [`examples/run.mjs`](../examples/run.mjs). Rule documented in [`docs/api.md`](./api.md) §7.
- **Guardrail:** [`tests/estates/detail.spec.ts`](../tests/estates/detail.spec.ts) checks the
  built URL has the documented 6-part shape and that the id in it points to a real listing
  (verified via the API, not the website — see gotchas below).

---

## Gotchas (not bugs in our code, but easy traps)

These are quirks of the API/website that have already bitten us. Keep them in mind when adding
code or tests.

- **`baseURL` needs a trailing slash; request paths must NOT start with `/`.** In the Playwright
  config, `baseURL` is `https://www.sreality.cz/api/v1/` and tests call `estates/search` (no
  leading slash). A leading slash would drop the `/api/v1` part and hit the wrong address.
- **Trust the JSON API, not the website, for "does this exist?".** The public website is a
  single-page app that can serve a "not found" page with HTTP **200** (a soft-404) and can get
  into redirect loops. For pass/fail, use `GET /api/v1/estates/{hash_id}` (honest 200 / 404).
- **Never assert exact result counts.** Listings appear and disappear constantly. Tests check
  *relative* behaviour (e.g. "adding a filter makes the count smaller"), never an exact total.
- **Search results wrap category fields as `{ name, value }`.** To get the number code from a
  search result, read `.value` (e.g. `category_main_cb.value`).
- **Filters can be context-specific.** Some only exist for certain categories/types (e.g.
  `furnished` and `ready_date` are rentals only). The live source of truth is
  `GET /estates/filter_page?category_main_cb=&category_type_cb=`.
