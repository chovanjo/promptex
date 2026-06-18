# Features / accessories & house attributes

These are mostly **boolean** flags — pass `=1` (also accepts `true`) to require the feature.
Each is its own query parameter (verified: `balcony=1` drops the result total as expected).

## Accessories (Příslušenství) — boolean flags
| Parameter | English (Czech) | Typical categories |
|---|---|---|
| `balcony` | Balcony (Balkón) | Apartments |
| `terrace` | Terrace (Terasa) | Apartments |
| `loggia` | Loggia (Lodžie) | Apartments |
| `cellar` | Cellar (Sklep) | Apartments, Houses, Commercial |
| `garage` | Garage (Garáž) | Apartments, Houses, Commercial |
| `parking_lots` | Parking (Parkování) | Apartments, Houses, Commercial |
| `elevator` | Elevator/lift (Výtah) | Apartments |
| `garden` | Garden (Zahrada) | Apartments, Commercial |
| `easy_access` | Barrier-free / accessible (Bezbariérový) | Apartments |

### Per-accessory area ranges
Several accessories also support an **area range** (m²), via `_from` / `_to` pairs found in the
frontend param set:
`balcony_area_from/to`, `terrace_area_from/to`, `loggia_area_from/to`, `cellar_area_from/to`,
`garden_area_from/to`, plus `*_area_cb` size-bucket variants (e.g. `garage_area_cb`,
`parking_lots_area_cb`, `garden_area_cb`). Use the range form, e.g.
`...&terrace_area_from=10`.

## House attributes (Domy) — boolean flags
**Applies to:** Houses (domy).

| Parameter | English (Czech) |
|---|---|
| `low_energy` | Low-energy building (Nízkoenergetický) |
| `single_storey` | Single-storey (Přízemní) |
| `multi_storey` | Multi-storey (Vícepodlažní) |
| `standalone` | Detached / standalone (Samostatný) |
| `block_inline_building` | Terraced / in a block (Řadový) |
| `wooden` | Wooden building (Dřevostavba) |
| `basin` | Pool (Bazén) |

## Notes
- These boolean flags are surfaced under the "Příslušenství" / "Vlastnosti" sections of the UI.
- The exact subset offered depends on category — confirm against
  `GET /api/v1/estates/filter_page?category_main_cb=…&category_type_cb=…`, which lists the
  applicable flags for that category as `id_name` entries without a `values` array.
