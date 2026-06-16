// Year selection: the calendar defaults to the current year, the ‹ year ›
// arrows step it, and trips form one plan that spans every year (Export /
// Import / Clear act on the whole plan, not just the year on screen).
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { openApp, setYear, cell, createRange, clearAll, expectEmptyCalendar } from "./helpers.js";

test.describe("year selection", () => {
  test("defaults to the current year on load", async ({ page }) => {
    // Note: no openApp() here — we want the app's own default, not the
    // pinned test year.
    await page.goto("/");
    await expect(page.getByTestId("month-january")).toBeVisible();
    const currentYear = String(new Date().getFullYear());
    await expect(page.getByTestId("year-display")).toHaveText(currentYear);
    // The year lives in the picker, not the heading.
    await expect(page.getByRole("heading", { name: "Holiday Planner" })).toBeVisible();
  });

  test("next / prev arrows step the displayed year", async ({ page }) => {
    await openApp(page); // pinned to 2026
    await page.getByTestId("year-next").click();
    await expect(page.getByTestId("year-display")).toHaveText("2027");

    await page.getByTestId("year-prev").click();
    await page.getByTestId("year-prev").click();
    await expect(page.getByTestId("year-display")).toHaveText("2025");
  });

  test("the grid re-renders for the selected year", async ({ page }) => {
    await openApp(page);
    // 2026: Jan 1 is a Thursday → three leading filler cells (Dec 29–31),
    // so Jan 1 sits at index 3 of the day grid.
    const jan = () => page.getByTestId("month-january").locator(".grid").last().locator("> div");
    await expect(jan().nth(3)).toHaveAttribute("data-date", "2026-01-01");

    // 2025: Jan 1 is a Wednesday → two leading filler cells, Jan 1 at index 2.
    await setYear(page, 2025);
    await expect(jan().nth(2)).toHaveAttribute("data-date", "2025-01-01");
  });

  test("trips persist across year switches", async ({ page }) => {
    await openApp(page);
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-15"),
      "Beach", "green");
    await expect(cell(page, "july", "2026-07-14").getByTestId("range-label")).toHaveText("Beach");

    await setYear(page, 2027);
    await expectEmptyCalendar(page); // the 2026 trip isn't on the 2027 canvas

    await setYear(page, 2026);
    await expect(cell(page, "july", "2026-07-14").getByTestId("range-label")).toHaveText("Beach");
  });

  test("trips for different years each show only on their own year", async ({ page }) => {
    await openApp(page);
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-14"),
      "Y2026", "blue");

    await setYear(page, 2027);
    await createRange(page, cell(page, "july", "2027-07-13"), cell(page, "july", "2027-07-14"),
      "Y2027", "red");
    await expect(cell(page, "july", "2027-07-13").getByTestId("range-label")).toHaveText("Y2027");
    // The 2026 trip's date is not a real cell while viewing 2027.
    await expect(page.locator('[data-date="2026-07-13"]')).toHaveCount(0);

    await setYear(page, 2026);
    await expect(cell(page, "july", "2026-07-13").getByTestId("range-label")).toHaveText("Y2026");
    await expect(page.locator('[data-date="2027-07-13"]')).toHaveCount(0);
  });

  test("export includes trips from years you're not currently viewing", async ({ page }) => {
    await openApp(page);
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-15"),
      "Summer", "green");
    await setYear(page, 2027); // view a different year

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-btn").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("holidays.json");
    const data = JSON.parse(fs.readFileSync(await download.path(), "utf-8"));
    expect(data.ranges).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Summer", start: "2026-07-13", end: "2026-07-15" }),
    ]));
  });

  test("Clear all empties every year, not just the visible one", async ({ page }) => {
    await openApp(page);
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-14"),
      "Gone", "blue");

    await setYear(page, 2027);
    await clearAll(page);

    await setYear(page, 2026);
    await expectEmptyCalendar(page);
  });
});
