/**
 * Tests for a single listing's detail: the API endpoint AND the web URL we build for it.
 *
 * Two related things live here:
 *   1. GET /estates/{hash_id} — full data for one listing.
 *   2. buildDetailUrl(...) — turns a search result into the public web page URL.
 *
 * WHY THE URL PART MATTERS: we once built these URLs wrong (placeholder parts), so every
 * link was broken. These tests lock the URL shape and prove the listing behind it is real.
 *
 * IMPORTANT ABOUT "DOES THE PAGE EXIST?": the public website is a single-page app that can
 * answer "200 OK" even for a page that does not really exist (a "soft 404"). So we DO NOT
 * trust the website's status code. Instead we ask the API (/estates/{hash_id}), which gives
 * an honest 200 for a real listing and 404 for a fake one.
 */
import { test, expect } from '@playwright/test';
import { search } from '../support/api-client';
import { buildDetailUrl } from '../support/detail-url';
import { API } from '../support/constants';

test.describe('estates: single listing detail', () => {
  // The detail API returns the full record for a listing id taken from a live search.
  test('GET /estates/{hash_id} returns the full listing', async ({ request }) => {
    // Get a real id from search. We never hard-code an id because listings disappear over time.
    const list = await search(request, { category_main_cb: 1, category_type_cb: 1 });
    const hashId = list.results[0].hash_id;

    const res = await request.get(`estates/${hashId}`);
    expect(res.ok()).toBeTruthy();

    const json = await res.json();
    expect(json.result).toHaveProperty('hash_id', hashId);
    expect(json.result).toHaveProperty('category_main_cb');
  });

  // The built URL must have the exact 6 parts the website expects, taken from the result.
  test('buildDetailUrl produces the documented 6-part URL', async ({ request }) => {
    const res = await search(request, { category_main_cb: 1, category_type_cb: 1 });
    const result = res.results[0];

    const url = buildDetailUrl(result);
    // Split the path "/detail/.../..." into its parts (ignoring empty pieces).
    const parts = new URL(url).pathname.split('/').filter(Boolean);

    // Expected: /detail/{type}/{category}/{disposition}/{locality}/{hash_id}
    expect(parts).toHaveLength(6);
    expect(parts[0]).toBe('detail');
    expect(parts[1]).toBe('prodej'); // because category_type_cb = 1 (sale)
    expect(parts[2]).toBe('byt'); // because category_main_cb = 1 (apartment)
    expect(parts[3]).toBe(String(result.category_sub_cb.name).toLowerCase()); // disposition
    expect(parts[4]).not.toBe('x'); // locality part is filled in, not a placeholder
    expect(parts[4]).toContain(result.locality.city_seo_name); // and it really uses the city
    expect(parts[5]).toBe(String(result.hash_id)); // last part is the id
  });

  // The id inside a freshly built URL must point at a real listing (checked via the API).
  test('the id in a built URL points to a real listing', async ({ request }) => {
    const res = await search(request, { category_main_cb: 1, category_type_cb: 1 });
    const url = buildDetailUrl(res.results[0]);

    const hashId = new URL(url).pathname.split('/').filter(Boolean).at(-1);
    const detail = await request.get(`${API}/estates/${hashId}`);
    expect(detail.ok()).toBeTruthy();
    expect((await detail.json()).result).toHaveProperty('hash_id', Number(hashId));
  });

  // A made-up id must be rejected by the API with a real 404 (proves the API is honest).
  test('a made-up listing id returns 404 from the API', async ({ request }) => {
    const detail = await request.get(`${API}/estates/999999999999`);
    expect(detail.status()).toBe(404);
  });
});
