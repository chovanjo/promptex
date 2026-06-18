# sreality.cz skills

Four Claude Code skills that let any assistant use the public sreality.cz property API. They are
**project skills** (they live in this repo), so they are available when working under this project
and are invoked as `/sreality-<name>` (or auto-invoked by Claude when a request matches the
skill's `description`).

| Skill | Use it when… | Bundled CLI |
|---|---|---|
| `sreality-search` | the user wants to find properties to buy/rent | `search.mjs` |
| `sreality-filters` | the user asks what they can filter by / which codes exist | `filters.mjs` |
| `sreality-listing` | the user pastes a listing link or wants one listing's details | `listing.mjs` |
| `sreality-locality` | you need the id(s) for a place name | `locality.mjs` |

## How they fit together
Every skill is a thin command-line program. The real API logic lives in **one** shared library,
[`scripts/sreality-api.mjs`](../../scripts/sreality-api.mjs) (search, suggest, getListing,
filterPage, buildDetailUrl, …). Each skill's `.mjs` imports that library by a path relative to its
own file, so the commands work from any folder. **If the API changes, fix the shared library and
all four skills are fixed at once** (see [`docs/maintenance.md`](../../docs/maintenance.md)).

## Running a CLI directly
You can run any skill's script yourself, which is also how they are tested:
```bash
node .claude/skills/sreality-search/search.mjs --help
node .claude/skills/sreality-search/search.mjs --category byty --type prodej --place "Brno" --price-max 5000000
```
Add `--json` to any of them for machine-readable output. They need only Node 18+ (built-in
`fetch`), no API key and no extra packages.

## Good to know
- All output is **live** — result counts change constantly, so never treat a total as exact.
- A place name can match several places; use `sreality-locality` to pick the right one first.
- The API has surprising quirks (multi-value filters must be comma-joined, detail URLs need real
  slugs, …). They are recorded in [`docs/bug-log.md`](../../docs/bug-log.md) — read it before
  changing the shared library.
