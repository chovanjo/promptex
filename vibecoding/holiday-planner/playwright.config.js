// Playwright configuration.
// Docs: https://playwright.dev/docs/test-configuration
//
// The app is built with Vite, so tests run against a real dev server
// rather than a file:// URL. Playwright starts that server itself (see
// `webServer` below) and shuts it down when the run finishes.
import { defineConfig } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

export default defineConfig({
  testDir: "./tests",

  // Each test gets a fresh page, so they are independent and can run
  // in parallel safely.
  fullyParallel: true,

  // Give each test some headroom (first hit also triggers Vite's
  // on-demand compile of the modules).
  timeout: 30_000,

  use: {
    // Tests navigate with page.goto("/") — resolved against this base.
    baseURL: BASE_URL,
    // Capture a screenshot and trace only when a test fails — the
    // fastest way to debug ("npx playwright show-trace <file>").
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },

  // Start the Vite dev server before the tests and reuse an already-
  // running one locally (so `npm run dev` in another terminal speeds
  // up the loop). In CI a fresh server is always started.
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },

  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
