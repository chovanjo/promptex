// Creating ranges: drag (forwards/backwards/cross-month), single-click
// one-day ranges, the dialog summary, Enter-to-save, and default color.
import { test, expect } from "@playwright/test";
import { openApp, cell, dragSelect, createRange, CLS } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test.describe("creating ranges", () => {
  test("drag Jul 13 → Jul 17 creates a labelled, colored range", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-17"),
      "Beach trip", "green");

    // All five days are painted with the chosen color class…
    for (const day of ["13", "14", "15", "16", "17"]) {
      await expect(cell(page, "july", `2026-07-${day}`)).toHaveClass(new RegExp(CLS.green));
    }
    // …the day before and after are not.
    await expect(cell(page, "july", "2026-07-12")).not.toHaveClass(new RegExp(CLS.green));
    await expect(cell(page, "july", "2026-07-18")).not.toHaveClass(new RegExp(CLS.green));

    // The label is shown on every day of the range.
    for (const day of ["13", "14", "15", "16", "17"]) {
      await expect(cell(page, "july", `2026-07-${day}`).getByTestId("range-label"))
        .toHaveText("Beach trip");
    }
  });

  test("dragging backwards (Jul 17 → Jul 13) produces the same range", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-17"), cell(page, "july", "2026-07-13"),
      "Backwards");

    // The chronological start (Jul 13) AND end (Jul 17) are part of the
    // range and carry the label, even though the drag started on Jul 17.
    await expect(cell(page, "july", "2026-07-13").getByTestId("range-label")).toHaveText("Backwards");
    await expect(cell(page, "july", "2026-07-17").getByTestId("range-label")).toHaveText("Backwards");
  });

  test("a single click creates a one-day range", async ({ page }) => {
    await cell(page, "august", "2026-08-10").click();
    await expect(page.getByTestId("range-dialog")).toBeVisible();
    await page.getByTestId("label-input").fill("Day off");
    await page.getByTestId("save-btn").click();

    await expect(cell(page, "august", "2026-08-10").getByTestId("range-label")).toHaveText("Day off");
  });

  test("a range can span a month boundary across two month cards", async ({ page }) => {
    // Drag starts in the July grid and ends in the August grid.
    await createRange(page, cell(page, "july", "2026-07-30"), cell(page, "august", "2026-08-02"),
      "Cross month", "red");

    const red = new RegExp(CLS.red);
    // Each date is painted in the one grid that owns it: the July days
    // in the July card, the August days in the August card.
    await expect(cell(page, "july", "2026-07-30")).toHaveClass(red);
    await expect(cell(page, "july", "2026-07-31")).toHaveClass(red);
    await expect(cell(page, "august", "2026-08-01")).toHaveClass(red);
    await expect(cell(page, "august", "2026-08-02")).toHaveClass(red);
    await expect(cell(page, "july", "2026-07-30").getByTestId("range-label")).toHaveText("Cross month");
  });

  test("a range can be planned in any month (e.g. June)", async ({ page }) => {
    await createRange(page, cell(page, "june", "2026-06-22"), cell(page, "june", "2026-06-26"),
      "Late June", "green");

    await expect(cell(page, "june", "2026-06-24")).toHaveClass(new RegExp(CLS.green));
    await expect(cell(page, "june", "2026-06-22").getByTestId("range-label")).toHaveText("Late June");
  });

  test("an empty label falls back to a default name", async ({ page }) => {
    await dragSelect(page, cell(page, "july", "2026-07-20"), cell(page, "july", "2026-07-21"));
    await page.getByTestId("save-btn").click(); // save without typing anything
    await expect(cell(page, "july", "2026-07-20").getByTestId("range-label")).toHaveText("Holiday");
  });

  test("the dialog summarises the selected span and day count", async ({ page }) => {
    await dragSelect(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-17"));
    await expect(page.getByTestId("range-dialog")).toContainText("Jul 13 – Jul 17 · 5 days");
    await page.getByTestId("cancel-btn").click();

    // A single day uses the singular form.
    await cell(page, "july", "2026-07-20").click();
    await expect(page.getByTestId("range-dialog")).toContainText("Jul 20 – Jul 20 · 1 day");
  });

  test("pressing Enter in the label input saves the range", async ({ page }) => {
    await dragSelect(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-14"));
    await page.getByTestId("label-input").fill("Quick save");
    await page.keyboard.press("Enter");

    await expect(page.getByTestId("range-dialog")).not.toBeVisible();
    await expect(cell(page, "july", "2026-07-13").getByTestId("range-label")).toHaveText("Quick save");
  });

  test("a new range uses the default pastel blue when no color is picked", async ({ page }) => {
    await dragSelect(page, cell(page, "august", "2026-08-03"), cell(page, "august", "2026-08-05"));
    await page.getByTestId("label-input").fill("Default blue");
    await page.getByTestId("save-btn").click();

    await expect(cell(page, "august", "2026-08-04")).toHaveClass(new RegExp(CLS.blue));
  });
});
