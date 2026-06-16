// Calendar grid layout: all 12 months for the selected year, Monday-first
// weeks, greyed adjacent-month filler (incl. the previous/next year at the
// January/December edges), and no public holidays.
import { test, expect } from "@playwright/test";
import { openApp, cell } from "./helpers.js";

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

test.beforeEach(async ({ page }) => {
  await openApp(page); // pins the year to 2026
});

test.describe("calendar grid", () => {
  test("renders all twelve month cards", async ({ page }) => {
    for (const m of MONTHS) {
      await expect(page.getByTestId(`month-${m}`)).toBeVisible();
    }
  });

  test("each month shows Monday-first weekday headers", async ({ page }) => {
    for (const m of ["january", "july", "december"]) {
      const headers = page.getByTestId(`month-${m}`).locator(".grid").first().locator("div");
      await expect(headers).toHaveText(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    }
  });

  test("July 2026 has 31 real days starting in the Wednesday column", async ({ page }) => {
    const july = page.getByTestId("month-july");
    const days = july.locator("[data-date]");
    await expect(days).toHaveCount(31);
    await expect(days.first()).toHaveAttribute("data-date", "2026-07-01");
    await expect(days.last()).toHaveAttribute("data-date", "2026-07-31");

    // Jul 1 2026 is a Wednesday: the first week is Mon Jun 29, Tue Jun 30,
    // then Jul 1 in the third (Wednesday) column. The two June cells are
    // greyed filler.
    const grid = july.locator(".grid").last();
    await expect(grid.locator("> div").nth(0)).toHaveAttribute("data-testid", "filler-day");
    await expect(grid.locator("> div").nth(1)).toHaveAttribute("data-testid", "filler-day");
    await expect(grid.locator("> div").nth(2)).toHaveAttribute("data-date", "2026-07-01");
  });

  test("each real date appears exactly once across the whole page", async ({ page }) => {
    // Filler cells carry no data-date, so a boundary date resolves to one
    // element (its owning month), never duplicated as filler elsewhere.
    for (const iso of ["2026-01-31", "2026-07-31", "2026-08-01", "2026-12-31"]) {
      await expect(page.locator(`[data-date="${iso}"]`)).toHaveCount(1);
    }
  });

  test("January overlaps into the previous year (late Dec 2025 as filler)", async ({ page }) => {
    const jan = page.getByTestId("month-january");
    await expect(jan.locator("[data-date]")).toHaveCount(31);
    // Jan 1 2026 is a Thursday, so the first week leads with Dec 29–31 2025
    // shown as greyed filler — those previous-year days are NOT real cells.
    await expect(jan.getByTestId("filler-day").first()).toHaveText("29");
    await expect(page.locator('[data-date^="2025-"]')).toHaveCount(0);
  });

  test("December overlaps into the next year (early Jan 2027 as filler)", async ({ page }) => {
    const dec = page.getByTestId("month-december");
    await expect(dec.locator("[data-date]")).toHaveCount(31);
    // Dec 31 2026 is a Thursday, so the last week trails with Jan 1–3 2027
    // as greyed filler — those next-year days are NOT real cells.
    await expect(dec.getByTestId("filler-day").last()).toHaveText("3");
    await expect(page.locator('[data-date^="2027-"]')).toHaveCount(0);
  });

  test("weekend days get the subtle gray tint, weekdays stay white", async ({ page }) => {
    // Jul 11 is a Saturday, Jul 12 a Sunday, Jul 10 a Friday.
    await expect(cell(page, "july", "2026-07-11")).toHaveClass(/bg-gray-50/);
    await expect(cell(page, "july", "2026-07-12")).toHaveClass(/bg-gray-50/);
    await expect(cell(page, "july", "2026-07-10")).not.toHaveClass(/bg-gray-50/);
  });

  test("marks public holidays from the API", async ({ page }) => {
    // openApp stubs CZ holidays (incl. Jul 5) for the pinned year.
    await expect(cell(page, "july", "2026-07-05").getByTestId("holiday-marker")).toBeVisible();
    // A non-holiday weekday has no marker.
    await expect(cell(page, "july", "2026-07-07").getByTestId("holiday-marker")).toHaveCount(0);
  });

  test("shows a usage guide below the calendar", async ({ page }) => {
    const guide = page.getByTestId("usage-guide");
    await expect(guide).toBeVisible();
    await expect(guide).toContainText("How to use");
    await expect(guide).toContainText("Travel day");
  });
});
