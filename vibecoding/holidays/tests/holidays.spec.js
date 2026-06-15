// =====================================================================
// End-to-end tests for the Holiday Planner (index.html).
//
// Structure: shared helpers at the top, then one `describe` block per
// feature area. Every test starts from a fresh, empty app (beforeEach),
// so tests never depend on each other and can run in parallel.
// =====================================================================
import { test, expect } from "@playwright/test";
import fs from "node:fs";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Open the app and wait until React has actually rendered.
 * Vite serves the compiled modules from the dev server (started
 * automatically by Playwright — see `webServer` in the config); the
 * base URL is set there, so we navigate to "/". There is still a
 * short moment where the page is loaded but React has not mounted yet.
 */
async function openApp(page) {
  await page.goto("/");
  await expect(page.getByTestId("month-july")).toBeVisible();
}

/**
 * Locator for one day cell, scoped to a month grid.
 * Scoping matters: dates near month boundaries exist in BOTH grids
 * (e.g. Jul 30 is a real day in July and a filler day in August), so a
 * bare [data-date=…] selector would match two elements.
 */
function cell(page, month, iso) {
  return page.getByTestId(`month-${month}`).locator(`[data-date="${iso}"]`);
}

/**
 * Simulate the user dragging from one day to another:
 * press the mouse on the start cell, move to the end cell, release.
 */
async function dragSelect(page, fromCell, toCell) {
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
async function dismissSuggestions(page) {
  await page.getByTestId("range-dialog").locator("h3").click();
}

/**
 * Full "create a range" flow used by many tests:
 * drag, then fill in the dialog and save.
 */
async function createRange(page, fromCell, toCell, label, presetName = "blue") {
  await dragSelect(page, fromCell, toCell);
  await expect(page.getByTestId("range-dialog")).toBeVisible();
  await page.getByTestId("label-input").fill(label);
  await dismissSuggestions(page);
  await page.getByTestId(`color-${presetName}`).click();
  await page.getByTestId("save-btn").click();
  await expect(page.getByTestId("range-dialog")).not.toBeVisible();
}

/** The app stores colors as Tailwind background classes (see
    PRESET_COLORS in index.html), so tests assert class membership.
    (Asserting the computed CSS value would be brittle: Tailwind 4
    resolves its palette to oklch() colors, not rgb().) */
const CLS = { red: "bg-red-200", green: "bg-green-200", blue: "bg-blue-200", violet: "bg-violet-200" };

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

/* ------------------------------------------------------------------ */
/* 1. Calendar grid layout                                             */
/* ------------------------------------------------------------------ */

test.describe("calendar grid", () => {
  test("shows Monday-first weekday headers in both months", async ({ page }) => {
    for (const month of ["july", "august"]) {
      const headers = page.getByTestId(`month-${month}`).locator(".grid").first().locator("div");
      await expect(headers).toHaveText(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    }
  });

  test("July grid runs Jun 22 – Jul 31 with Jul 1 on Wednesday", async ({ page }) => {
    const days = page.getByTestId("month-july").locator("[data-date]");
    await expect(days).toHaveCount(40); // 6 weeks minus the 2 blanked Aug days

    // One full extra June week (Jun 22–28) precedes July's own first week.
    await expect(days.nth(0)).toHaveAttribute("data-date", "2026-06-22");
    await expect(days.nth(7)).toHaveAttribute("data-date", "2026-06-29");
    // Jul 1 sits in the Wednesday column of the second displayed week.
    await expect(days.nth(9)).toHaveAttribute("data-date", "2026-07-01");
    // Last real cell is Jul 31; Aug 1–2 are blank placeholders because
    // those dates belong to the August card.
    await expect(days.nth(39)).toHaveAttribute("data-date", "2026-07-31");
    await expect(page.getByTestId("month-july").getByTestId("blank-day")).toHaveCount(2);
  });

  test("August grid runs Aug 1 – Sep 6 (September filler in the last week)", async ({ page }) => {
    const days = page.getByTestId("month-august").locator("[data-date]");
    await expect(days).toHaveCount(37); // 6 weeks minus the 5 blanked Jul days

    // Aug 1 is a Saturday — the Mon–Fri slots before it are blank
    // placeholders (those July dates live in the July card).
    await expect(days.nth(0)).toHaveAttribute("data-date", "2026-08-01");
    await expect(page.getByTestId("month-august").getByTestId("blank-day")).toHaveCount(5);
    // Aug 31 is a Monday; Sep 1–6 complete the final week.
    await expect(days.nth(30)).toHaveAttribute("data-date", "2026-08-31");
    await expect(days.nth(36)).toHaveAttribute("data-date", "2026-09-06");
  });

  test("no date appears in both month grids", async ({ page }) => {
    // The whole boundary week used to be duplicated; now each date
    // exists exactly once across the entire page.
    for (const iso of ["2026-07-27", "2026-07-30", "2026-07-31", "2026-08-01", "2026-08-02"]) {
      await expect(page.locator(`[data-date="${iso}"]`)).toHaveCount(1);
    }
  });

  test("filler days are dimmed, in-month days are not", async ({ page }) => {
    // Jun 30 is a filler day in July's grid → gray text class.
    await expect(cell(page, "july", "2026-06-30")).toHaveClass(/text-gray-400/);
    await expect(cell(page, "july", "2026-07-01")).not.toHaveClass(/text-gray-400/);
  });

  test("weekend days get the subtle gray tint, weekdays stay white", async ({ page }) => {
    // Jul 11 is a Saturday, Jul 12 a Sunday, Jul 10 a Friday.
    await expect(cell(page, "july", "2026-07-11")).toHaveClass(/bg-gray-50/);
    await expect(cell(page, "july", "2026-07-12")).toHaveClass(/bg-gray-50/);
    await expect(cell(page, "july", "2026-07-10")).not.toHaveClass(/bg-gray-50/);
  });

  test("marks the Czech public holidays (Jul 5 and Jul 6)", async ({ page }) => {
    await expect(cell(page, "july", "2026-07-05").getByTestId("holiday-marker")).toBeVisible();
    await expect(cell(page, "july", "2026-07-06").getByTestId("holiday-marker")).toBeVisible();
    // An ordinary day has no marker.
    await expect(cell(page, "july", "2026-07-07").getByTestId("holiday-marker")).toHaveCount(0);
    // The hover tooltip was replaced by the legend, so no title here.
    await expect(cell(page, "july", "2026-07-06")).toHaveAttribute("title", "");
  });

  test("shows a legend naming each public holiday", async ({ page }) => {
    const legend = page.getByTestId("holiday-legend");
    await expect(legend).toBeVisible();
    await expect(legend).toContainText("Jul 5 — Saints Cyril and Methodius Day");
    await expect(legend).toContainText("Jul 6 — Jan Hus Day");
  });

  test("the holiday marker still shows on a day covered by a range", async ({ page }) => {
    // Painting a range over Jul 5–6 must not hide their holiday dots.
    await createRange(page, cell(page, "july", "2026-07-04"), cell(page, "july", "2026-07-06"),
      "Long weekend", "green");

    await expect(cell(page, "july", "2026-07-05").getByTestId("holiday-marker")).toBeVisible();
    await expect(cell(page, "july", "2026-07-06").getByTestId("holiday-marker")).toBeVisible();
  });
});

/* ------------------------------------------------------------------ */
/* 2. Creating ranges                                                  */
/* ------------------------------------------------------------------ */

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

    // And the range appears in the list with its date span.
    const item = page.getByTestId("range-item");
    await expect(item).toHaveCount(1);
    await expect(item).toContainText("Beach trip");
    await expect(item).toContainText("Jul 13 – Jul 17 · 5d");
  });

  test("dragging backwards (Jul 17 → Jul 13) produces the same range", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-17"), cell(page, "july", "2026-07-13"),
      "Backwards");

    await expect(page.getByTestId("range-item")).toContainText("Jul 13 – Jul 17 · 5d");
    // The chronological start (Jul 13) is part of the range and carries
    // the label, even though the drag started on Jul 17.
    await expect(cell(page, "july", "2026-07-13").getByTestId("range-label")).toHaveText("Backwards");
  });

  test("a single click creates a one-day range", async ({ page }) => {
    await cell(page, "august", "2026-08-10").click();
    await expect(page.getByTestId("range-dialog")).toBeVisible();
    await page.getByTestId("label-input").fill("Day off");
    await page.getByTestId("save-btn").click();

    await expect(page.getByTestId("range-item")).toContainText("Aug 10 – Aug 10 · 1d");
  });

  test("a range can span the July/August boundary across the two grids", async ({ page }) => {
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
    await expect(page.getByTestId("range-item")).toContainText("Jul 30 – Aug 2 · 4d");
  });

  test("a range can be planned on the extra June week", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-06-22"), cell(page, "july", "2026-06-26"),
      "Late June", "green");

    await expect(cell(page, "july", "2026-06-24")).toHaveClass(new RegExp(CLS.green));
    await expect(page.getByTestId("range-item")).toContainText("Jun 22 – Jun 26 · 5d");
  });

  test("an empty label falls back to a default name", async ({ page }) => {
    await dragSelect(page, cell(page, "july", "2026-07-20"), cell(page, "july", "2026-07-21"));
    await page.getByTestId("save-btn").click(); // save without typing anything
    await expect(page.getByTestId("range-item")).toContainText("Holiday");
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
    await expect(page.getByTestId("range-item")).toContainText("Quick save");
  });

  test("a new range uses the default pastel blue when no color is picked", async ({ page }) => {
    await dragSelect(page, cell(page, "august", "2026-08-03"), cell(page, "august", "2026-08-05"));
    await page.getByTestId("label-input").fill("Default blue");
    await page.getByTestId("save-btn").click();

    await expect(cell(page, "august", "2026-08-04")).toHaveClass(new RegExp(CLS.blue));
  });
});

/* ------------------------------------------------------------------ */
/* 2a. Label dropdown (custom combobox)                                */
/* ------------------------------------------------------------------ */

test.describe("label dropdown", () => {
  // Every test here starts with the create dialog open.
  test.beforeEach(async ({ page }) => {
    await dragSelect(page, cell(page, "july", "2026-07-06"), cell(page, "july", "2026-07-08"));
    await expect(page.getByTestId("range-dialog")).toBeVisible();
  });

  test("clicking the input shows all suggestions; clicking one picks it", async ({ page }) => {
    await page.getByTestId("label-input").click();

    const options = page.getByTestId("label-option");
    await expect(options).toHaveCount(5);
    await expect(options).toHaveText(["Dekýš", "Praha", "Tábor", "Nemšová", "Grécko"]);

    await options.filter({ hasText: "Praha" }).click();
    await expect(page.getByTestId("label-options")).not.toBeVisible();
    await expect(page.getByTestId("label-input")).toHaveValue("Praha");

    await page.getByTestId("save-btn").click();
    await expect(page.getByTestId("range-item")).toContainText("Praha");
  });

  test("typing filters the suggestions, ignoring accents", async ({ page }) => {
    const input = page.getByTestId("label-input");
    await input.click();
    await input.pressSequentially("ta"); // should match "Tábor" despite the á

    const options = page.getByTestId("label-option");
    await expect(options).toHaveCount(1);
    await expect(options).toHaveText("Tábor");

    // Text matching no suggestion hides the panel but still works as a
    // custom label — free text is a first-class citizen.
    await input.fill("Mountains");
    await expect(page.getByTestId("label-options")).not.toBeVisible();
    await page.getByTestId("save-btn").click();
    await expect(page.getByTestId("range-item")).toContainText("Mountains");
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
    await expect(page.getByTestId("range-item")).toContainText("Dekýš");
  });

  test("Escape closes the dropdown first and the dialog second", async ({ page }) => {
    await page.getByTestId("label-input").click();
    await expect(page.getByTestId("label-options")).toBeVisible();

    await page.keyboard.press("Escape"); // 1st: closes only the panel
    await expect(page.getByTestId("label-options")).not.toBeVisible();
    await expect(page.getByTestId("range-dialog")).toBeVisible();

    await page.keyboard.press("Escape"); // 2nd: cancels the dialog
    await expect(page.getByTestId("range-dialog")).not.toBeVisible();
    await expect(page.getByTestId("range-item")).toHaveCount(0);
  });

  test("reopening the dropdown after picking a value shows all options again", async ({ page }) => {
    const input = page.getByTestId("label-input");
    await input.click();
    await page.getByTestId("label-option").filter({ hasText: "Praha" }).click();
    await expect(input).toHaveValue("Praha");

    // Clicking the input again must show the FULL list, not just the
    // option matching the already-selected value.
    await input.click();
    await expect(page.getByTestId("label-option")).toHaveCount(5);

    await page.getByTestId("label-option").filter({ hasText: "Grécko" }).click();
    await expect(input).toHaveValue("Grécko");
    await page.getByTestId("save-btn").click();
    await expect(page.getByTestId("range-item")).toContainText("Grécko");
  });

  test("the edit dialog shows all options despite the pre-filled label", async ({ page }) => {
    // Save the pending dialog as Praha first, then reopen it for editing.
    await page.getByTestId("label-input").fill("Praha");
    await page.getByTestId("save-btn").click();
    await page.getByTestId("range-item").getByTestId("edit-range-btn").click();

    await expect(page.getByTestId("label-input")).toHaveValue("Praha");
    await page.getByTestId("label-input").click();
    await expect(page.getByTestId("label-option")).toHaveCount(5);
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
    await input.press("ArrowDown"); // highlight Praha (index 1)
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

/* ------------------------------------------------------------------ */
/* 2b. Drag mechanics                                                  */
/* ------------------------------------------------------------------ */

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
    await expect(page.getByTestId("range-item")).toHaveCount(0);
  });

  test("free days show the 'cell' cursor, occupied days the pointer", async ({ page }) => {
    // A free day invites selection (cursor: cell)…
    await expect(cell(page, "july", "2026-07-10")).toHaveCSS("cursor", "cell");
    // …an occupied day is click-to-edit (cursor: pointer).
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
    await cell(page, "july", "2026-07-07").hover();
    await page.mouse.down();
    await cell(page, "july", "2026-07-09").hover();
    // Wander off the day grid (over the page heading) before releasing —
    // the app listens for mouseup on the whole document, so this works.
    await page.getByRole("heading", { name: /Holiday Planner/ }).hover();
    await page.mouse.up();

    const dialog = page.getByTestId("range-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Jul 7 – Jul 9");
  });
});

/* ------------------------------------------------------------------ */
/* 3. Overlap prevention                                               */
/* ------------------------------------------------------------------ */

test.describe("overlap prevention", () => {
  test("a selection crossing an existing range is rejected with a toast", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-17"),
      "Existing");

    // Try to drag Jul 16 → Jul 20, which collides with Jul 13–17.
    // The drag must start on a FREE day (clicking inside a range opens
    // its edit dialog instead), so we start from Jul 20 and drag back.
    await dragSelect(page, cell(page, "july", "2026-07-20"), cell(page, "july", "2026-07-16"));

    await expect(page.getByTestId("toast")).toContainText("cannot overlap");
    await expect(page.getByTestId("range-dialog")).not.toBeVisible();
    await expect(page.getByTestId("range-item")).toHaveCount(1); // still just the original
  });

  test("a new range that fully contains an existing one is rejected", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-15"),
      "Existing");

    // Drag from a free day, across the whole existing range, to another
    // free day — a multi-day (containment) overlap, not just a boundary.
    await dragSelect(page, cell(page, "july", "2026-07-10"), cell(page, "july", "2026-07-18"));

    await expect(page.getByTestId("toast")).toContainText("cannot overlap");
    await expect(page.getByTestId("range-dialog")).not.toBeVisible();
    await expect(page.getByTestId("range-item")).toHaveCount(1);
  });
});

/* ------------------------------------------------------------------ */
/* 3b. Travel days (one trip ends where the next begins)              */
/* ------------------------------------------------------------------ */

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
    await expect(page.getByTestId("range-item")).toHaveCount(3);
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

    // Delete Dekýš (the leaving trip) via its list row.
    await page.getByTestId("range-item").filter({ hasText: "Dekýš" }).getByTestId("delete-range-btn").click();

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

    await expect(page.getByTestId("range-item")).toHaveCount(2);
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
    await expect(page.getByTestId("range-item")).toHaveCount(0);
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
});

/* ------------------------------------------------------------------ */
/* 4. Cancelling                                                       */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* 5. Editing and deleting                                             */
/* ------------------------------------------------------------------ */

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
});

/* ------------------------------------------------------------------ */
/* 6. Colors                                                           */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* 6b. Toast notifications                                             */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* 6c. Range list                                                      */
/* ------------------------------------------------------------------ */

test.describe("range list", () => {
  test("ranges are listed in date order, not creation order", async ({ page }) => {
    // Create the August range FIRST, then the July one.
    await createRange(page, cell(page, "august", "2026-08-10"), cell(page, "august", "2026-08-12"),
      "Second by date");
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-15"),
      "First by date");

    const items = page.getByTestId("range-item");
    await expect(items.nth(0)).toContainText("First by date");
    await expect(items.nth(1)).toContainText("Second by date");
  });

  test("hovering a list row highlights the range's days in the calendar", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-15"),
      "Hover me");

    await page.getByTestId("range-item").hover();
    for (const day of ["13", "14", "15"]) {
      await expect(cell(page, "july", `2026-07-${day}`)).toHaveClass(/ring-gray-700/);
    }
    // Moving the mouse away removes the highlight again.
    await page.getByRole("heading", { name: /Holiday Planner/ }).hover();
    await expect(cell(page, "july", "2026-07-14")).not.toHaveClass(/ring-gray-700/);
  });
});

/* ------------------------------------------------------------------ */
/* 7. Export / import / clear                                          */
/* ------------------------------------------------------------------ */

test.describe("export, import and clear", () => {
  test("Export downloads a JSON file with all ranges", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-17"),
      "Beach", "green");
    await createRange(page, cell(page, "august", "2026-08-10"), cell(page, "august", "2026-08-14"),
      "Mountains", "red");

    // Start waiting for the download BEFORE clicking — otherwise the
    // event could fire before we listen for it (a classic race).
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-btn").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("holidays-2026.json");
    const data = JSON.parse(fs.readFileSync(await download.path(), "utf-8"));

    expect(data.ranges).toHaveLength(2);
    // Colors are exported as Tailwind class names, not hex values.
    expect(data.ranges).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Beach", start: "2026-07-13", end: "2026-07-17", color: "bg-green-200" }),
      expect.objectContaining({ label: "Mountains", start: "2026-08-10", end: "2026-08-14", color: "bg-red-200" }),
    ]));
  });

  test("Import restores ranges from a valid JSON file", async ({ page }) => {
    const fileContent = JSON.stringify({
      ranges: [
        { id: "x", label: "Imported trip", color: "bg-green-200", start: "2026-07-13", end: "2026-07-17" },
      ],
    });
    // setInputFiles can take an in-memory "file" — no temp file needed.
    await page.getByTestId("import-input").setInputFiles({
      name: "holidays.json", mimeType: "application/json", buffer: Buffer.from(fileContent),
    });

    await expect(page.getByTestId("toast")).toContainText("Imported 1 range(s)");
    await expect(page.getByTestId("range-item")).toContainText("Imported trip");
    await expect(cell(page, "july", "2026-07-15")).toHaveClass(new RegExp(CLS.green));
  });

  test("export → clear → import round-trips the exact same plan", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-17"),
      "Round trip", "green");

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-btn").click();
    const exported = fs.readFileSync(await (await downloadPromise).path(), "utf-8");

    // Wipe everything (accept the confirm dialog)…
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByTestId("clear-btn").click();
    await expect(page.getByTestId("range-item")).toHaveCount(0);

    // …then import the exported file: the plan must be back, identical.
    await page.getByTestId("import-input").setInputFiles({
      name: "export.json", mimeType: "application/json", buffer: Buffer.from(exported),
    });
    await expect(page.getByTestId("range-item")).toContainText("Round trip");
    await expect(page.getByTestId("range-item")).toContainText("Jul 13 – Jul 17 · 5d");
  });

  test("importing a malformed file shows an error and keeps current state", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-17"),
      "Keep me");

    await page.getByTestId("import-input").setInputFiles({
      name: "broken.json", mimeType: "application/json", buffer: Buffer.from("this is not json {"),
    });

    await expect(page.getByTestId("toast")).toContainText("Import failed");
    await expect(page.getByTestId("range-item")).toHaveCount(1);
    await expect(page.getByTestId("range-item")).toContainText("Keep me");
  });

  test("importing a file without a ranges array is rejected", async ({ page }) => {
    await page.getByTestId("import-input").setInputFiles({
      name: "wrong-shape.json", mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ holidays: [] })), // valid JSON, wrong shape
    });

    await expect(page.getByTestId("toast")).toContainText("must contain");
    await expect(page.getByTestId("range-item")).toHaveCount(0);
  });

  test("importing a range that ends before it starts is rejected", async ({ page }) => {
    const fileContent = JSON.stringify({
      ranges: [{ label: "Backwards", color: "bg-red-200", start: "2026-07-20", end: "2026-07-10" }],
    });
    await page.getByTestId("import-input").setInputFiles({
      name: "backwards.json", mimeType: "application/json", buffer: Buffer.from(fileContent),
    });

    await expect(page.getByTestId("toast")).toContainText("ends before it starts");
    await expect(page.getByTestId("range-item")).toHaveCount(0);
  });

  test("importing a range with a missing label is rejected", async ({ page }) => {
    const fileContent = JSON.stringify({
      ranges: [{ color: "bg-red-200", start: "2026-07-10", end: "2026-07-12" }], // no label
    });
    await page.getByTestId("import-input").setInputFiles({
      name: "no-label.json", mimeType: "application/json", buffer: Buffer.from(fileContent),
    });

    await expect(page.getByTestId("toast")).toContainText("Each range needs");
    await expect(page.getByTestId("range-item")).toHaveCount(0);
  });

  test("importing a range with a malformed date is rejected", async ({ page }) => {
    const fileContent = JSON.stringify({
      ranges: [{ label: "Bad date", color: "bg-red-200", start: "notadate", end: "2026-07-12" }],
    });
    await page.getByTestId("import-input").setInputFiles({
      name: "bad-date.json", mimeType: "application/json", buffer: Buffer.from(fileContent),
    });

    await expect(page.getByTestId("toast")).toContainText("Each range needs");
    await expect(page.getByTestId("range-item")).toHaveCount(0);
  });

  test("importing an empty ranges array is accepted and clears the plan", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-15"),
      "Will be cleared");

    await page.getByTestId("import-input").setInputFiles({
      name: "empty.json", mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ ranges: [] })),
    });

    await expect(page.getByTestId("toast")).toContainText("Imported 0 range(s)");
    await expect(page.getByTestId("range-item")).toHaveCount(0);
    await expect(page.getByTestId("empty-hint")).toBeVisible();
  });

  test("a successful import replaces the existing ranges", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-15"),
      "Old plan", "green");

    const fileContent = JSON.stringify({
      ranges: [{ label: "New plan", color: "bg-red-200", start: "2026-08-10", end: "2026-08-12" }],
    });
    await page.getByTestId("import-input").setInputFiles({
      name: "new-plan.json", mimeType: "application/json", buffer: Buffer.from(fileContent),
    });

    // Import is a full replace, not a merge.
    await expect(page.getByTestId("range-item")).toHaveCount(1);
    await expect(page.getByTestId("range-item")).toContainText("New plan");
    await expect(cell(page, "july", "2026-07-14")).not.toHaveClass(new RegExp(CLS.green));
  });

  test("importing a range with a non-Tailwind color (old hex format) is rejected", async ({ page }) => {
    const fileContent = JSON.stringify({
      ranges: [{ label: "Old format", color: "#22c55e", start: "2026-07-13", end: "2026-07-17" }],
    });
    await page.getByTestId("import-input").setInputFiles({
      name: "old-format.json", mimeType: "application/json", buffer: Buffer.from(fileContent),
    });

    await expect(page.getByTestId("toast")).toContainText("invalid color");
    await expect(page.getByTestId("range-item")).toHaveCount(0);
  });

  test("importing ranges that overlap each other is rejected", async ({ page }) => {
    const fileContent = JSON.stringify({
      ranges: [
        { label: "A", color: "bg-red-200", start: "2026-07-10", end: "2026-07-15" },
        { label: "B", color: "bg-green-200", start: "2026-07-14", end: "2026-07-20" },
      ],
    });
    await page.getByTestId("import-input").setInputFiles({
      name: "overlapping.json", mimeType: "application/json", buffer: Buffer.from(fileContent),
    });

    await expect(page.getByTestId("toast")).toContainText("overlap");
    await expect(page.getByTestId("range-item")).toHaveCount(0);
  });

  test("Clear all empties the planner after confirmation", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-17"), "A");
    await createRange(page, cell(page, "august", "2026-08-10"), cell(page, "august", "2026-08-12"), "B");
    await expect(page.getByTestId("range-item")).toHaveCount(2);

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByTestId("clear-btn").click();

    await expect(page.getByTestId("range-item")).toHaveCount(0);
    await expect(page.getByTestId("empty-hint")).toBeVisible();
  });

  test("declining the Clear all confirmation keeps the ranges", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-17"), "Safe");

    page.once("dialog", (dialog) => dialog.dismiss()); // click "Cancel" in the confirm box
    await page.getByTestId("clear-btn").click();

    await expect(page.getByTestId("range-item")).toHaveCount(1);
  });
});
