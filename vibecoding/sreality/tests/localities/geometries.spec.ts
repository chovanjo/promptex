/**
 * Tests for place shapes: GET /localities/geometries.
 *
 * Besides a name and id, a place also has a shape on the map (its outline and a bounding
 * box). The map view uses this endpoint to draw the area you searched in. A passing test
 * proves it still returns geometry (at least a bounding box) for a known place.
 *
 * Note the parameter names here are `entity_type` and `entity_id` (no "locality_" prefix),
 * which is different from the search endpoint — an easy thing to get wrong.
 */
import { test, expect } from '@playwright/test';

test.describe('localities: geometries', () => {
  // Ask for the shape of Brno (municipality id 5740) and expect at least a bounding box.
  test('returns geometry for a known place', async ({ request }) => {
    const res = await request.get('localities/geometries?entity_type=municipality&entity_id=5740');
    expect(res.ok()).toBeTruthy();

    const json = await res.json();
    expect(Array.isArray(json.result)).toBeTruthy();
    expect(json.result[0]).toHaveProperty('bounding_box');
  });
});
