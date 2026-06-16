// Toast notifications: the overlap toast names the clashing range and
// auto-dismisses on its own.
import { test, expect } from "@playwright/test";
import { openApp, cell, dragSelect, createRange } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test.describe("toast notifications", () => {
  test("the overlap toast names the clashing range and disappears by itself", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-17"),
      "Existing trip");
    await dragSelect(page, cell(page, "july", "2026-07-20"), cell(page, "july", "2026-07-16"));

    const toast = page.getByTestId("toast");
    // The message tells the user WHICH range is in the way.
    await expect(toast).toContainText('Overlaps "Existing trip"');
    // …and auto-dismisses after ~2.5 seconds without any interaction.
    await expect(toast).toBeHidden({ timeout: 5000 });
  });
});
