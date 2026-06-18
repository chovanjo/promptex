---
name: sreality-search
description: Search Czech real estate on sreality.cz — apartments, houses, land, commercial — for sale or rent, by location, price, size, layout and features. Use when the user wants to find/search/look for properties to buy or rent in Czechia (e.g. "find 3+kk flats for sale in Brno under 6M", "houses to rent near Praha with a garden").
allowed-tools: Bash(node *)
---

# sreality-search

## What it does
Searches the public sreality.cz API and prints matching listings with their price, and a
**working link** to each listing's web page. It resolves a place name automatically, maps layout
words like "4+kk" to the right codes, and handles price/area ranges and on/off features.

## How to run
```bash
node ${CLAUDE_SKILL_DIR}/search.mjs --category byty --type prodej --place "Brno" --price-max 5000000
node ${CLAUDE_SKILL_DIR}/search.mjs --category byty --type prodej --disposition "4+kk,5+kk" \
     --place "V Dolině" --radius 1 --price-min 5000000 --area-min 80
node ${CLAUDE_SKILL_DIR}/search.mjs --category domy --type pronajem --place "Praha" --garden --json
```
Run with `--help` to see every option.

## Turning a request into options (cheatsheet)
- **Kind** → `--category byty|domy|pozemky|komercni|ostatni` (apartments/houses/land/commercial/other).
- **Buy or rent** → `--type prodej|pronajem` (also `drazby` auctions, `podily` shares).
- **Where** → `--place "<name>"`; add `--radius <km>` for "near".
- **Layout** → `--disposition "4+kk,5+kk"` (apartments) or `--rooms <n>` (houses). "and bigger"
  means list each larger size, e.g. `--disposition "4+kk,4+1,5+kk,5+1,6 a více"`.
- **Price** → `--price-min` / `--price-max` (CZK). **Size** → `--area-min` / `--area-max` (m²).
- **Features** → `--balcony --terrace --lift --garage --parking --cellar --garden --furnished`.
- Use `--json` when you need to process the results; `--limit <n>` to show more/fewer.

## Notes
- Results are LIVE; the total count changes as listings come and go — never treat it as exact.
- A place name can match several spots (e.g. multiple "V Dolině" streets). If it matters, first
  run the **sreality-locality** skill to pick the right one, then pass its ids.
- All the API logic is shared in `scripts/sreality-api.mjs`; this skill only maps words to options.
