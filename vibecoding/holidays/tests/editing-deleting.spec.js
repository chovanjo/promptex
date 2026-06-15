// Editing and deleting ranges: opening the edit dialog, renaming/
// recoloring, discarding with Escape, pre-selected color, and the two
// delete paths (dialog button and list button).
import { test, expect } from "@playwright/test";
import { openApp, cell, dismissSuggestions, createRange, CLS } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test.describe("editing and deleting ranges", () => {
  // Each test in this block starts with one existing range.
  test.beforeEach(async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-17"),
      "Original", "blue");
  });

  test("clicking a day inside a range opens the edit dialog", async ({ page }) => {
    await cell(page, "july", "2026-07-15").click(); // middle of the range
    const dialog = page.getByTestId("range-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Edit range");
    // The form is pre-filled with the current label.
    await expect(page.getByTestId("label-input")).toHaveValue("Original");
  });

  test("renaming and recoloring updates the calendar and the list", async ({ page }) => {
    await page.getByTestId("range-item").getByTestId("edit-range-btn").click();
    await page.getByTestId("label-input").fill("Renamed");
    await dismissSuggestions(page);
    await page.getByTestId("color-red").click();
    await page.getByTestId("save-btn").click();

    await expect(page.getByTestId("range-item")).toContainText("Renamed");
    await expect(cell(page, "july", "2026-07-13").getByTestId("range-label")).toHaveText("Renamed");
    await expect(cell(page, "july", "2026-07-15")).toHaveClass(new RegExp(CLS.red));
    // Dates are unchanged — editing only touches label and color.
    await expect(page.getByTestId("range-item")).toContainText("Jul 13 – Jul 17");
  });

  test("Escape in the edit dialog discards the changes", async ({ page }) => {
    await cell(page, "july", "2026-07-15").click();
    await page.getByTestId("label-input").fill("Should not stick");
    await page.keyboard.press("Escape");

    await expect(page.getByTestId("range-dialog")).not.toBeVisible();
    await expect(page.getByTestId("range-item")).toContainText("Original");
  });

  test("the edit dialog pre-selects the range's current color", async ({ page }) => {
    await cell(page, "july", "2026-07-15").click(); // range was created blue
    // The current color's swatch carries the "selected" ring, others don't.
    await expect(page.getByTestId("color-blue")).toHaveClass(/ring-gray-700/);
    await expect(page.getByTestId("color-red")).not.toHaveClass(/ring-gray-700/);
  });

  test("Delete in the dialog removes the range", async ({ page }) => {
    await cell(page, "july", "2026-07-15").click();
    await page.getByTestId("delete-btn").click();

    await expect(page.getByTestId("range-item")).toHaveCount(0);
    // The cell is back to a plain, unpainted day.
    await expect(cell(page, "july", "2026-07-15")).not.toHaveClass(new RegExp(CLS.blue));
  });

  test("Delete button in the list removes the range", async ({ page }) => {
    await page.getByTestId("range-item").getByTestId("delete-range-btn").click();
    await expect(page.getByTestId("range-item")).toHaveCount(0);
    await expect(page.getByTestId("empty-hint")).toBeVisible();
  });

  test("freed days can be selected again after deleting", async ({ page }) => {
    await page.getByTestId("range-item").getByTestId("delete-range-btn").click();
    await createRange(page, cell(page, "july", "2026-07-14"), cell(page, "july", "2026-07-16"),
      "Second attempt");
    await expect(page.getByTestId("range-item")).toContainText("Second attempt");
  });

  test("recoloring a trip that forms a travel day updates its half", async ({ page }) => {
    // The block's beforeEach already created "Original" (Jul 13–17, blue).
    // Add a second trip that begins on Jul 17, so Jul 17 becomes a travel
    // day: top half = Original (leaving), bottom half = Next (arriving).
    await createRange(page, cell(page, "july", "2026-07-19"), cell(page, "july", "2026-07-17"),
      "Next", "green");
    const leaving = cell(page, "july", "2026-07-17").getByTestId("travel-leaving");
    await expect(leaving).toHaveClass(new RegExp(CLS.blue));

    // Recolor Original to red via its list row; the leaving half repaints.
    await page.getByTestId("range-item").filter({ hasText: "Original" }).getByTestId("edit-range-btn").click();
    await dismissSuggestions(page);
    await page.getByTestId("color-red").click();
    await page.getByTestId("save-btn").click();

    await expect(leaving).toHaveClass(new RegExp(CLS.red));
    await expect(leaving).toHaveText("Original");
  });
});
