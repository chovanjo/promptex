# Verified examples

All requests below hit the **public** endpoint
`GET https://www.sreality.cz/api/v1/estates/search` (no auth) and were run live on
**2026-06-17**. Run them yourself with:

```bash
node examples/run.mjs        # Node 18+ (uses global fetch)
```

## Verified result counts (`pagination.total`)

| Query (`/estates/search?…`) | Total |
|---|---:|
| `category_main_cb=1&category_type_cb=1` (apartments for sale, baseline) | 19,991 |
| `…&category_sub_cb=4` (2+kk) | 4,806 |
| `…&price_to=2000000` (≤ 2,000,000 CZK) | 951 |
| `…&building_type=2` (brick) | 11,180 |
| `…&locality_region_id=10` (Prague) | 4,890 |
| `…&balcony=1` (has balcony) | 8,297 |
| `category_main_cb=1&category_type_cb=2&furnished=1` (furnished, for rent) | 2,740 |
| `category_main_cb=2&category_type_cb=1&category_sub_cb=39` (villas for sale) | 870 |
| `category_main_cb=2&category_type_cb=1&estate_area_from=500` (plot ≥ 500 m²) | 14,095 |
| `category_main_cb=3&category_type_cb=1&category_sub_cb=19&price_m2_to=1000` (building land ≤ 1000 CZK/m²) | 2,316 |
| `category_main_cb=1&category_type_cb=1&advert_age_to=1` (posted today) | 400 |
| Brno municipality via `/localities/suggest` → `locality_entity_type=municipality&locality_entity_id=5740` | 1,230 |

> Counts drift over time as inventory changes — they confirm each filter is applied, not exact values.

## Locality flow (two-step)
```bash
# 1) resolve a place name to an entity
curl -s 'https://www.sreality.cz/api/v1/localities/suggest?phrase=Brno' \
  -H 'User-Agent: example/1.0'
#   → results[0].userData = { entityType: "municipality", id: 5740, ... }

# 2) search within that entity
curl -s 'https://www.sreality.cz/api/v1/estates/search?category_main_cb=1&category_type_cb=1&locality_entity_type=municipality&locality_entity_id=5740&per_page=1' \
  -H 'User-Agent: example/1.0'
```

> `curl` shown for portability; this sandbox used `node examples/run.mjs` (curl not installed).

## Sample response
A trimmed real search response is saved in
[`sample-search-response.json`](./sample-search-response.json). Notable per-result fields:
`hash_id` (listing id), `advert_name`, `locality`, `price` / `price_czk` / `price_czk_m2`,
`category_main_cb` / `category_sub_cb` / `category_type_cb`, `has_video`, `has_matterport_url`,
`advert_images`, and `poi_*_distance` (distance to each point of interest).

### Building the listing detail URL
The detail page is a Next.js catch-all route and **the slug segments are required** — a wrong
slug returns 404 (verified). Construct it from the result fields:

```
https://www.sreality.cz/detail/{type}/{category}/{disposition}/{city}-{citypart}-{street}/{hash_id}
```
- `{type}` ← `category_type_cb.value`: 1→`prodej`, 2→`pronajem`, 3→`drazba`, 4→`podil`
- `{category}` ← `category_main_cb.value` (singular): 1→`byt`, 2→`dum`, 3→`pozemek`,
  4→`komercni-prostory`, 5→`ostatni`
- `{disposition}` ← `category_sub_cb.name`, slugified (e.g. `4+kk`; `6 a více` → `6-a-vice`)
- locality slug ← `locality.city_seo_name` + `citypart_seo_name` (or `quarter_seo_name`) +
  `street_seo_name`, joined with `-`
- `{hash_id}` ← `hash_id`

> In **search** results these category fields are `{name, value}` objects — use `.value`.
> Verified example (HTTP 200):
> `https://www.sreality.cz/detail/prodej/byt/4+kk/praha-michle-krnkova/1986822220`
