/**
 * Tests for the price histogram: GET /estates/filter_page/histogram.
 *
 * The website draws a little bar chart on the price slider showing how many listings fall
 * into each price range. This endpoint provides the data for that chart. A passing test
 * proves it still returns a list of price "buckets", each with a count and a from/to price.
 */
import { test, expect } from '@playwright/test';

test.describe('estates: price histogram', () => {
  test('returns price buckets for the current filters', async ({ request }) => {
    const res = await request.get('estates/filter_page/histogram?category_main_cb=1&category_type_cb=1');
    expect(res.ok()).toBeTruthy();

    const json = await res.json();

    // The chart data is a non-empty list of buckets.
    expect(Array.isArray(json.result.histogram)).toBeTruthy();
    expect(json.result.histogram.length).toBeGreaterThan(0);

    // Each bucket says: how many listings, and the price range it covers.
    expect(json.result.histogram[0]).toMatchObject({
      advert_count: expect.any(Number),
      price_from: expect.any(Number),
      price_to: expect.any(Number),
    });
  });
});
