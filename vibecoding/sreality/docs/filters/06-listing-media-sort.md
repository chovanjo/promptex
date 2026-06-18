# Listing metadata, media, search text, sorting & paging

## Listing age (Stáří inzerátu) — `advert_age_to`
- **Type:** number — maximum age in **days** since the listing was posted. Applies to all.
- UI presets: Today, Last week, Last month, All. Pass the number of days, e.g.:
```
/estates/search?category_main_cb=1&category_type_cb=1&advert_age_to=1    # today
/estates/search?category_main_cb=1&category_type_cb=1&advert_age_to=7    # last week
/estates/search?category_main_cb=1&category_type_cb=1&advert_age_to=30   # last month
```

## Media flags — boolean
| Parameter | English (Czech) |
|---|---|
| `video` | Has video (Video) |
| `matterport` | Has 3D virtual tour / Matterport (3D prohlídka) |
| `floor_plan` | Has floor plan (Půdorys) |

The frontend also references a combined `contains_cb` flag set (video / 3D tour / floor plan);
the individual boolean params above are the simplest way to require each.

## Full-text in description (Hledat v popisu) — `description_search`
- **Type:** string — free-text matched against the listing description.

## Keyword tags (Klíčová slova) — `keywords`
- **Type:** enum-ish tag list. Known tags (Czech): Ateliér, Bazén, Elektromobil, Klimatizace,
  Penthouse, Recepce, Rekuperace, Sauna, Vana, Výhled
  (Studio, Pool, EV charging, Air-conditioning, Penthouse, Reception, Heat recovery, Sauna,
  Bathtub, View).

## Seller type (Typ prodejce) — `seller_kind`
- **Type:** enum — distinguishes agency vs. private seller (surfaced in the frontend param set).

## Sorting — `image_sort_cb` and the sort control
- The estates list sort (UI "Od nejnovější" / newest first) is controlled by the sorter; the
  default is newest-first.
- **`image_sort_cb`** reorders the **photos** of each result by room type:

| Code | Room |
|---|---|
| 0 | Default |
| 1 | Living area |
| 4 | Bedroom |
| 5 | Kitchen |
| 6 | Bathroom |
| 19 | Garden |
| 22 | Floor plan 2D/3D |
| 28 | House exterior |

## Paging
- `per_page` — results per page (default 100).
- `page` — 1-based page index.
- `pagination.total` in the response is the total match count.
