/**
 * Tests that each KIND of search filter actually does something.
 *
 * The idea is simple and the same every time:
 *   1. Count how many listings match with no extra filter (the "baseline").
 *   2. Add one filter and count again.
 *   3. The new count should be SMALLER (the filter removed some listings) but still > 0.
 *
 * We use this "smaller than baseline" idea on purpose instead of exact numbers, because
 * the real count changes constantly as listings come and go.
 */
import { test, expect } from '@playwright/test';
import { search, searchTotal } from '../support/api-client';

// Our starting point for most tests: apartments (1) for sale (1).
const BASE = { category_main_cb: 1, category_type_cb: 1 } as const;

test.describe('estates: filter behaviour', () => {
  // How many listings match before we add any extra filter. Measured once for this file.
  let baseline: number;
  test.beforeAll(async ({ request }) => {
    baseline = await searchTotal(request, BASE);
    expect(baseline).toBeGreaterThan(0);
  });

  // A dropdown filter: only brick buildings (building_type = 2).
  test('enum filter (building_type=2 brick) narrows results', async ({ request }) => {
    const total = await searchTotal(request, { ...BASE, building_type: 2 });
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(baseline);
  });

  // A disposition filter: only 2+kk flats (category_sub_cb = 4).
  test('enum disposition (category_sub_cb=4 2+kk) narrows results', async ({ request }) => {
    const total = await searchTotal(request, { ...BASE, category_sub_cb: 4 });
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(baseline);
  });

  // Asking for several dispositions at once must be a real OR of all of them.
  // A flat has exactly ONE disposition, so the choices are disjoint: the count for [4,5,6]
  // must equal count(4) + count(5) + count(6). This is a strict check on purpose — it catches
  // the bug where repeating the parameter makes the API keep only the FIRST value. Multi-value
  // must be sent comma-joined (category_sub_cb=4,5,6), which is what the client does.
  test('multi-value enum (several dispositions) is the sum of each single value', async ({ request }) => {
    const c4 = await searchTotal(request, { ...BASE, category_sub_cb: 4 }); // 2+kk
    const c5 = await searchTotal(request, { ...BASE, category_sub_cb: 5 }); // 2+1
    const c6 = await searchTotal(request, { ...BASE, category_sub_cb: 6 }); // 3+kk
    const combined = await searchTotal(request, { ...BASE, category_sub_cb: [4, 5, 6] });
    expect(combined).toBe(c4 + c5 + c6);
  });

  // A range filter using the upper bound: price up to 2,000,000 CZK.
  test('range filter (price_to) narrows results', async ({ request }) => {
    const total = await searchTotal(request, { ...BASE, price_to: 2_000_000 });
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(baseline);
  });

  // A range filter using the lower bound: area of at least 80 m².
  test('range filter (usable_area_from) narrows results', async ({ request }) => {
    const total = await searchTotal(request, { ...BASE, usable_area_from: 80 });
    expect(total).toBeLessThan(baseline);
  });

  // An on/off filter: only listings that have a balcony (balcony = 1).
  test('boolean filter (balcony=1) narrows results', async ({ request }) => {
    const total = await searchTotal(request, { ...BASE, balcony: 1 });
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(baseline);
  });

  // A location filter by region id: only Prague (locality_region_id = 10).
  test('locality id filter (locality_region_id=10 Prague) narrows results', async ({ request }) => {
    const total = await searchTotal(request, { ...BASE, locality_region_id: 10 });
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(baseline);
  });

  // Some filters only exist for rentals. "furnished" is one of them, so we test it against
  // rent (category_type_cb = 2), not sale.
  test('rent-only filter (furnished) applies for rentals', async ({ request }) => {
    const rentBaseline = await searchTotal(request, { category_main_cb: 1, category_type_cb: 2 });
    const furnished = await searchTotal(request, { category_main_cb: 1, category_type_cb: 2, furnished: 1 });
    expect(furnished).toBeGreaterThan(0);
    expect(furnished).toBeLessThan(rentBaseline);
  });
});
