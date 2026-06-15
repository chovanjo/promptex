// Calendar grid layout: weekday headers, the extra June week, the
// de-duplicated Jul/Aug boundary, filler/weekend tints, and holidays.
import { test, expect } from "@playwright/test";
import { openApp, cell, createRange } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test.describe("calendar grid", () => {
  test("shows Monday-first weekday headers in both months", async ({ page }) => {
    for (const month of ["july", "august"]) {
      const headers = page.getByTestId(`month-${month}`).locator(".grid").first().locator("div");
      await expect(headers).toHaveText(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    }
  });

  test("July grid runs Jun 22 – Jul 31 with Jul 1 on Wednesday", async ({ page }) => {
    const days = page.getByTestId("month-july").locator("[data-date]");
    await expect(days).toHaveCount(40); // 6 weeks minus the 2 blanked Aug days

    // One full extra June week (Jun 22–28) precedes July's own first week.
    await expect(days.nth(0)).toHaveAttribute("data-date", "2026-06-22");
    await expect(days.nth(7)).toHaveAttribute("data-date", "2026-06-29");
    // Jul 1 sits in the Wednesday column of the second displayed week.
    await expect(days.nth(9)).toHaveAttribute("data-date", "2026-07-01");
    // Last real cell is Jul 31; Aug 1–2 are blank placeholders because
    // those dates belong to the August card.
    await expect(days.nth(39)).toHaveAttribute("data-date", "2026-07-31");
    await expect(page.getByTestId("month-july").getByTestId("blank-day")).toHaveCount(2);
  });

  test("August grid runs Aug 1 – Sep 6 (September filler in the last week)", async ({ page }) => {
    const days = page.getByTestId("month-august").locator("[data-date]");
    await expect(days).toHaveCount(37); // 6 weeks minus the 5 blanked Jul days

    // Aug 1 is a Saturday — the Mon–Fri slots before it are blank
    // placeholders (those July dates live in the July card).
    await expect(days.nth(0)).toHaveAttribute("data-date", "2026-08-01");
    await expect(page.getByTestId("month-august").getByTestId("blank-day")).toHaveCount(5);
    // Aug 31 is a Monday; Sep 1–6 complete the final week.
    await expect(days.nth(30)).toHaveAttribute("data-date", "2026-08-31");
    await expect(days.nth(36)).toHaveAttribute("data-date", "2026-09-06");
  });

  test("no date appears in both month grids", async ({ page }) => {
    // The whole boundary week used to be duplicated; now each date
    // exists exactly once across the entire page.
    for (const iso of ["2026-07-27", "2026-07-30", "2026-07-31", "2026-08-01", "2026-08-02"]) {
      await expect(page.locator(`[data-date="${iso}"]`)).toHaveCount(1);
    }
  });

  test("filler days are dimmed, in-month days are not", async ({ page }) => {
    // Jun 30 is a filler day in July's grid → gray text class.
    await expect(cell(page, "july", "2026-06-30")).toHaveClass(/text-gray-400/);
    await expect(cell(page, "july", "2026-07-01")).not.toHaveClass(/text-gray-400/);
  });

  test("weekend days get the subtle gray tint, weekdays stay white", async ({ page }) => {
    // Jul 11 is a Saturday, Jul 12 a Sunday, Jul 10 a Friday.
    await expect(cell(page, "july", "2026-07-11")).toHaveClass(/bg-gray-50/);
    await expect(cell(page, "july", "2026-07-12")).toHaveClass(/bg-gray-50/);
    await expect(cell(page, "july", "2026-07-10")).not.toHaveClass(/bg-gray-50/);
  });

  test("marks the Czech public holidays (Jul 5 and Jul 6)", async ({ page }) => {
    await expect(cell(page, "july", "2026-07-05").getByTestId("holiday-marker")).toBeVisible();
    await expect(cell(page, "july", "2026-07-06").getByTestId("holiday-marker")).toBeVisible();
    // An ordinary day has no marker.
    await expect(cell(page, "july", "2026-07-07").getByTestId("holiday-marker")).toHaveCount(0);
    // The hover tooltip was replaced by the legend, so no title here.
    await expect(cell(page, "july", "2026-07-06")).toHaveAttribute("title", "");
  });

  test("shows a legend naming each public holiday", async ({ page }) => {
    const legend = page.getByTestId("holiday-legend");
    await expect(legend).toBeVisible();
    await expect(legend).toContainText("Jul 5 — Saints Cyril and Methodius Day");
    await expect(legend).toContainText("Jul 6 — Jan Hus Day");
  });

  test("the holiday marker still shows on a day covered by a range", async ({ page }) => {
    // Painting a range over Jul 5–6 must not hide their holiday dots.
    await createRange(page, cell(page, "july", "2026-07-04"), cell(page, "july", "2026-07-06"),
      "Long weekend", "green");

    await expect(cell(page, "july", "2026-07-05").getByTestId("holiday-marker")).toBeVisible();
    await expect(cell(page, "july", "2026-07-06").getByTestId("holiday-marker")).toBeVisible();
  });
});
