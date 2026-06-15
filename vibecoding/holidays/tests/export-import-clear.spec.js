// Export / import / clear: JSON round-trips, import validation (shape,
// dates, colors, overlaps), full-replace semantics, and Clear all.
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { openApp, cell, createRange, CLS, expectEmptyCalendar } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

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
    await expect(cell(page, "july", "2026-07-15").getByTestId("range-label")).toHaveText("Imported trip");
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
    await expectEmptyCalendar(page);

    // …then import the exported file: the plan must be back, identical.
    await page.getByTestId("import-input").setInputFiles({
      name: "export.json", mimeType: "application/json", buffer: Buffer.from(exported),
    });
    await expect(cell(page, "july", "2026-07-13").getByTestId("range-label")).toHaveText("Round trip");
    await expect(cell(page, "july", "2026-07-17").getByTestId("range-label")).toHaveText("Round trip");
  });

  test("importing a malformed file shows an error and keeps current state", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-17"),
      "Keep me");

    await page.getByTestId("import-input").setInputFiles({
      name: "broken.json", mimeType: "application/json", buffer: Buffer.from("this is not json {"),
    });

    await expect(page.getByTestId("toast")).toContainText("Import failed");
    // The existing trip is untouched.
    await expect(cell(page, "july", "2026-07-15").getByTestId("range-label")).toHaveText("Keep me");
  });

  test("importing a file without a ranges array is rejected", async ({ page }) => {
    await page.getByTestId("import-input").setInputFiles({
      name: "wrong-shape.json", mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ holidays: [] })), // valid JSON, wrong shape
    });

    await expect(page.getByTestId("toast")).toContainText("must contain");
    await expectEmptyCalendar(page);
  });

  test("importing a range that ends before it starts is rejected", async ({ page }) => {
    const fileContent = JSON.stringify({
      ranges: [{ label: "Backwards", color: "bg-red-200", start: "2026-07-20", end: "2026-07-10" }],
    });
    await page.getByTestId("import-input").setInputFiles({
      name: "backwards.json", mimeType: "application/json", buffer: Buffer.from(fileContent),
    });

    await expect(page.getByTestId("toast")).toContainText("ends before it starts");
    await expectEmptyCalendar(page);
  });

  test("importing a range with a missing label is rejected", async ({ page }) => {
    const fileContent = JSON.stringify({
      ranges: [{ color: "bg-red-200", start: "2026-07-10", end: "2026-07-12" }], // no label
    });
    await page.getByTestId("import-input").setInputFiles({
      name: "no-label.json", mimeType: "application/json", buffer: Buffer.from(fileContent),
    });

    await expect(page.getByTestId("toast")).toContainText("Each range needs");
    await expectEmptyCalendar(page);
  });

  test("importing a range with a malformed date is rejected", async ({ page }) => {
    const fileContent = JSON.stringify({
      ranges: [{ label: "Bad date", color: "bg-red-200", start: "notadate", end: "2026-07-12" }],
    });
    await page.getByTestId("import-input").setInputFiles({
      name: "bad-date.json", mimeType: "application/json", buffer: Buffer.from(fileContent),
    });

    await expect(page.getByTestId("toast")).toContainText("Each range needs");
    await expectEmptyCalendar(page);
  });

  test("importing an empty ranges array is accepted and clears the plan", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-15"),
      "Will be cleared");

    await page.getByTestId("import-input").setInputFiles({
      name: "empty.json", mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ ranges: [] })),
    });

    await expect(page.getByTestId("toast")).toContainText("Imported 0 range(s)");
    await expectEmptyCalendar(page);
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

    // Import is a full replace, not a merge: the new plan shows and the
    // old plan's days are blank again.
    await expect(cell(page, "august", "2026-08-11").getByTestId("range-label")).toHaveText("New plan");
    await expect(cell(page, "july", "2026-07-14")).not.toHaveClass(new RegExp(CLS.green));
    await expect(cell(page, "july", "2026-07-14").getByTestId("range-label")).toHaveCount(0);
  });

  test("importing a range with a non-Tailwind color (old hex format) is rejected", async ({ page }) => {
    const fileContent = JSON.stringify({
      ranges: [{ label: "Old format", color: "#22c55e", start: "2026-07-13", end: "2026-07-17" }],
    });
    await page.getByTestId("import-input").setInputFiles({
      name: "old-format.json", mimeType: "application/json", buffer: Buffer.from(fileContent),
    });

    await expect(page.getByTestId("toast")).toContainText("invalid color");
    await expectEmptyCalendar(page);
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
    await expectEmptyCalendar(page);
  });

  test("Clear all empties the planner after confirmation", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-17"), "A");
    await createRange(page, cell(page, "august", "2026-08-10"), cell(page, "august", "2026-08-12"), "B");
    await expect(cell(page, "july", "2026-07-15").getByTestId("range-label")).toHaveText("A");
    await expect(cell(page, "august", "2026-08-11").getByTestId("range-label")).toHaveText("B");

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByTestId("clear-btn").click();

    await expectEmptyCalendar(page);
  });

  test("declining the Clear all confirmation keeps the ranges", async ({ page }) => {
    await createRange(page, cell(page, "july", "2026-07-13"), cell(page, "july", "2026-07-17"), "Safe");

    page.once("dialog", (dialog) => dialog.dismiss()); // click "Cancel" in the confirm box
    await page.getByTestId("clear-btn").click();

    await expect(cell(page, "july", "2026-07-15").getByTestId("range-label")).toHaveText("Safe");
  });
});
