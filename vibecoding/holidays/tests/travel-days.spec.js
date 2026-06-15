// Travel days: when one trip ends where the next begins, the shared day
// splits into leaving/arriving halves. Covers creating, chaining,
// editing each half, deleting, importing, and crossing the month line.
import { test, expect } from "@playwright/test";
import { openApp, cell, createRange, CLS, expectEmptyCalendar } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test.describe("travel days", () => {
  /** The split travel-day cell and its two halves for a July date. */
  function travelCell(page, iso) {
    const c = cell(page, "july", iso);
    return { cell: c, leaving: c.getByTestId("travel-leaving"), arriving: c.getByTestId("travel-arriving") };
  }

  test("dragging onto a trip's end day creates a split travel day", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-01"), cell(page, "july", "2026-07-03"),
      "Dekýš", "blue");
    // Drag the next trip from a free day (Jul 5) back onto Jul 3 — the
    // last day of Dekýš — making Jul 3 the shared travel day.
    await createRange(page, cell(page, "july", "2026-07-05"), cell(page, "july", "2026-07-03"),
      "Praha", "green");

    const jul3 = travelCell(page, "2026-07-03");
    await expect(jul3.cell).toHaveAttribute("data-testid", "travel-day");
    // Top half = the place you're leaving (Dekýš), bottom = arriving (Praha).
    await expect(jul3.leaving).toHaveClass(new RegExp(CLS.blue));
    await expect(jul3.leaving).toHaveText("Dekýš");
    await expect(jul3.arriving).toHaveClass(new RegExp(CLS.green));
    await expect(jul3.arriving).toHaveText("Praha");
    await expect(jul3.cell).toHaveAttribute("title", "Dekýš → Praha");

    // The non-shared days stay single-colored.
    await expect(cell(page, "july", "2026-07-02")).toHaveClass(new RegExp(CLS.blue));
    await expect(cell(page, "july", "2026-07-02").getByTestId("travel-leaving")).toHaveCount(0);
    await expect(cell(page, "july", "2026-07-04")).toHaveClass(new RegExp(CLS.green));
  });

  test("a new trip can start from an existing trip's first day (overlap the beginning)", async ({ page }) => {
    // Existing trip Praha Jul 15–17.
    await createRange(page, cell(page, "july", "2026-07-15"), cell(page, "july", "2026-07-17"),
      "Praha", "green");

    // Press ON Praha's first day (Jul 15) and drag LEFT onto free days —
    // previously this opened Edit; now it begins a new selection.
    await cell(page, "july", "2026-07-15").hover();
    await page.mouse.down();
    await cell(page, "july", "2026-07-13").hover();
    await page.mouse.up();

    // It's the CREATE dialog (not Edit), spanning Jul 13–15.
    const dialog = page.getByTestId("range-dialog");
    await expect(dialog).toContainText("New range");
    await expect(dialog).toContainText("Jul 13 – Jul 15");
    await page.getByTestId("label-input").fill("Dekýš");
    await dialog.locator("h3").click(); // dismiss suggestions
    await page.getByTestId("save-btn").click();

    // Jul 15 is now the shared travel day: leaving Dekýš, arriving Praha.
    const jul15 = travelCell(page, "2026-07-15");
    await expect(jul15.cell).toHaveAttribute("data-testid", "travel-day");
    await expect(jul15.leaving).toHaveText("Dekýš");
    await expect(jul15.arriving).toHaveText("Praha");
  });

  test("a plain click on a trip's edge still opens Edit (no drag)", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-15"), cell(page, "july", "2026-07-17"),
      "Praha", "green");

    // Click (no movement) on the first day → Edit, not a new selection.
    await cell(page, "july", "2026-07-15").click();
    await expect(page.getByTestId("range-dialog")).toContainText("Edit range");
    await expect(page.getByTestId("label-input")).toHaveValue("Praha");
  });

  test("the shared boundary day is highlighted while dragging onto it", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-15"),
      "Dekýš", "blue");

    // Drag a new trip from a free day (Jul 17) back onto Jul 15 — the end
    // of Dekýš — without releasing yet.
    await cell(page, "july", "2026-07-17").hover();
    await page.mouse.down();
    await cell(page, "july", "2026-07-15").hover();

    // The occupied Jul 15 cell shows the selection ring (it's included as
    // the shared day) AND the badge counts it.
    await expect(cell(page, "july", "2026-07-15")).toHaveClass(/ring-blue-500/);
    await expect(page.getByTestId("selection-badge")).toHaveText("Jul 15 – Jul 17 · 3 days");

    // Releasing + saving turns Jul 15 into the split travel day.
    await page.mouse.up();
    await page.getByTestId("label-input").fill("Praha");
    await page.getByTestId("range-dialog").locator("h3").click(); // dismiss suggestions
    await page.getByTestId("save-btn").click();
    await expect(travelCell(page, "2026-07-15").cell).toHaveAttribute("data-testid", "travel-day");
  });

  test("consecutive trips form a chain of travel days", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-01"), cell(page, "july", "2026-07-03"), "Dekýš", "blue");
    await createRange(page, cell(page, "july", "2026-07-05"), cell(page, "july", "2026-07-03"), "Praha", "green");
    await createRange(page, cell(page, "july", "2026-07-07"), cell(page, "july", "2026-07-05"), "Tábor", "red");

    // Both junction days are split.
    await expect(travelCell(page, "2026-07-03").cell).toHaveAttribute("data-testid", "travel-day");
    const jul5 = travelCell(page, "2026-07-05");
    await expect(jul5.leaving).toHaveText("Praha");
    await expect(jul5.arriving).toHaveText("Tábor");
    // All three trips exist — each shows on a day it solely owns.
    await expect(cell(page, "july", "2026-07-02").getByTestId("range-label")).toHaveText("Dekýš");
    await expect(cell(page, "july", "2026-07-04").getByTestId("range-label")).toHaveText("Praha");
    await expect(cell(page, "july", "2026-07-06").getByTestId("range-label")).toHaveText("Tábor");
  });

  test("each half of a travel day edits its own trip", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-01"), cell(page, "july", "2026-07-03"), "Dekýš", "blue");
    await createRange(page, cell(page, "july", "2026-07-05"), cell(page, "july", "2026-07-03"), "Praha", "green");

    const jul3 = travelCell(page, "2026-07-03");
    await jul3.leaving.click();
    await expect(page.getByTestId("label-input")).toHaveValue("Dekýš");
    await page.getByTestId("cancel-btn").click();

    await jul3.arriving.click();
    await expect(page.getByTestId("label-input")).toHaveValue("Praha");
  });

  test("deleting one trip un-splits the shared day", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-01"), cell(page, "july", "2026-07-03"), "Dekýš", "blue");
    await createRange(page, cell(page, "july", "2026-07-05"), cell(page, "july", "2026-07-03"), "Praha", "green");

    // Delete Dekýš (the leaving trip): open it from a day it solely owns
    // (Jul 2) and use the dialog's Delete button.
    await cell(page, "july", "2026-07-02").click();
    await page.getByTestId("delete-btn").click();

    // Jul 3 is now just Praha's first day — single color, no split.
    const jul3 = cell(page, "july", "2026-07-03");
    await expect(jul3.getByTestId("travel-leaving")).toHaveCount(0);
    await expect(jul3).toHaveClass(new RegExp(CLS.green));
    await expect(jul3.getByTestId("range-label")).toHaveText("Praha");
  });

  test("importing two boundary-sharing trips is allowed", async ({ page }) => {
    const fileContent = JSON.stringify({
      ranges: [
        { label: "Dekýš", color: "bg-blue-200", start: "2026-07-01", end: "2026-07-03" },
        { label: "Praha", color: "bg-green-200", start: "2026-07-03", end: "2026-07-05" },
      ],
    });
    await page.getByTestId("import-input").setInputFiles({
      name: "chain.json", mimeType: "application/json", buffer: Buffer.from(fileContent),
    });

    // Both trips landed; Jul 3 is their shared travel day.
    await expect(cell(page, "july", "2026-07-02").getByTestId("range-label")).toHaveText("Dekýš");
    await expect(cell(page, "july", "2026-07-04").getByTestId("range-label")).toHaveText("Praha");
    await expect(travelCell(page, "2026-07-03").cell).toHaveAttribute("data-testid", "travel-day");
  });

  test("importing three trips on one day is rejected", async ({ page }) => {
    const fileContent = JSON.stringify({
      ranges: [
        { label: "A", color: "bg-blue-200", start: "2026-07-01", end: "2026-07-03" },
        { label: "B", color: "bg-green-200", start: "2026-07-03", end: "2026-07-05" },
        { label: "C", color: "bg-red-200", start: "2026-07-03", end: "2026-07-03" },
      ],
    });
    await page.getByTestId("import-input").setInputFiles({
      name: "three.json", mimeType: "application/json", buffer: Buffer.from(fileContent),
    });

    await expect(page.getByTestId("toast")).toContainText(/more than two trips/i);
    await expectEmptyCalendar(page);
  });

  test("a travel day works across the month boundary (Jul → Aug)", async ({ page }) => {
    // Existing trip Praha Aug 1–3 (August grid).
    await createRange(page, cell(page, "august", "2026-08-01"), cell(page, "august", "2026-08-03"),
      "Praha", "green");

    // New trip dragged from Jul 29 (July grid) onto Aug 1 (August grid),
    // sharing Aug 1 — a boundary overlap that spans both calendars.
    await createRange(page, cell(page, "july", "2026-07-29"), cell(page, "august", "2026-08-01"),
      "Dekýš", "blue");

    // Aug 1 (August grid) is the split travel day: leaving Dekýš, arriving Praha.
    const aug1 = cell(page, "august", "2026-08-01");
    await expect(aug1).toHaveAttribute("data-testid", "travel-day");
    await expect(aug1.getByTestId("travel-leaving")).toHaveText("Dekýš");
    await expect(aug1.getByTestId("travel-arriving")).toHaveText("Praha");

    // The Dekýš days before the boundary show single-colored in the July grid.
    await expect(cell(page, "july", "2026-07-30")).toHaveClass(new RegExp(CLS.blue));
    await expect(cell(page, "july", "2026-07-30").getByTestId("travel-leaving")).toHaveCount(0);
  });

  test("a travel day on a public holiday still shows the holiday marker", async ({ page }) => {
    // Jul 5 is a Czech public holiday. Make it the shared travel day: one
    // trip ends on Jul 5, the next begins on Jul 5. The holiday dot must
    // still render on the split cell (a separate DayCell code path).
    await createRange(page, cell(page, "july", "2026-07-04"), cell(page, "july", "2026-07-05"),
      "Dekýš", "blue");
    await createRange(page, cell(page, "july", "2026-07-06"), cell(page, "july", "2026-07-05"),
      "Praha", "green");

    const jul5 = travelCell(page, "2026-07-05");
    await expect(jul5.cell).toHaveAttribute("data-testid", "travel-day");
    await expect(jul5.cell.getByTestId("holiday-marker")).toBeVisible();
  });

  test("deleting the middle trip of a chain un-splits both shared days", async ({ page }) => {
    // A chain: Dekýš Jul 1–3, Praha Jul 3–5, Tábor Jul 5–7 — so Jul 3 and
    // Jul 5 are both travel days (Praha is the middle trip).
    await createRange(page, cell(page, "july", "2026-07-01"), cell(page, "july", "2026-07-03"), "Dekýš", "blue");
    await createRange(page, cell(page, "july", "2026-07-05"), cell(page, "july", "2026-07-03"), "Praha", "green");
    await createRange(page, cell(page, "july", "2026-07-07"), cell(page, "july", "2026-07-05"), "Tábor", "red");

    // Delete the middle trip (Praha): open it from a day it solely owns
    // (Jul 4) and use the dialog's Delete button.
    await cell(page, "july", "2026-07-04").click();
    await page.getByTestId("delete-btn").click();

    // Both boundary days collapse back to single, un-split cells…
    for (const iso of ["2026-07-03", "2026-07-05"]) {
      await expect(cell(page, "july", iso)).not.toHaveAttribute("data-testid", "travel-day");
      await expect(cell(page, "july", iso).getByTestId("travel-leaving")).toHaveCount(0);
    }
    // …and the two outer trips are untouched (Praha's own day is now free).
    await expect(cell(page, "july", "2026-07-04").getByTestId("range-label")).toHaveCount(0);
    await expect(cell(page, "july", "2026-07-03").getByTestId("range-label")).toHaveText("Dekýš");
    await expect(cell(page, "july", "2026-07-05").getByTestId("range-label")).toHaveText("Tábor");
  });
});
