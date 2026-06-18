/**
 * THE DRIFT GUARD — the most important test in this project.
 *
 * "Drift" means our written-down docs slowly becoming wrong as the live API changes.
 * This file stops that happening silently. It compares our snapshot (schema/filters.json)
 * against what the LIVE API says today (GET /estates/filter_page), and FAILS if they
 * disagree — with a message telling you to update the docs.
 *
 * The rule we use is "subset": every value WE documented must still exist live.
 *   - If a value we documented disappears or is renamed  -> test FAILS (a real problem).
 *   - If the API adds a brand-new value we don't have yet -> test PASSES, but we print a
 *     friendly warning so someone can add it later.
 * This way harmless additions don't block anyone, but real breaks are caught.
 */
import { test, expect } from '@playwright/test';
import { loadSchema, type EnumValue } from '../support/schema';
import { filterPage } from '../support/api-client';
import { CATEGORY_CODE, TYPE_CODE } from '../support/constants';

// Load our documented snapshot once.
const schema = loadSchema();

// The same hint is added to every failure so a junior knows exactly what to do next.
const FIX = 'API changed — update schema/filters.json + docs/filters/* (and this test), then re-run.';

/**
 * A filter is sometimes only valid for a certain category/type (e.g. "furnished" only for
 * rentals). This picks ONE valid (category, type) pair to ask the API about, as numbers.
 */
function pickContext(applies: { category: string[]; type: string[] }): { cat: number; type: number } {
  const cat = CATEGORY_CODE[applies.category[0]] ?? 1; // first documented category, default apartments
  const typeWord = applies.type.find((t) => TYPE_CODE[t]) ?? 'prodej'; // first type we test, default sale
  return { cat, type: TYPE_CODE[typeWord] ?? 1 };
}

/**
 * Check that every value WE documented still exists in the LIVE value list.
 * `documented` = our values, `live` = what the API returned now, `label` = a name for errors.
 */
function assertDocumentedSubset(documented: EnumValue[], live: EnumValue[] | null, label: string) {
  // The filter must still exist and still be a dropdown (have a value list).
  expect(live, `'${label}' is documented but is gone from the live API. ${FIX}`).toBeTruthy();
  const values = live ?? [];

  // Special case: a few lists (like "keywords") give every value the same code 0, so the
  // code is useless for matching. When codes are not unique, we match on the label instead.
  const codesAreUnique = new Set(values.map((v) => v.code)).size === values.length;
  if (!codesAreUnique) {
    const liveLabels = new Set(values.map((v) => v.label_cs));
    for (const ours of documented) {
      expect(liveLabels.has(ours.label_cs), `'${label}' value "${ours.label_cs}" no longer exists live. ${FIX}`).toBeTruthy();
    }
    return;
  }

  // Normal case: build a lookup of code -> live label, then check each documented value.
  const liveLabelByCode = new Map(values.map((v) => [v.code, v.label_cs]));
  for (const ours of documented) {
    // The code must still be offered by the API.
    expect(liveLabelByCode.has(ours.code), `'${label}' code ${ours.code} (${ours.label_cs}) no longer exists live. ${FIX}`).toBeTruthy();
    // And the label for that code must not have changed.
    if (ours.label_cs) {
      expect(
        liveLabelByCode.get(ours.code),
        `'${label}' code ${ours.code} label changed: "${ours.label_cs}" -> "${liveLabelByCode.get(ours.code)}". ${FIX}`,
      ).toBe(ours.label_cs);
    }
  }
}

// ---------------------------------------------------------------------------------------
// Group 1: basic shape — the filter_page endpoint still returns the core dropdowns we need.
// ---------------------------------------------------------------------------------------
test.describe('codebooks (filter_page)', () => {
  test('still returns the core dropdowns with their first values', async ({ request }) => {
    const cb = await filterPage(request, 1, 1); // apartments for sale

    // Category list still starts with "Byty" (apartments) = code 1.
    expect(cb.category_main_cb).toEqual(expect.arrayContaining([{ code: 1, label_cs: 'Byty' }]));
    // Transaction list still has "Prodej" (sale) = code 1.
    expect(cb.category_type_cb).toEqual(expect.arrayContaining([{ code: 1, label_cs: 'Prodej' }]));
    // Disposition list for apartments still has 2+kk = code 4.
    expect(cb.category_sub_cb).toEqual(expect.arrayContaining([{ code: 4, label_cs: '2+kk' }]));
  });

  // ---------------------------------------------------------------------------------------
  // Group 2: drift — every documented dropdown value must still exist live.
  // We create one test per dropdown filter so a failure clearly names which one broke.
  // ---------------------------------------------------------------------------------------
  const enumFilters = Object.entries(schema.filters).filter(
    ([, def]) => def.type === 'enum' && Array.isArray(def.values) && def.values.length,
  );

  for (const [name, def] of enumFilters) {
    test(`dropdown '${name}' still matches the live API`, async ({ request }) => {
      const { cat, type } = pickContext(def.applies_to);
      const cb = await filterPage(request, cat, type);
      assertDocumentedSubset(def.values!, cb[def.api_param!], name);
    });
  }

  // category_sub_cb is special: its values are different for each category (flats vs houses
  // vs land...). So we check it once per category.
  test('disposition dropdown (category_sub_cb) matches live for every category', async ({ request }) => {
    const sub = schema.filters.category_sub_cb;
    for (const [categoryWord, values] of Object.entries(sub.values_by_category!)) {
      const categoryCode = CATEGORY_CODE[categoryWord];
      const cb = await filterPage(request, categoryCode, 1);
      assertDocumentedSubset(values, cb.category_sub_cb, `category_sub_cb[${categoryWord}]`);
    }
  });

  // ---------------------------------------------------------------------------------------
  // Group 3: inventory — every filter we documented must still be offered by the live API,
  // and we warn about any new filters the API offers that we have not documented yet.
  // ---------------------------------------------------------------------------------------
  test('documented filters still exist live; report any new ones', async ({ request }) => {
    // Asking the API is slow, so we remember each answer and reuse it.
    const cache = new Map<string, Record<string, unknown>>();
    const getCodebooks = async (cat: number, type: number) => {
      const key = `${cat}:${type}`;
      if (!cache.has(key)) cache.set(key, await filterPage(request, cat, type));
      return cache.get(key)!;
    };

    // Range filters look like "price_from"/"price_to" in our schema, but the API lists them
    // under the bare base name "price". This strips the _from/_to so we can compare.
    const baseName = (param: string) => param.replace(/_(from|to)$/, '');

    for (const [name, def] of Object.entries(schema.filters)) {
      // Work out which (category, type) combinations this filter is documented to work in.
      const cats = def.applies_to.category.map((c) => CATEGORY_CODE[c]).filter(Boolean);
      const types = def.applies_to.type.map((t) => TYPE_CODE[t]).filter(Boolean);
      const contexts: Array<[number, number]> = [];
      for (const c of cats) for (const t of types) contexts.push([c, t]);
      if (!contexts.length) contexts.push([1, 1]); // fallback: apartments for sale

      // The API parameter name(s) this filter uses.
      const params = def.api_params
        ? [def.api_params.from, def.api_params.to]
        : def.api_param
          ? [def.api_param]
          : [];

      // The filter passes if it appears in AT LEAST ONE of its valid contexts.
      for (const param of params) {
        const base = baseName(param);
        let foundSomewhere = false;
        for (const [cat, type] of contexts) {
          const liveFilterNames = new Set(Object.keys(await getCodebooks(cat, type)));
          if (
            liveFilterNames.has(param) ||
            liveFilterNames.has(base) ||
            liveFilterNames.has(`${base}_from`) ||
            liveFilterNames.has(`${base}_to`)
          ) {
            foundSomewhere = true;
            break;
          }
        }
        expect(
          foundSomewhere,
          `documented filter '${name}' (${param}) is gone from the live API (looked in ${JSON.stringify(contexts)}). ${FIX}`,
        ).toBeTruthy();
      }
    }

    // Friendly heads-up (does NOT fail the test): filters the API offers that we have not
    // written down yet. Someone can document these later.
    const documentedNames = new Set(
      Object.values(schema.filters).flatMap((def) =>
        def.api_params ? [baseName(def.api_params.from)] : def.api_param ? [def.api_param] : [],
      ),
    );
    const allLiveNames = new Set([...cache.values()].flatMap((cb) => Object.keys(cb)));
    const undocumented = [...allLiveNames].filter(
      (liveName) => !documentedNames.has(liveName) && !documentedNames.has(baseName(liveName)),
    );
    if (undocumented.length) {
      console.warn(`[drift] live API offers filters not in schema/filters.json: ${undocumented.join(', ')}. Consider documenting them.`);
    }
  });
});
