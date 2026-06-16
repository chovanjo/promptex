// Guards against parsing ISO dates as UTC midnight: west of UTC that would
// render trips a day early (see fromISO in dateUtils). We pin a negative-UTC
// timezone for this whole file and check a trip lands on its real days.
import { test, expect } from "@playwright/test";
import { openApp, cell, createRange } from "./helpers.js";

test.use({ timezoneId: "America/New_York" });

test.describe("timezone safety", () => {
  test("a trip renders on its real days west of UTC", async ({ page }) => {
    await openApp(page);
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-17"),
      "Trip", "green");

    // The exact start and end days carry the label…
    await expect(cell(page, "july", "2026-07-13").getByTestId("range-label")).toHaveText("Trip");
    await expect(cell(page, "july", "2026-07-17").getByTestId("range-label")).toHaveText("Trip");
    // …and the neighbours are untouched (no off-by-one shift).
    await expect(cell(page, "july", "2026-07-12").getByTestId("range-label")).toHaveCount(0);
    await expect(cell(page, "july", "2026-07-18").getByTestId("range-label")).toHaveCount(0);
  });
});
