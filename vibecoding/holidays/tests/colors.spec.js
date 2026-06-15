// Colors: the dialog offers exactly the 9 pastel swatches (no custom
// picker), and picking one paints the range.
import { test, expect } from "@playwright/test";
import { openApp, cell, dragSelect, dismissSuggestions, CLS } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test.describe("colors", () => {
  test("the dialog offers exactly 9 pastel swatches and no custom picker", async ({ page }) => {
    await dragSelect(page, cell(page, "august", "2026-08-03"), cell(page, "august", "2026-08-05"));

    const dialog = page.getByTestId("range-dialog");
    await expect(dialog.locator('[data-testid^="color-"]')).toHaveCount(9);
    await expect(dialog.getByTestId("custom-color")).toHaveCount(0);
    await expect(dialog.locator('input[type="color"]')).toHaveCount(0);
  });

  test("picking a swatch paints the range with that pastel color", async ({ page }) => {
    await dragSelect(page, cell(page, "august", "2026-08-03"), cell(page, "august", "2026-08-05"));
    await page.getByTestId("label-input").fill("Pastel");
    await dismissSuggestions(page);
    await page.getByTestId("color-violet").click();
    await page.getByTestId("save-btn").click();

    await expect(cell(page, "august", "2026-08-04")).toHaveClass(new RegExp(CLS.violet));
  });
});
