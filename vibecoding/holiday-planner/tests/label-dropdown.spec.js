// The label combobox: showing/filtering suggestions (accent-insensitive),
// keyboard navigation, the chevron toggle, and Escape's two-step close.
import { test, expect } from "@playwright/test";
import { openApp, cell, dragSelect, expectEmptyCalendar } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test.describe("label dropdown", () => {
  // Every test here starts with the create dialog open.
  test.beforeEach(async ({ page }) => {
    await dragSelect(page, cell(page, "july", "2026-07-06"), cell(page, "july", "2026-07-08"));
    await expect(page.getByTestId("range-dialog")).toBeVisible();
  });

  test("clicking the input shows all suggestions; clicking one picks it", async ({ page }) => {
    await page.getByTestId("label-input").click();

    const options = page.getByTestId("label-option");
    await expect(options).toHaveCount(4);
    await expect(options).toHaveText(["Dekýš", "Grécko", "Nemšová", "Praha"]);

    await options.filter({ hasText: "Praha" }).click();
    await expect(page.getByTestId("label-options")).not.toBeVisible();
    await expect(page.getByTestId("label-input")).toHaveValue("Praha");

    await page.getByTestId("save-btn").click();
    await expect(cell(page, "july", "2026-07-07").getByTestId("range-label")).toHaveText("Praha");
  });

  test("typing filters the suggestions, ignoring accents", async ({ page }) => {
    const input = page.getByTestId("label-input");
    await input.click();
    await input.pressSequentially("gre"); // should match "Grécko" despite the é

    const options = page.getByTestId("label-option");
    await expect(options).toHaveCount(1);
    await expect(options).toHaveText("Grécko");

    // Text matching no suggestion hides the panel but still works as a
    // custom label — free text is a first-class citizen.
    await input.fill("Mountains");
    await expect(page.getByTestId("label-options")).not.toBeVisible();
    await page.getByTestId("save-btn").click();
    await expect(cell(page, "july", "2026-07-07").getByTestId("range-label")).toHaveText("Mountains");
  });

  test("arrow keys + Enter pick an option without saving; next Enter saves", async ({ page }) => {
    const input = page.getByTestId("label-input");
    await input.click();
    await input.press("ArrowDown"); // highlight the first option (Dekýš)
    await input.press("Enter");     // pick it — must NOT save the dialog yet

    await expect(page.getByTestId("range-dialog")).toBeVisible();
    await expect(input).toHaveValue("Dekýš");

    await input.press("Enter");     // dropdown is closed now → saves
    await expect(page.getByTestId("range-dialog")).not.toBeVisible();
    await expect(cell(page, "july", "2026-07-07").getByTestId("range-label")).toHaveText("Dekýš");
  });

  test("Escape closes the dropdown first and the dialog second", async ({ page }) => {
    await page.getByTestId("label-input").click();
    await expect(page.getByTestId("label-options")).toBeVisible();

    await page.keyboard.press("Escape"); // 1st: closes only the panel
    await expect(page.getByTestId("label-options")).not.toBeVisible();
    await expect(page.getByTestId("range-dialog")).toBeVisible();

    await page.keyboard.press("Escape"); // 2nd: cancels the dialog
    await expect(page.getByTestId("range-dialog")).not.toBeVisible();
    await expectEmptyCalendar(page);
  });

  test("reopening the dropdown after picking a value shows all options again", async ({ page }) => {
    const input = page.getByTestId("label-input");
    await input.click();
    await page.getByTestId("label-option").filter({ hasText: "Praha" }).click();
    await expect(input).toHaveValue("Praha");

    // Clicking the input again must show the FULL list, not just the
    // option matching the already-selected value.
    await input.click();
    await expect(page.getByTestId("label-option")).toHaveCount(4);

    await page.getByTestId("label-option").filter({ hasText: "Grécko" }).click();
    await expect(input).toHaveValue("Grécko");
    await page.getByTestId("save-btn").click();
    await expect(cell(page, "july", "2026-07-07").getByTestId("range-label")).toHaveText("Grécko");
  });

  test("the edit dialog shows all options despite the pre-filled label", async ({ page }) => {
    // Save the pending dialog as Praha first, then reopen it for editing.
    await page.getByTestId("label-input").fill("Praha");
    await page.getByTestId("save-btn").click();
    await cell(page, "july", "2026-07-07").click(); // reopen the trip for editing

    await expect(page.getByTestId("label-input")).toHaveValue("Praha");
    await page.getByTestId("label-input").click();
    await expect(page.getByTestId("label-option")).toHaveCount(4);
  });

  test("the chevron button toggles the dropdown", async ({ page }) => {
    await page.getByTestId("label-dropdown-toggle").click();
    await expect(page.getByTestId("label-options")).toBeVisible();

    await page.getByTestId("label-dropdown-toggle").click();
    await expect(page.getByTestId("label-options")).not.toBeVisible();
  });

  test("ArrowUp moves the highlight back up before Enter picks it", async ({ page }) => {
    const input = page.getByTestId("label-input");
    await input.click();
    await input.press("ArrowDown"); // highlight Dekýš (index 0)
    await input.press("ArrowDown"); // highlight Grécko (index 1)
    await input.press("ArrowUp");   // back to Dekýš (index 0)
    await input.press("Enter");

    await expect(input).toHaveValue("Dekýš");
  });

  test("clicking elsewhere in the dialog closes the dropdown", async ({ page }) => {
    await page.getByTestId("label-input").click();
    await expect(page.getByTestId("label-options")).toBeVisible();

    // Press inside the dialog but outside the combobox (the heading).
    await page.getByTestId("range-dialog").locator("h3").click();
    await expect(page.getByTestId("label-options")).not.toBeVisible();
    await expect(page.getByTestId("range-dialog")).toBeVisible(); // dialog stays open
  });
});
