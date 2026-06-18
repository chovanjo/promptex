/**
 * Tests for the main search endpoint: GET /estates/search.
 *
 * This is THE endpoint everything else builds on. A passing test here proves the API is
 * reachable and still answers with the basic shape we rely on: a `pagination` block with a
 * total count, and a `results` list where each item has a `hash_id`.
 *
 * We never check the EXACT number of results — real listings appear and disappear all day,
 * so an exact number would make the test fail for no good reason. We only check the shape
 * and that there is at least one result.
 */
import { test, expect } from '@playwright/test';

test.describe('estates: search', () => {
  // Check that a simple search (apartments for sale) returns the expected structure.
  test('returns a pagination block and a list of results', async ({ request }) => {
    const res = await request.get('estates/search?category_main_cb=1&category_type_cb=1&per_page=3');
    expect(res.ok()).toBeTruthy();

    const json = await res.json();

    // pagination tells us how many matched and which page we got.
    expect(json.pagination).toMatchObject({
      total: expect.any(Number),
      limit: expect.any(Number),
      offset: expect.any(Number),
    });
    expect(json.pagination.total).toBeGreaterThan(0);

    // results is the list of listings on this page.
    expect(Array.isArray(json.results)).toBeTruthy();
    expect(json.results.length).toBeGreaterThan(0);

    // Every listing must have a hash_id — it is the unique id we use to build detail links.
    expect(json.results[0]).toHaveProperty('hash_id');
  });
});
