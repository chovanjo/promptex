# Maintenance runbook

This project documents a **third-party API we don't control** (sreality.cz). When that API
changes, the docs, the schema, and the e2e tests must change **together**. The test suite is
designed to make drift loud: a failing run is the signal that the live API moved.

## Where each fact lives (single source per fact)

| Fact | Source of truth | Verified by |
|---|---|---|
| Endpoints, paths, request/response shapes | [`docs/api.md`](./api.md) | `tests/estates/*.spec.ts`, `tests/localities/*.spec.ts` |
| Filter → API param + enum code↔label | [`schema/filters.json`](../schema/filters.json) | `tests/schema/codebooks-drift.spec.ts` |
| Per-group human filter docs | [`docs/filters/`](./filters/) | (kept in sync with the schema) |
| Detail-page URL construction | [`docs/api.md`](./api.md) §7 + `tests/support/detail-url.ts` | `tests/estates/detail.spec.ts` |
| Runnable examples | [`examples/`](../examples/) | `npm run examples` |
| Test layout & conventions | [`tests/README.md`](../tests/README.md) | — |
| Shared API library (used by all skills) | [`scripts/sreality-api.mjs`](../scripts/sreality-api.mjs) | run a skill CLI |
| Claude Code skills | [`.claude/skills/`](../.claude/skills/) | run each `*.mjs` (see that folder's README) |
| Bug log & API gotchas | [`docs/bug-log.md`](./bug-log.md) | — |

The **live `GET /estates/filter_page`** endpoint is the upstream source of truth for every
filter and enum. The schema is our committed snapshot of it; the drift test compares the two.

## The update loop (when something changes)

1. **Run the suite:** `npm test`.
2. **Read the failure** — each assertion names what moved and points back here:
   - `codebooks (filter_page) › dropdown '<x>' …` → an enum value/label changed or was removed.
   - `codebooks (filter_page) › documented filters still exist live …` → a filter param disappeared.
   - console warning `[drift] live API offers filters not in schema…` → a **new** filter exists
     upstream (soft signal, doesn't fail the build).
   - `estates: … / localities: … › …` → an endpoint's path/shape/status changed.
   - `estates: single listing detail › …` → the detail URL rule or `/estates/{hash_id}` behaviour changed.
3. **Re-harvest the codebooks** to see the new truth:
   ```bash
   curl -s 'https://www.sreality.cz/api/v1/estates/filter_page?category_main_cb=1&category_type_cb=1' | less
   # repeat for category_main_cb=2..5 (and category_type_cb=2 for rent-only filters)
   ```
   (curl shown for portability; `node examples/run.mjs` is the in-repo equivalent for searches.)
4. **Update the affected artifact(s):**
   - enum/code change → edit `schema/filters.json` **and** the matching table in `docs/filters/*`.
   - new/removed filter → add/remove it in both, plus a row in the relevant `docs/filters/*`.
   - endpoint change → update `docs/api.md` and the endpoint test.
   - URL-rule change → update `buildDetailUrl` in `tests/support/detail-url.ts` **and** the copy
     in `examples/run.mjs` **and** `scripts/sreality-api.mjs` **and** `docs/api.md` §7.
   - endpoint/call change used by skills → update `scripts/sreality-api.mjs` (all four skills in
     `.claude/skills/` share it, so fixing it there fixes every skill at once).
5. **Re-run `npm test`** until green. Green means docs == live API again. If you touched the
   shared library, also re-run a skill CLI (e.g. `node .claude/skills/sreality-search/search.mjs
   --category byty --type prodej --place "Brno" --limit 1`) to confirm the skills still work.
6. **Found and fixed a bug?** Add a dated entry to [`docs/bug-log.md`](./bug-log.md)
   (symptom → root cause → fix → guardrail). This applies to any bug in the API behaviour, our
   scripts, or our tests — log it so the next person doesn't rediscover it.

## Conventions that keep the tests stable

- **No exact result counts** in assertions — inventory drifts hourly. Assert structure and
  *relative* behaviour (`filtered <= baseline`, `> 0`).
- **Resolve ids/hashes at runtime** (from search/suggest); never hard-code a `hash_id` — it rots.
- **The API is the oracle, not the HTML.** The website is a Next.js SPA that can serve
  soft-404s (HTTP 200) and redirect loops; use `/api/v1/...` for pass/fail signals.
- **Drift = subset check.** Documented values must still exist live; brand-new live values are
  reported (warning), not failed — so harmless upstream additions don't block CI, but removals
  and renames do.

## Running

```bash
npm install        # no browser download needed (API tests use APIRequestContext)
npm test           # run the e2e suite against the live API
npm run test:report  # open the last HTML report
npm run examples   # run the documented example searches
```
