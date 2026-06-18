/**
 * Tests for place autocomplete: GET /localities/suggest.
 *
 * When a user types a place name (like "Brno"), this endpoint suggests matching places and,
 * importantly, gives each one a TYPE (municipality / ward / street / ...) and an ID.
 *
 * That type + id is exactly what a search needs to filter by an exact place
 * (locality_entity_type + locality_entity_id). So this file tests two things:
 *   1. suggest returns useful results with a type and id.
 *   2. those results can actually be fed into a search and narrow it down.
 */
import { test, expect } from '@playwright/test';
import { search, searchTotal } from '../support/api-client';

test.describe('localities: suggest (autocomplete)', () => {
  // Typing a place name returns suggestions, each carrying a type and an id we can reuse.
  test('returns matching places with a type and id', async ({ request }) => {
    const res = await request.get(`localities/suggest?phrase=${encodeURIComponent('Brno')}`);
    expect(res.ok()).toBeTruthy();

    const json = await res.json();
    expect(json.results.length).toBeGreaterThan(0);

    // The useful bits live under userData.
    const userData = json.results[0].userData;
    expect(userData).toHaveProperty('entityType'); // e.g. "municipality"
    expect(userData).toHaveProperty('id'); // e.g. 5740
  });

  // The real purpose of suggest: take a suggested place and use it to filter a search.
  // We also add a 5 km radius around it to prove the radius option works too.
  test('a suggested place can be used to filter a search (with radius)', async ({ request }) => {
    // First, how many apartments are for sale everywhere (our baseline to compare against).
    const everywhere = await searchTotal(request, { category_main_cb: 1, category_type_cb: 1 });

    // Ask suggest for "Brno" and pick the municipality (the town itself).
    const suggestRes = await request.get(`localities/suggest?phrase=${encodeURIComponent('Brno')}`);
    const brno = (await suggestRes.json()).results.find(
      (r: any) => r.userData?.entityType === 'municipality',
    ).userData;

    // Now search only near Brno.
    const nearBrno = await search(request, {
      category_main_cb: 1,
      category_type_cb: 1,
      locality_entity_type: brno.entityType,
      locality_entity_id: brno.id,
      locality_radius: 5, // kilometres
    });

    expect(nearBrno.pagination.total).toBeGreaterThan(0);
    expect(nearBrno.pagination.total).toBeLessThan(everywhere); // one town < the whole country
  });
});
