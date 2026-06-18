# Assignment: Map every sreality.cz property-search filter to its API call

> **This README is a goal brief for a Claude Code agent.** Execute it as a task.
> The end product is a complete, machine-usable map of the sreality.cz property-search
> system so that *any* assistant can search for properties programmatically.

---

## ✅ Status: completed (2026-06-17) — deliverables produced

This assignment has been executed and verified live against the current sreality.cz API.

| Deliverable | Location |
|---|---|
| API reference (endpoints, auth, paging) | [`docs/api.md`](docs/api.md) |
| Per-group filter docs (EN + Czech, code↔label) | [`docs/filters/`](docs/filters/) |
| Machine-readable filter → API-param schema (46 filters) | [`schema/filters.json`](schema/filters.json) |
| Runnable + verified example requests | [`examples/`](examples/) |
| Playwright e2e API tests (drift guard) | [`tests/`](tests/) |
| Reusable Claude Code skills (search / filters / listing / locality) | [`.claude/skills/`](.claude/skills/) |
| Shared API library used by the skills | [`scripts/sreality-api.mjs`](scripts/sreality-api.mjs) |
| Maintenance runbook (update docs+tests when API changes) | [`docs/maintenance.md`](docs/maintenance.md) |
| Bug log & API gotchas (every fixed bug recorded) | [`docs/bug-log.md`](docs/bug-log.md) |

## Testing

```bash
npm install      # no browser download needed — API tests use Playwright's APIRequestContext
npm test         # run the e2e suite against the LIVE sreality.cz API
```

The suite ([`tests/`](tests/)) covers all 7 endpoints, asserts each filter type actually
constrains results, builds & validates detail-page URLs, and — most importantly — runs a
**drift guard** (`tests/schema/codebooks-drift.spec.ts`) that cross-checks `schema/filters.json`
against the live `filter_page` codebooks. When the API changes, the suite fails and tells you
what moved.

> **Keep docs and tests in sync.** Whenever the live API changes, update
> `schema/filters.json`, the `docs/` pages, and the affected spec **together** — the step-by-step
> loop is in [`docs/maintenance.md`](docs/maintenance.md). Assertions are deliberately tolerant
> (structure & relative behaviour, never exact result counts).
>
> **Found a bug** in the API, a script, or a test? Fix it **and** record it in
> [`docs/bug-log.md`](docs/bug-log.md) (symptom → root cause → fix → guardrail), so nobody has to
> rediscover it.

## Skills (use the API from any assistant)

Four Claude Code skills in [`.claude/skills/`](.claude/skills/) wrap the API so an assistant can
act on it directly. Each is a small Node CLI; all of them share one library,
[`scripts/sreality-api.mjs`](scripts/sreality-api.mjs).

| Skill | Use it when… |
|---|---|
| `sreality-search` | find properties to buy/rent by place, price, size, layout, features |
| `sreality-filters` | ask what you can filter by / which value codes exist |
| `sreality-listing` | summarise one listing from its id or pasted detail URL |
| `sreality-locality` | turn a place name into the ids a search needs |

```bash
# examples (also runnable by hand)
node .claude/skills/sreality-search/search.mjs --category byty --type prodej --place "Brno" --price-max 5000000
node .claude/skills/sreality-listing/listing.mjs 1986822220
```

See [`.claude/skills/README.md`](.claude/skills/README.md) for the full overview. Because every
skill delegates to the shared library, **an API/URL change only needs fixing in
`scripts/sreality-api.mjs`** and all four skills follow.

**Key findings (verified):**
- **Base URL:** `https://www.sreality.cz/api/v1` (public, no auth).
- **Search:** `GET /estates/search?<params>` → `{ pagination:{total}, results:[…] }`.
- **Enumeration / source of truth for all codes:** `GET /estates/filter_page?category_main_cb=&category_type_cb=`
  returns the applicable filters and every enum `id→name` per category & type.
- **Supporting endpoints:** `/estates/filter_page/histogram` (price), `/estates/search/clusters`
  (map bbox), `/localities/suggest` (place autocomplete → entity id), `/localities/geometries`.
- The filter's `id_name` from `filter_page` **is** the live `/estates/search` query parameter
  (confirmed by toggling filters and watching `pagination.total`).

> The sections below are the original assignment brief, kept for reference.

---

## Goal (one line)

Document **every** property-search filter available on sreality.cz and identify the
**exact API call(s) and parameter(s)** behind each one, then express the result as both
human-readable Markdown and a machine-readable JSON schema.

## Background

[sreality.cz](https://www.sreality.cz) is the largest Czech real-estate portal (Seznam.cz).
Its web frontend is backed by a **public JSON API**, conventionally reached at:

- `https://www.sreality.cz/api/...` (same-origin proxy used by the site)
- `https://api.sreality.cz/...` (the underlying API host)

When a user picks filters in the UI, the site issues XHR/`fetch` requests to a search
endpoint (around `/cs/v2/estates`) and to several supporting/codebook endpoints. Most filter
values are **integer codes**, not free text. Known/typical parameters include — verify all of
these, do not trust them blindly:

- `category_main_cb` — category (apartments / houses / land / commercial / other)
- `category_type_cb` — transaction type (sale / rent / auction)
- `category_sub_cb` — sub-category / disposition (e.g. 1+kk, 2+1, …)
- `locality_region_id`, `locality_district_id`, `locality_municipality_id` — location codes
- `czk_price_from`, `czk_price_to` — price range
- `usable_area_from/to`, `estate_area_from/to` — area ranges
- `building_type`, `ownership`, `floor_number`, `furnished`, `building_condition`,
  `energy_efficiency_rating_cb` — advanced attributes
- `per_page`, `page`, `sort`, `tms` — paging / sorting / cache-busting

The frontend also resolves human input via **codebook / enumeration endpoints** (the `*_cb`
value lists) and a **locality lookup/whisperer** endpoint. Discovering and documenting these
is part of the task — without them the codes can't be translated to/from human labels.

## Scope — cover everything

| Dimension | Must include |
|---|---|
| Transaction type | Sale (prodej), Rent (pronájem), Auction (dražby) |
| Category | Apartments (byty), Houses (domy), Land (pozemky), Commercial (komerční), Other (ostatní) |
| Filters | All of them — see below |

Filters to cover (every filter visible on the site, including category-specific advanced ones):

- **Location** — region / district / municipality / city part / street, and radius/map-area search
- **Price** — range; for rent note charges/commission flags; for auction note auction-specific fields
- **Disposition** — 1+kk, 1+1, 2+kk … atypical (apartments); house types; etc.
- **Area** — usable area, floor area, land/plot area (per category)
- **Building** — type (brick/panel/wood/…), condition (new/good/before reconstruction/…), ownership (personal/cooperative/state)
- **Layout details** — floor number, number of floors, has lift, basement, balcony/terrace/loggia, garden, parking/garage
- **Furnishing & equipment** — furnished / partly / unfurnished, and equipment flags
- **Energy** — energy efficiency rating (A–G)
- **Other** — listings with photos/video/3D, new builds, price drop, date added, seller type
- **Sorting & paging** — all sort options, `per_page`, pagination

> If the site exposes a filter not listed above, **include it anyway**. The list is a floor,
> not a ceiling.

## Required deliverables (create these in this repo)

1. **`docs/api.md`** — the API reference:
   - Base URL(s), the search endpoint, full request/response shape, headers, paging, sorting.
   - The codebook/enumeration endpoints and the locality lookup endpoint, with how to call them.
   - Any auth, rate-limit, or `User-Agent`/header requirements observed.

2. **`docs/filters/`** — one Markdown page per filter group. For **each** filter document:
   - UI label in **English (Czech in parentheses)**.
   - The API parameter name.
   - Type (range / enum / boolean / id) and accepted values — for enums, the full
     **code ↔ label** table.
   - Which categories / transaction types it applies to.
   - At least one concrete example value.

3. **`schema/filters.json`** — machine-readable mapping an assistant can build queries from:
   ```jsonc
   {
     "<filter_key>": {
       "api_param": "category_main_cb",
       "type": "enum",            // enum | range | boolean | id
       "applies_to": { "category": ["apartments"], "type": ["sale","rent"] },
       "values": [ { "code": 1, "label_en": "Apartments", "label_cs": "Byty" } ],
       "example": 1
     }
   }
   ```
   Range filters use `*_from` / `*_to` param pairs; id filters reference the locality endpoint.

4. **`examples/`** — verified, runnable example requests (curl or HTTP) with trimmed JSON
   responses, proving each **major** filter actually works end to end.

## Method — discover both ways and cross-check

1. **Start from the public API.** Hit the search endpoint and enumerate every `*_cb` codebook
   and the locality lookup endpoint to harvest code ↔ label maps.
2. **Cross-check live.** Open sreality.cz, toggle each filter in the UI, and capture the
   resulting XHR/`fetch` request (network panel) to confirm the real parameter name and value
   codes the frontend sends.
3. **Reconcile.** Where API-derived and UI-derived findings disagree, prefer what the live
   request actually sends, and note the discrepancy.

## Acceptance criteria

- Every filter visible on the site appears in **both** the Markdown docs and `schema/filters.json`.
- Every enumerated filter has a **complete** code ↔ label table.
- Every documented parameter has **at least one working example**.
- From `schema/filters.json` alone, an assistant can construct a valid search request URL for
  any combination of category, transaction type, and filters.

## Constraints & notes

- Use only **public** endpoints; send requests at a **respectful rate**.
- Clearly **mark anything unverified** or inferred rather than confirmed live.
- Keep all written output in **English**, retaining Czech filter labels in parentheses.
