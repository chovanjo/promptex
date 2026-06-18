# Price & area filters

All range filters use a `_from` / `_to` parameter pair; either bound may be omitted.

## Price (Cena) — `price_from` / `price_to`
- **Type:** range, **CZK**. Applies to all categories & types.
- For rentals the value is the monthly rent; for sales the purchase price.
```
/estates/search?category_main_cb=1&category_type_cb=1&price_from=1000000&price_to=5000000
```

## Price per m² (Cena za m²) — `price_m2_from` / `price_m2_to`
- **Type:** range, **CZK/m²**.
- **Applies to:** Land (pozemky) and Commercial (komerční).
```
/estates/search?category_main_cb=3&category_type_cb=1&price_m2_to=1000
```

## Usable floor area (Užitná plocha) — `usable_area_from` / `usable_area_to`
- **Type:** range, **m²**.
- **Applies to:** Apartments, Houses, Commercial.
```
/estates/search?category_main_cb=1&category_type_cb=1&usable_area_from=50&usable_area_to=80
```

## Land / plot area (Plocha pozemku) — `estate_area_from` / `estate_area_to`
- **Type:** range, **m²**.
- **Applies to:** Houses and Land.
```
/estates/search?category_main_cb=2&category_type_cb=1&estate_area_from=500
```

## Price histogram (supporting endpoint)
To present a price slider, call:
```
GET /api/v1/estates/filter_page/histogram?category_main_cb=1&category_type_cb=1
→ { "result": { "histogram": [ { "advert_count": 9, "price_from": 269000, "price_to": 515885 }, ... ] } }
```
The histogram reflects whatever other filters you also pass.

> Per-area accessory ranges (balcony/terrace/garden/cellar/garage/loggia area) also exist —
> see [05-features.md](./05-features.md).
