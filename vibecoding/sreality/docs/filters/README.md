# Filter documentation index

Each file documents one group of search filters for `GET /api/v1/estates/search`.
For each filter: **English label (Czech)**, the API parameter, type, accepted values
(code ↔ label for enums), and which categories/transaction types it applies to.

The machine-readable equivalent is [`schema/filters.json`](../../schema/filters.json).
The authoritative live source for the enum codes is the `filter_page` endpoint
(see [`../api.md`](../api.md)).

| File | Covers |
|---|---|
| [01-category.md](./01-category.md) | Category, transaction type, sub-category/disposition, room count |
| [02-location.md](./02-location.md) | Country, region, district, entity (municipality/ward/street), radius, POIs |
| [03-price.md](./03-price.md) | Price, price/m², area (usable & land), histogram |
| [04-building.md](./04-building.md) | Condition, building type, ownership, energy rating, floor, furnished, availability |
| [05-features.md](./05-features.md) | Accessories (balcony, garage, lift…), house attributes, pool, accessibility |
| [06-listing-media-sort.md](./06-listing-media-sort.md) | Listing age, media (video/3D/floor plan), keywords, full-text, sorting, paging |

## Category applicability

Codes: `category_main_cb` → 1 Apartments (byty), 2 Houses (domy), 3 Land (pozemky),
4 Commercial (komerční), 5 Other (ostatní). `category_type_cb` → 1 Sale (prodej),
2 Rent (pronájem), 3 Auction (dražby), 4 Co-ownership share (podíly).

Not every filter applies to every category — e.g. dispositions (`category_sub_cb`) differ per
category, `room_count_cb`/`estate_area_*` are for houses & land, `furnished`/`ready_date_*` only
appear for rentals. Each filter below lists its `applies_to`.
