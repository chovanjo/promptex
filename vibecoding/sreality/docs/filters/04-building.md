# Building, ownership, energy & availability

## Building condition (Stav objektu) — `building_condition`
- **Type:** enum. **Applies to:** Apartments, Houses, Commercial.

| Code | English | Czech |
|---|---|---|
| 1 | Very good | Velmi dobrý |
| 2 | Good | Dobrý |
| 3 | Poor | Špatný |
| 4 | Under construction | Ve výstavbě |
| 5 | Project | Projekt |
| 6 | New building | Novostavba |
| 7 | For demolition | K demolici |
| 8 | Before reconstruction | Před rekonstrukcí |
| 9 | After reconstruction | Po rekonstrukci |
| 10 | Under reconstruction | V rekonstrukci |

## Building material/type (Stavba) — `building_type`
- **Type:** enum. **Applies to:** Apartments.

| Code | English | Czech |
|---|---|---|
| 1 | Wooden | Dřevostavba |
| 2 | Brick | Cihlová |
| 3 | Stone | Kamenná |
| 4 | Prefab/assembled | Montovaná |
| 5 | Panel | Panelová |
| 6 | Skeleton/frame | Skeletová |
| 7 | Mixed | Smíšená |
| 8 | Modular | Modulární |

> A simplified variant `building_type_simple_cb` (Brick / Panel / Others) also exists in the
> frontend for quick filtering.

## Ownership (Vlastnictví) — `ownership`
- **Type:** enum. **Applies to:** Apartments.

| Code | English | Czech |
|---|---|---|
| 1 | Personal | Osobní |
| 2 | Cooperative | Družstevní |
| 3 | State/municipal | Státní/obecní |

## Energy efficiency rating (Energetická náročnost) — `energy_efficiency_rating_cb`
- **Type:** enum. **Applies to:** Apartments, Houses, Commercial.

| Code | English | Czech |
|---|---|---|
| 1 | A — Extremely economical | Mimořádně úsporná |
| 2 | B — Very economical | Velmi úsporná |
| 3 | C — Economical | Úsporná |
| 4 | D — Less economical | Méně úsporná |
| 5 | E — Uneconomical | Nehospodárná |
| 6 | F — Very uneconomical | Velmi nehospodárná |
| 7 | G — Extremely uneconomical | Mimořádně nehospodárná |

## Floor number (Podlaží) — `floor_number_from` / `floor_number_to`
- **Type:** range (integer floor). **Applies to:** Apartments.

## Furnished (Vybavení) — `furnished`
- **Type:** enum. **Applies to:** rentals (`category_type_cb=2`).

| Code | English | Czech |
|---|---|---|
| 1 | Yes | Ano |
| 2 | No | Ne |
| 3 | Partly | Částečně |

## Available from (Datum nastěhování) — `ready_date_from` / `ready_date_to`
- **Type:** range (date). **Applies to:** rentals. UI also exposes an "immediately" preset.
