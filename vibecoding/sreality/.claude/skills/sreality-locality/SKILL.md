---
name: sreality-locality
description: Resolve a Czech place name (town, district, region, street) into the sreality.cz locality ids needed to search there. Use when the user names a place to search in, or asks for the region/district/municipality/street id for a place on sreality.
allowed-tools: Bash(node *)
---

# sreality-locality

## What it does
Turns a place name into the exact ids a sreality.cz search needs. It calls the public
autocomplete endpoint (`/localities/suggest`) and returns each match with its `entityType`
(municipality / ward / district / region / street) and id, plus the ready-to-paste
`locality_entity_type=…&locality_entity_id=…` query pair.

This is a small building block — the **sreality-search** skill uses the same lookup internally.

## How to run
```bash
node ${CLAUDE_SKILL_DIR}/locality.mjs "Brno"          # table of matches
node ${CLAUDE_SKILL_DIR}/locality.mjs --json "Praha 4"  # JSON for further processing
```

## Arguments
- `"<place name>"` — the place to look up (required). Quote it if it has spaces.
- `--json` — print machine-readable JSON instead of a readable table.
- `--help` — show usage.

## Notes
- Results come from the live API, so they are always current.
- A name can match several places (e.g. there are several "V Dolině" streets). Pick the one
  whose district/region matches what the user means, then feed its `entityType`/id into a search.
