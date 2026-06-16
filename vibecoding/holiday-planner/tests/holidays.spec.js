// Public holidays: fetched per year from the (stubbed) Nager.Date API,
// shown as dot markers + a legend, with a header load-status indicator.
// The API is always stubbed (see stubHolidays / openApp) so the suite is
// deterministic and offline.
import { test, expect } from "@playwright/test";
import { openApp, setYear, cell, createRange, stubHolidays } from "./helpers.js";

test.describe("public holidays", () => {
  test("marks the year's holidays; ordinary days have no marker", async ({ page }) => {
    await openApp(page);
    await expect(cell(page, "july", "2026-07-05").getByTestId("holiday-marker")).toBeVisible();
    await expect(cell(page, "january", "2026-01-01").getByTestId("holiday-marker")).toBeVisible();
    await expect(cell(page, "july", "2026-07-07").getByTestId("holiday-marker")).toHaveCount(0);
  });

  test("the holiday marker shows even when a trip covers the day", async ({ page }) => {
    await openApp(page);
    await createRange(page, cell(page, "july", "2026-07-04"), cell(page, "july", "2026-07-06"),
      "Long weekend", "green");
    await expect(cell(page, "july", "2026-07-05").getByTestId("range-label")).toHaveText("Long weekend");
    await expect(cell(page, "july", "2026-07-05").getByTestId("holiday-marker")).toBeVisible();
  });

  test("the holiday name is in the day's tooltip (Czech)", async ({ page }) => {
    await openApp(page);
    await expect(cell(page, "july", "2026-07-06")).toHaveAttribute("title", /Jana Husa/);
  });

  test("the legend lists the year's holidays in date order", async ({ page }) => {
    await openApp(page);
    const legend = page.getByTestId("holiday-legend");
    await expect(legend).toBeVisible();
    await expect(page.getByTestId("holiday-legend-item")).toHaveCount(4);
    await expect(legend).toContainText("Nový rok");
    await expect(legend).toContainText("Jan 1");
    await expect(legend).toContainText("Den upálení mistra Jana Husa");
  });

  test("the status indicator (in the legend) turns green with visible 'Loaded' text", async ({ page }) => {
    await openApp(page);
    await expect(page.getByTestId("holiday-status")).toHaveAttribute("data-state", "ok");
    await expect(page.getByTestId("holiday-status-text")).toHaveText("Loaded");
  });

  test("switching year reloads holidays for that year", async ({ page }) => {
    await openApp(page);
    await setYear(page, 2027);
    await expect(cell(page, "july", "2027-07-05").getByTestId("holiday-marker")).toBeVisible();
    await expect(page.getByTestId("holiday-legend")).toContainText("Jul 5");
    // Back to 2026 (served from cache) still correct.
    await setYear(page, 2026);
    await expect(cell(page, "july", "2026-07-05").getByTestId("holiday-marker")).toBeVisible();
  });

  test("a successful but empty response shows no markers and hides the legend", async ({ page }) => {
    await stubHolidays(page, { empty: true });
    await openApp(page);
    await expect(page.getByTestId("holiday-status")).toHaveAttribute("data-state", "ok");
    await expect(page.getByTestId("holiday-marker")).toHaveCount(0);
    // The legend panel still shows (it hosts the status), but lists nothing.
    await expect(page.getByTestId("holiday-legend")).toBeVisible();
    await expect(page.getByTestId("holiday-legend-item")).toHaveCount(0);
  });

  test("on API error the status is red and the planner still works", async ({ page }) => {
    await stubHolidays(page, { status: 500 });
    await openApp(page);
    await expect(page.getByTestId("holiday-status")).toHaveAttribute("data-state", "error");
    await expect(page.getByTestId("holiday-status-text")).toHaveText("Couldn't load");
    await expect(page.getByTestId("holiday-marker")).toHaveCount(0);
    // The app is fully usable despite the failed holiday load.
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-15"), "Trip", "blue");
    await expect(cell(page, "july", "2026-07-14").getByTestId("range-label")).toHaveText("Trip");
  });

  test("shows a loading state before holidays arrive", async ({ page }) => {
    await stubHolidays(page, { delayMs: 1500 });
    await openApp(page);
    // Still in flight right after load…
    await expect(page.getByTestId("holiday-status")).toHaveAttribute("data-state", "loading");
    // …then resolves to ok.
    await expect(page.getByTestId("holiday-status")).toHaveAttribute("data-state", "ok");
  });
});
