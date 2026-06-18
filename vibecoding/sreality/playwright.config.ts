import { defineConfig } from '@playwright/test';

/**
 * Playwright settings for our e2e tests.
 *
 * These tests talk to the REAL sreality.cz API over the internet (there is no fake server).
 * They do NOT open a web browser — they only make HTTP requests — so nothing heavy needs to
 * be downloaded. Because the data is live, we keep the settings gentle and forgiving.
 */
export default defineConfig({
  // Where the test files live. Playwright looks in sub-folders too, so estates/, localities/
  // and schema/ are all found automatically.
  testDir: './tests',

  // The internet can hiccup. If a test fails, try it up to 2 more times before giving up.
  retries: 2,

  // Run only 2 tests at a time, so we don't hammer the API with too many requests at once.
  workers: 2,

  // Give each test up to 45 seconds (live requests can be slow). Individual checks wait 15s.
  timeout: 45_000,
  expect: { timeout: 15_000 },

  // Print a simple list while running, and also save an HTML report (open with `npm run test:report`).
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    // The start of every API URL. IMPORTANT: it MUST end with a slash, and test paths must
    // NOT start with a slash (use "estates/search", not "/estates/search"). Otherwise the
    // "/api/v1" part gets dropped and every request hits the wrong address.
    baseURL: 'https://www.sreality.cz/api/v1/',

    // Sent with every request: a real User-Agent is polite, and we ask for JSON back.
    extraHTTPHeaders: {
      'User-Agent': 'sreality-e2e/1.0 (+docs-and-tests)',
      Accept: 'application/json',
    },
  },
});
