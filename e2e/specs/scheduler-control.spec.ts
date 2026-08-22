import { expect, test } from "@playwright/test";

import { TEST_MAC } from "../fixtures/test-data";
import { setupApiMocks } from "../mocks/api-handlers";
import { StovePage } from "../pages/stove.page";

test.describe("Scheduler Page", () => {
  test.beforeEach(async ({ page }) => {
    const stovePage = new StovePage(page);
    await stovePage.setupAuth();
  });

  test("displays the weekly schedule from device data", async ({ page }) => {
    await setupApiMocks(page);
    await page.goto(`/stove/${TEST_MAC}/scheduler`);

    await expect(
      page.getByRole("heading", { name: "Schedule & Timer" }),
    ).toBeVisible();
    await expect(page.getByText("Quick Presets")).toBeVisible();
    await expect(page.getByText("Target Temperatures")).toBeVisible();
  });

  test("switches to the active easy timer", async ({ page }) => {
    await setupApiMocks(page, {
      deviceInfo: { easyTimerActive: true, easyTimerMinutes: 120 },
    });
    await page.goto(`/stove/${TEST_MAC}/scheduler`);
    await page.getByRole("button", { name: "Easy Timer" }).click();

    await expect(
      page.getByRole("heading", { name: "Easy Timer" }),
    ).toBeVisible();
    const timerDisplay = page
      .getByText("until automatic shutoff")
      .locator("..");
    await expect(
      timerDisplay.getByText("2 hours", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("switch")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  test("uses the mobile schedule layout without horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await setupApiMocks(page);
    await page.goto(`/stove/${TEST_MAC}/scheduler`);

    await expect(
      page.getByRole("heading", { name: "Schedule & Timer" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /^Mon/ })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
