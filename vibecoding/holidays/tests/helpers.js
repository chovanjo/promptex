// Shared helpers for the Holiday Planner e2e suite. The tests are split
// into one `*.spec.js` file per feature area; each imports the helpers it
// needs from here. This file is NOT a spec (no `.spec` in its name), so
// Playwright never runs it directly.
import { expect } from "@playwright/test";

/**
 * Open the app and wait until React has actually rendered.
 * Vite serves the compiled modules from the dev server (started
 * automatically by Playwright — see `webServer` in the config); the
 * base URL is set there, so we navigate to "/". There is still a
 * short moment where the page is loaded but React has not mounted yet.
 */
export async function openApp(page) {
  await page.goto("/");
  await expect(page.getByTestId("month-july")).toBeVisible();
}

/**
 * Locator for one day cell, scoped to a month grid.
 * Scoping matters: dates near month boundaries exist in BOTH grids
 * (e.g. Jul 30 is a real day in July and a filler day in August), so a
 * bare [data-date=…] selector would match two elements.
 */
export function cell(page, month, iso) {
  return page.getByTestId(`month-${month}`).locator(`[data-date="${iso}"]`);
}

/**
 * Simulate the user dragging from one day to another:
 * press the mouse on the start cell, move to the end cell, release.
 */
export async function dragSelect(page, fromCell, toCell) {
  await fromCell.hover();
  await page.mouse.down();
  await toCell.hover();
  await page.mouse.up();
}

/**
 * Typing in the label field may open the suggestion dropdown, which
 * floats over the color swatches. A real user sees it and clicks
 * elsewhere to dismiss it — we do the same by clicking the dialog's
 * heading (inside the dialog, outside the combobox).
 */
export async function dismissSuggestions(page) {
  await page.getByTestId("range-dialog").locator("h3").click();
}

/**
 * Full "create a range" flow used by many tests:
 * drag, then fill in the dialog and save.
 */
export async function createRange(page, fromCell, toCell, label, presetName = "blue") {
  await dragSelect(page, fromCell, toCell);
  await expect(page.getByTestId("range-dialog")).toBeVisible();
  await page.getByTestId("label-input").fill(label);
  await dismissSuggestions(page);
  await page.getByTestId(`color-${presetName}`).click();
  await page.getByTestId("save-btn").click();
  await expect(page.getByTestId("range-dialog")).not.toBeVisible();
}

/** The app stores colors as Tailwind background classes (see
    PRESET_COLORS in src/constants.js), so tests assert class membership.
    (Asserting the computed CSS value would be brittle: Tailwind 4
    resolves its palette to oklch() colors, not rgb().) */
export const CLS = { red: "bg-red-200", green: "bg-green-200", blue: "bg-blue-200", violet: "bg-violet-200" };

/**
 * Assert the calendar holds no trips at all. The planner has no separate
 * list any more, so "nothing is planned" is read straight off the grid:
 * single-day/range cells render a `range-label`, travel days render a
 * `travel-leaving` half — an empty plan shows neither.
 */
export async function expectEmptyCalendar(page) {
  await expect(page.getByTestId("range-label")).toHaveCount(0);
  await expect(page.getByTestId("travel-leaving")).toHaveCount(0);
}
