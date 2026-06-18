/**
 * Tests for map clustering: GET /estates/search/clusters.
 *
 * When you look at the map view, listings that are close together are grouped into one
 * circle with a number ("a cluster"). This endpoint returns those groups for the part of
 * the map you are currently looking at.
 *
 * To know which part of the map you mean, it REQUIRES a bounding box: the min/max latitude
 * and longitude. We test both that it complains when the box is missing, and that it works
 * when the box is given.
 */
import { test, expect } from '@playwright/test';

test.describe('estates: map clusters', () => {
  // Without a map box, the API should refuse the request and tell us a field is missing.
  test('rejects a request with no bounding box (422)', async ({ request }) => {
    const res = await request.get('estates/search/clusters?category_main_cb=1&category_type_cb=1');
    expect(res.status()).toBe(422);

    const json = await res.json();
    // The error list should mention that "lat_min" (part of the box) is required.
    expect(json.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ fields: expect.arrayContaining(['lat_min']) })]),
    );
  });

  // With a box around Prague, we should get back map groups, each with a count and a box.
  test('returns clusters for a bounding box', async ({ request }) => {
    const res = await request.get(
      'estates/search/clusters?category_main_cb=1&category_type_cb=1' +
        '&lat_min=49.9&lat_max=50.2&lon_min=14.2&lon_max=14.7&zoom=11',
    );
    expect(res.ok()).toBeTruthy();

    const json = await res.json();
    expect(Array.isArray(json.results)).toBeTruthy();
    expect(json.results[0]).toHaveProperty('count'); // how many listings in this group
    expect(json.results[0]).toHaveProperty('bounding_box'); // the area the group covers
  });
});
