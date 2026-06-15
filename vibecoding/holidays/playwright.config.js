// Playwright configuration.
// Docs: https://playwright.dev/docs/test-configuration
//
// The app is a single static HTML file, so there is no web server to
// start — tests open it directly with a file:// URL (see tests/helpers).
// NOTE: the app loads React/Tailwind from CDNs, so running the tests
// requires an internet connection.
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",

  // Each test gets a fresh page, so they are independent and can run
  // in parallel safely.
  fullyParallel: true,

  // CDN scripts occasionally load slowly; give each test some headroom.
  timeout: 30_000,

  use: {
    // Capture a screenshot and trace only when a test fails — the
    // fastest way to debug ("npx playwright show-trace <file>").
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
