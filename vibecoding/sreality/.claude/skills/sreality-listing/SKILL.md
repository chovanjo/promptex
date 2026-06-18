---
name: sreality-listing
description: Show a clean summary of a single sreality.cz listing (price, layout, size, building type and condition, energy rating, ownership, address, map) from its id or detail URL. Use when the user pastes a sreality.cz listing link or asks for the details of a specific property/listing.
allowed-tools: Bash(node *)
---

# sreality-listing

## What it does
Fetches one listing from the public API (`/estates/{hash_id}`) and prints the key facts in a
short, readable summary, plus the canonical link to its web page.

## How to run
```bash
node ${CLAUDE_SKILL_DIR}/listing.mjs 1986822220
node ${CLAUDE_SKILL_DIR}/listing.mjs "https://www.sreality.cz/detail/prodej/byt/4+kk/praha-michle-krnkova/1986822220"
node ${CLAUDE_SKILL_DIR}/listing.mjs --json 1986822220
```

## Arguments
- `<hash_id>` or `"<detail URL>"` — the listing to show (required). The id is the long number at
  the end of any sreality detail URL; the skill extracts it for you if you pass the whole URL.
- `--json` — print the full raw listing data as JSON.
- `--help` — usage.

## Notes
- A made-up id returns a clear "not found" error (the API answers 404 honestly).
- Get ids from the **sreality-search** skill, or straight from a link the user pastes.
