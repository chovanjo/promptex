// Cancelling a pending selection: Cancel button, Escape, clicking the
// dim backdrop, and Escape mid-drag.
import { test, expect } from "@playwright/test";
import { openApp, cell, dragSelect } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test.describe("cancelling a selection", () => {
  test("Cancel button discards the pending range", async ({ page }) => {
    await dragSelect(page, cell(page, "july", "2026-07-06"), cell(page, "july", "2026-07-08"));
    await page.getByTestId("cancel-btn").click();

    await expect(page.getByTestId("range-dialog")).not.toBeVisible();
    await expect(page.getByTestId("range-item")).toHaveCount(0);
    await expect(page.getByTestId("empty-hint")).toBeVisible();
  });

  test("Escape closes the dialog without saving", async ({ page }) => {
    await dragSelect(page, cell(page, "july", "2026-07-06"), cell(page, "july", "2026-07-08"));
    await expect(page.getByTestId("range-dialog")).toBeVisible();
    await page.keyboard.press("Escape");

    await expect(page.getByTestId("range-dialog")).not.toBeVisible();
    await expect(page.getByTestId("range-item")).toHaveCount(0);
  });

  test("clicking the dim background around the dialog cancels it", async ({ page }) => {
    await dragSelect(page, cell(page, "july", "2026-07-06"), cell(page, "july", "2026-07-08"));
    await expect(page.getByTestId("range-dialog")).toBeVisible();

    // The overlay covers the whole viewport with the card in the
    // middle, so a click near the top-left corner hits the overlay.
    await page.mouse.click(10, 10);

    await expect(page.getByTestId("range-dialog")).not.toBeVisible();
    await expect(page.getByTestId("range-item")).toHaveCount(0);
  });

  test("Escape during the drag itself abandons the selection", async ({ page }) => {
    await cell(page, "july", "2026-07-06").hover();
    await page.mouse.down();
    await cell(page, "july", "2026-07-08").hover();
    await page.keyboard.press("Escape"); // abort mid-drag
    await page.mouse.up();

    await expect(page.getByTestId("range-dialog")).not.toBeVisible();
    await expect(page.getByTestId("range-item")).toHaveCount(0);
  });
});
