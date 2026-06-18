# Tests — how this folder is organised

These are **end-to-end (e2e) tests**: they call the real sreality.cz API over the internet and
check that it behaves the way our docs say. They use [Playwright](https://playwright.dev/)'s
API testing (no browser is opened or downloaded).

Run them from the project root:

```bash
npm install      # one-time
npm test         # run everything
npm run typecheck  # check the TypeScript types only
```

## Folder layout (grouped by domain)

Each folder is one part ("domain") of the API, so you always know where to look:

```
tests/
  support/      Shared helper code (NOT tests). Imported by the spec files.
    constants.ts    Number codes & URL words (e.g. apartments = 1, sale = "prodej").
    schema.ts       Loads schema/filters.json and describes its shape.
    api-client.ts   Tiny wrappers: search(), searchTotal(), filterPage().
    detail-url.ts   buildDetailUrl(): makes a listing's web page URL.

  estates/      Everything about properties themselves.
    search.spec.ts      GET /estates/search returns the right shape.
    filters.spec.ts     Each kind of filter actually narrows the results.
    histogram.spec.ts   GET /estates/filter_page/histogram (price chart data).
    clusters.spec.ts    GET /estates/search/clusters (map groups).
    detail.spec.ts      GET /estates/{hash_id} + building the detail-page URL.

  localities/   Everything about places.
    suggest.spec.ts     GET /localities/suggest (autocomplete) + using it to search.
    geometries.spec.ts  GET /localities/geometries (map shapes).

  schema/       Keeping our docs honest.
    codebooks-drift.spec.ts   Compares schema/filters.json against the live API.
```

Only files ending in `.spec.ts` are run as tests. Everything in `support/` is plain helper code.

## A few rules these tests follow (and why)

- **We never check exact result counts.** Real listings change all the time, so we check
  *relative* things instead (e.g. "adding a filter makes the count smaller").
- **We trust the API, not the website.** The website can show a "page not found" while still
  returning status `200`, so for pass/fail we always ask the JSON API.
- **We never hard-code a listing id.** Ids disappear over time; we always fetch a fresh one
  from search first.
- **The drift test is the important one.** If the API changes, `schema/codebooks-drift.spec.ts`
  fails and tells you to update the docs. See [`../docs/maintenance.md`](../docs/maintenance.md).
