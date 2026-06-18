---
name: sreality-filters
description: List the search filters and their value codes available on sreality.cz for a given property kind and transaction type (dispositions, building types, conditions, energy ratings, features, etc.). Use when the user asks what they can filter by, which options/dispositions/building-types exist, or what code means what (e.g. "what building types can I pick", "which code is brick").
allowed-tools: Bash(node *)
---

# sreality-filters

## What it does
Shows every filter available for a chosen property kind + transaction type, and for dropdown
filters lists each value as `code = label`. It reads the **live** codebook endpoint
(`/estates/filter_page`), so it always reflects the current API.

## How to run
```bash
node ${CLAUDE_SKILL_DIR}/filters.mjs --category byty --type prodej     # readable list
node ${CLAUDE_SKILL_DIR}/filters.mjs --category domy --type pronajem --json
```

## Arguments
- `--category <byty|domy|pozemky|komercni|ostatni>` — property kind (default `byty`).
- `--type <prodej|pronajem|drazby|podily>` — transaction (default `prodej`).
- `--json` — machine-readable output.
- `--help` — usage.

## Notes
- Filters shown with values are dropdowns (send a code). Filters shown as "free input" are number
  ranges (`*_from` / `*_to`), free text, or on/off switches (send `=1`).
- For a stable, English-labelled reference, see the committed `schema/filters.json` and
  `docs/filters/` — this skill is the live cross-check of that snapshot.
- The codes you find here feed straight into the **sreality-search** skill.
