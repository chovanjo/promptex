// The saved-ranges list: date-ordered (not creation order) and hovering
// a row highlights that range's days in the calendar.
import { test, expect } from "@playwright/test";
import { openApp, cell, createRange } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test.describe("range list", () => {
  test("ranges are listed in date order, not creation order", async ({ page }) => {
    // Create the August range FIRST, then the July one.
    await createRange(page, cell(page, "august", "2026-08-10"), cell(page, "august", "2026-08-12"),
      "Second by date");
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-15"),
      "First by date");

    const items = page.getByTestId("range-item");
    await expect(items.nth(0)).toContainText("First by date");
    await expect(items.nth(1)).toContainText("Second by date");
  });

  test("hovering a list row highlights the range's days in the calendar", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-15"),
      "Hover me");

    await page.getByTestId("range-item").hover();
    for (const day of ["13", "14", "15"]) {
      await expect(cell(page, "july", `2026-07-${day}`)).toHaveClass(/ring-gray-700/);
    }
    // Moving the mouse away removes the highlight again.
    await page.getByRole("heading", { name: /Holiday Planner/ }).hover();
    await expect(cell(page, "july", "2026-07-14")).not.toHaveClass(/ring-gray-700/);
  });
});
