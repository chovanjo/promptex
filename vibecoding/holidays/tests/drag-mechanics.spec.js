// Drag mechanics: live highlight, cursors, the selection badge, rounded
// ends, and releasing the mouse anywhere on the page.
import { test, expect } from "@playwright/test";
import { openApp, cell, createRange, expectEmptyCalendar } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test.describe("drag mechanics", () => {
  test("days are highlighted live while dragging", async ({ page }) => {
    await cell(page, "july", "2026-07-07").hover();
    await page.mouse.down();
    await cell(page, "july", "2026-07-09").hover();

    // The mouse is still down — the covered days show the preview ring.
    for (const day of ["07", "08", "09"]) {
      await expect(cell(page, "july", `2026-07-${day}`)).toHaveClass(/ring-blue-500/);
    }
    await expect(cell(page, "july", "2026-07-10")).not.toHaveClass(/ring-blue-500/);

    await page.mouse.up(); // finish the drag, then discard the range
    await page.getByTestId("cancel-btn").click();
    await expectEmptyCalendar(page);
  });

  test("day cells show the pointer (hand) cursor", async ({ page }) => {
    // Free days are clickable (drag to select / click to create)…
    await expect(cell(page, "july", "2026-07-10")).toHaveCSS("cursor", "pointer");
    // …and so are occupied days (click to edit) — both use the hand.
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-15"), "Trip");
    await expect(cell(page, "july", "2026-07-14")).toHaveCSS("cursor", "pointer");
  });

  test("the live selection badge shows the span while dragging", async ({ page }) => {
    await cell(page, "july", "2026-07-13").hover();
    await page.mouse.down();
    await cell(page, "july", "2026-07-17").hover();

    const badge = page.getByTestId("selection-badge");
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("Jul 13 – Jul 17 · 5 days");

    await page.mouse.up();
    await page.getByTestId("cancel-btn").click();
    await expect(badge).toBeHidden(); // gone once the drag is over
  });

  test("the live selection is rounded only at its two ends", async ({ page }) => {
    await cell(page, "july", "2026-07-13").hover();
    await page.mouse.down();
    await cell(page, "july", "2026-07-15").hover();

    await expect(cell(page, "july", "2026-07-13")).toHaveClass(/rounded-l-lg/);
    await expect(cell(page, "july", "2026-07-15")).toHaveClass(/rounded-r-lg/);
    // The middle day has neither rounded end.
    await expect(cell(page, "july", "2026-07-14")).not.toHaveClass(/rounded-[lr]-lg/);

    await page.mouse.up();
    await page.getByTestId("cancel-btn").click();
  });

  test("releasing the mouse outside the calendar still finalizes the selection", async ({ page }) => {
    // Use a top-row month (January) so the page heading is already in view —
    // reaching it needs no scroll, which would otherwise slide a day cell
    // under the cursor and extend the selection mid-drag.
    await cell(page, "january", "2026-01-07").hover();
    await page.mouse.down();
    await cell(page, "january", "2026-01-09").hover();
    // Wander off the day grid (over the page heading) before releasing —
    // the app listens for mouseup on the whole document, so this works.
    await page.getByRole("heading", { name: /Holiday Planner/ }).hover();
    await page.mouse.up();

    const dialog = page.getByTestId("range-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Jan 7 – Jan 9");
  });

  test("a saved range is rounded only at its two ends", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-15"), "Trip");

    await expect(cell(page, "july", "2026-07-13")).toHaveClass(/rounded-l-lg/);
    await expect(cell(page, "july", "2026-07-15")).toHaveClass(/rounded-r-lg/);
    // The middle day has neither rounded end — the range reads as one pill.
    await expect(cell(page, "july", "2026-07-14")).not.toHaveClass(/rounded-[lr]-lg/);
  });

  test("the selection badge uses the singular 'day' for a one-day press", async ({ page }) => {
    // Press a single free day without moving — the badge counts just one day.
    await cell(page, "july", "2026-07-20").hover();
    await page.mouse.down();

    await expect(page.getByTestId("selection-badge")).toHaveText("Jul 20 – Jul 20 · 1 day");

    await page.mouse.up();
    await page.getByTestId("cancel-btn").click(); // discard the pending 1-day range
  });
});
