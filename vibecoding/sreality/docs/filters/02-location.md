# Location filters

Sreality offers three ways to constrain location: by **administrative id** (region/district),
by **resolved entity** (municipality/ward/street, via the suggest endpoint), and by
**points of interest** nearby. All apply to every category & transaction type.

## Country (Země) — `locality_country_id`
- **Type:** id (enum of 248 ISO country ids). Default is Czechia.
- Czechia = **112**. Slovakia = 703, Germany = 276, Austria = 40, Spain = 724, etc.
  (full list available from `filter_page`).

## Region / kraj (Kraj) — `locality_region_id`
- **Type:** id

| Code | Region |
|---|---|
| 10 | Hlavní město Praha |
| 1 | Jihočeský kraj |
| 14 | Jihomoravský kraj |
| 3 | Karlovarský kraj |
| 13 | Kraj Vysočina |
| 6 | Královéhradecký kraj |
| 5 | Liberecký kraj |
| 12 | Moravskoslezský kraj |
| 8 | Olomoucký kraj |
| 7 | Pardubický kraj |
| 2 | Plzeňský kraj |
| 11 | Středočeský kraj |
| 4 | Ústecký kraj |
| 9 | Zlínský kraj |

## District / okres (Okres) — `locality_district_id`
- **Type:** id (86 districts). Examples: 72 Brno-město, 65 Ostrava-město, 5001 Praha 1 …
  5010 Praha 10, 56 Praha-východ, 57 Praha-západ. Full list from `filter_page`.

## Exact place via suggest — `locality_entity_type` + `locality_entity_id`
- **Type:** entity pair, resolved through `GET /api/v1/localities/suggest?phrase=<text>`.
- Take `userData.entityType` → `locality_entity_type` and `userData.id` → `locality_entity_id`.
- `entityType` values: `municipality`, `ward`, `district`, `region`, `street`, `country`.

```
# 1. resolve
GET /api/v1/localities/suggest?phrase=Brno
   → results[0].userData = { entityType:"municipality", id:5740, ... }
# 2. search that municipality
GET /api/v1/estates/search?category_main_cb=1&category_type_cb=1
      &locality_entity_type=municipality&locality_entity_id=5740
```

## Radius (Okruh) — `locality_radius`
- **Type:** number (kilometers) around the selected locality/GPS point.
- Example: `...&locality_entity_type=municipality&locality_entity_id=5740&locality_radius=10`
  (within 10 km of Brno).

## Points of interest nearby (Body zájmu) — `pois` + `pois_distance`
- **`pois`** — enum, the amenities that must be near the property:

| Code | English (Czech) |
|---|---|
| 1 | Bus stop (Autobusová zastávka) |
| 2 | Train station (Vlakové nádraží) |
| 3 | Post office (Pošta) |
| 4 | ATM (Bankomat) |
| 5 | GP / doctor (Praktický lékař) |
| 6 | Vet (Veterinář) |
| 7 | Primary school (Základní škola) |
| 8 | Kindergarten (Mateřská škola) |
| 9 | Supermarket |
| 10 | Small shop (Malý obchod) |
| 11 | Restaurant/pub (Restaurace, hospoda) |
| 12 | Playground (Dětské hřiště) |
| 13 | Metro |

- **`pois_distance`** — number (meters) — max distance to the selected POI(s).

## Map bounding-box search — `lat_min`/`lat_max`/`lon_min`/`lon_max`
Used by the map view via `GET /api/v1/estates/search/clusters` (see [api.md](../api.md));
required together with the standard filters and an optional `zoom`.
