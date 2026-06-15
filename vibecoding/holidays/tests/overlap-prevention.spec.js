// Overlap prevention: multi-day overlaps (crossing or containing an
// existing range) are rejected with a toast.
import { test, expect } from "@playwright/test";
import { openApp, cell, dragSelect, createRange } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test.describe("overlap prevention", () => {
  test("a selection crossing an existing range is rejected with a toast", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-17"),
      "Existing");

    // Try to drag Jul 16 → Jul 20, which collides with Jul 13–17.
    // The drag must start on a FREE day (clicking inside a range opens
    // its edit dialog instead), so we start from Jul 20 and drag back.
    await dragSelect(page, cell(page, "july", "2026-07-20"), cell(page, "july", "2026-07-16"));

    await expect(page.getByTestId("toast")).toContainText("cannot overlap");
    await expect(page.getByTestId("range-dialog")).not.toBeVisible();
    // Still just the original: its days remain painted, the attempted day is free.
    await expect(cell(page, "july", "2026-07-15").getByTestId("range-label")).toHaveText("Existing");
    await expect(cell(page, "july", "2026-07-20").getByTestId("range-label")).toHaveCount(0);
  });

  test("a new range that fully contains an existing one is rejected", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-15"),
      "Existing");

    // Drag from a free day, across the whole existing range, to another
    // free day — a multi-day (containment) overlap, not just a boundary.
    await dragSelect(page, cell(page, "july", "2026-07-10"), cell(page, "july", "2026-07-18"));

    await expect(page.getByTestId("toast")).toContainText("cannot overlap");
    await expect(page.getByTestId("range-dialog")).not.toBeVisible();
    // Still just the original: its days remain painted, the attempted day is free.
    await expect(cell(page, "july", "2026-07-14").getByTestId("range-label")).toHaveText("Existing");
    await expect(cell(page, "july", "2026-07-10").getByTestId("range-label")).toHaveCount(0);
  });
});
