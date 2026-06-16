// Shared helpers for the Holiday Planner e2e suite. The tests are split
// into one `*.spec.js` file per feature area; each imports the helpers it
// needs from here. This file is NOT a spec (no `.spec` in its name), so
// Playwright never runs it directly.
import { expect } from "@playwright/test";

/** The year the suite pins the calendar to (see openApp). Fixed so
    date-based tests stay deterministic no matter the real clock. */
export const TEST_YEAR = 2026;

/**
 * Open the app, wait for React to render, and pin the calendar to
 * TEST_YEAR. Vite serves the compiled modules from the dev server
 * (started automatically by Playwright — see `webServer` in the config);
 * the base URL is set there, so we navigate to "/". The app defaults to
 * the *current* year, so we step it to TEST_YEAR for deterministic dates.
 */
export async function openApp(page) {
  await page.goto("/");
  await expect(page.getByTestId("month-january")).toBeVisible();
  await setYear(page, TEST_YEAR);
}

/**
 * Step the year switcher until `year-display` shows `target`.
 * Clicks `year-next` / `year-prev` as needed.
 */
export async function setYear(page, target) {
  const display = page.getByTestId("year-display");
  for (let guard = 0; guard < 60; guard++) {
    const current = parseInt((await display.textContent()).trim(), 10);
    if (current === target) return;
    await page.getByTestId(current < target ? "year-next" : "year-prev").click();
  }
  throw new Error(`Could not reach year ${target}`);
}

/**
 * Locator for one real day cell, scoped to a month grid. Only in-month
 * days carry `data-date` (filler days are inert placeholders), so a date
 * resolves to exactly one cell; the month scope just keeps intent clear.
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
