# sreality.cz search API reference

> Verified live on **2026-06-17** against the endpoints the current sreality.cz Next.js
> frontend actually calls. All endpoints below are **public and require no authentication**.

## Base URL

```
https://www.sreality.cz/api/v1
```

The site is a Next.js app; its search UI calls this `/api/v1` surface directly from the
browser. (Note: there is also a private `/api/v1/estates` endpoint — without `/search` — that
returns `401 Unauthorized`; it belongs to the logged-in seller area and is **not** the search
API. Always use `/estates/search`.)

## Endpoints

### 1. Search — the main endpoint
```
GET /api/v1/estates/search
```
Pass any combination of filter parameters (see [`schema/filters.json`](../schema/filters.json)
and the files in [`docs/filters/`](./filters/)) as query-string parameters.

**Response shape:**
```jsonc
{
  "pagination": { "limit": 100, "offset": 0, "total": 19991 },
  "results": [ { /* one estate per item */ } ],
  "meta_title": "Prodej bytu • Sreality.cz",
  "search_title": "Byty na prodej",
  "status_code": 200,
  "status_message": "OK"
}
```
`pagination.total` is the **result count** — useful for validating that a filter is applied
(toggle a filter and watch the total drop).

Minimal example:
```
GET /api/v1/estates/search?category_main_cb=1&category_type_cb=1&per_page=1
→ 19 991 apartments for sale
```

**Paging:** `per_page` (results per page, default 100) and `page` (1-based).

### 2. Codebooks / available filters — the enumeration endpoint
```
GET /api/v1/estates/filter_page?category_main_cb={cat}&category_type_cb={type}
```
**This is the source of truth for every filter and every enum value.** It returns the filters
applicable to the chosen category + transaction type, each as:
```jsonc
{ "id_name": "category_sub_cb", "values": [ { "id": 2, "name": "1+kk" }, ... ] }
```
- Filters **with** a `values` array are enums; `id` is the code you pass, `name` is the Czech label.
- Filters with only `id_name` (no `values`) are free inputs: ranges (`*_from`/`*_to`), booleans,
  numbers, or text.
- The set of returned filters **varies by category** (e.g. `room_count_cb`, `estate_area_*`
  appear for houses; `furnished` and `ready_date_*` appear only for rentals).

Re-fetch this per category/type to stay current — do not hard-code enums that may change.

### 3. Price histogram
```
GET /api/v1/estates/filter_page/histogram?{current filters}
```
Returns price buckets `[{ advert_count, price_from, price_to }, ...]` for the current filter set
(used to draw the price slider).

### 4. Map clusters
```
GET /api/v1/estates/search/clusters?{filters}&lat_min=&lat_max=&lon_min=&lon_max=&zoom=
```
Returns geohash clusters for a map bounding box. **Required:** `lat_min`, `lat_max`, `lon_min`,
`lon_max`. Optional: `zoom`. Each cluster: `{ lat, lon, count, bounding_box, geohashes, final_cluster }`.

### 5. Locality autocomplete (whisperer)
```
GET /api/v1/localities/suggest?phrase={text}
```
Resolves a typed place name into structured localities. Each result's `userData` carries:
```jsonc
{ "entityType": "municipality", "id": 5740, "district_id": 72,
  "latitude": 49.20, "longitude": 16.60, "country_id": 112, ... }
```
Feed `entityType` → `locality_entity_type` and `id` → `locality_entity_id` into `/estates/search`
to search by an exact municipality / ward / street. `entityType` values seen: `municipality`,
`ward`, `district`, `region`, `street`, `country`.

### 6. Locality geometries
```
GET /api/v1/localities/geometries?{...}
```
Returns polygon geometry for localities (used to draw search areas on the map).

### 7. Estate detail
```
GET /api/v1/estates/{hash_id}
```
Full data for a single listing (`{ result: {...}, status_code, status_message }`), including
every attribute (areas, energy cert, utilities, GPS, images, `premise`/seller, price history).
`hash_id` comes from each search result.

**Building the human detail-page URL.** The web detail page is a Next.js catch-all
(`/detail/[...slug]`) and **the slug segments are required — a wrong slug returns 404** (verified):
```
https://www.sreality.cz/detail/{type}/{category}/{disposition}/{city}-{citypart}-{street}/{hash_id}
```
- `{type}` ← `category_type_cb`: 1 `prodej`, 2 `pronajem`, 3 `drazba`, 4 `podil`
- `{category}` ← `category_main_cb` (singular): 1 `byt`, 2 `dum`, 3 `pozemek`, 4 `komercni-prostory`, 5 `ostatni`
- `{disposition}` ← `category_sub_cb` name, slugified (e.g. `4+kk`; `6 a více` → `6-a-vice`)
- locality slug ← `locality.city_seo_name`-`citypart_seo_name`(or `quarter_seo_name`)-`street_seo_name`

In **search** results these `category_*_cb` fields are `{name, value}` objects — use `.value`.
Verified 200: `https://www.sreality.cz/detail/prodej/byt/4+kk/praha-michle-krnkova/1986822220`

## How filters map to query params

The `id_name` returned by `filter_page` **is** the query-string parameter name accepted by
`/estates/search` (verified: `balcony=1`, `room_count_cb=2`, `building_type=2`, etc. all change
the result total as expected). So:

- **Enum** → `param=<code>` (codes from `filter_page`), e.g. `building_type=2` (brick).
- **Range** → `param_from=` / `param_to=`, e.g. `usable_area_from=50&usable_area_to=80`.
- **Boolean** → `param=1`, e.g. `balcony=1` (also accepts `true`).
- **Locality id** → `locality_region_id=`, `locality_district_id=`, or the
  `locality_entity_type` + `locality_entity_id` pair (+ optional `locality_radius` in km).
- **Multi-value** enums (e.g. several dispositions) → **comma-join** the values into one
  parameter: `category_sub_cb=4,5,6` (a true OR). **Do not repeat** the parameter
  (`category_sub_cb=4&category_sub_cb=5`) — the API silently keeps only the **first** value and
  ignores the rest, giving a wrong result with no error. A pipe (`4|5`) returns HTTP 500.
  (Verified live 2026-06-17.)

## Automated tests

Every endpoint and rule on this page is exercised by the Playwright e2e suite in
[`../tests/`](../tests/) (run with `npm test`). If the live API changes, that suite fails and
points at what moved — follow [`maintenance.md`](./maintenance.md) to update the docs, schema,
and tests together.

## Etiquette & notes

- Send requests at a **respectful rate**; set a real `User-Agent`.
- Enum codes are **stable but authoritative only from `filter_page`** — prefer fetching them
  over trusting a cached copy.
- Everything in this folder was confirmed by live calls; anything inferred is flagged inline.
