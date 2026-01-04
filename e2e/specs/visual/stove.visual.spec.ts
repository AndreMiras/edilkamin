import { expect, test } from "@playwright/test";

import { setupApiMocks } from "../../mocks/api-handlers";
import { StovePage } from "../../pages/stove.page";

/**
 * Visual regression tests for the Stove page.
 * Run with: yarn e2e:visual
 * Update baselines with: yarn e2e:visual:update
 */
test.describe("Stove Visual Regression @visual", () => {
  test.beforeEach(async ({ page }) => {
    const stovePage = new StovePage(page);
    await stovePage.setupAuth();
  });

  test("thermostat - powered on state", async ({ page }) => {
    await setupApiMocks(page, {
      deviceInfo: { power: true, temperature: 22, isAuto: true },
    });

    const stovePage = new StovePage(page);
    await stovePage.gotoStove();
    await stovePage.waitForThermostat();

    // Wait for any animations to settle
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("stove-thermostat-on.png");
  });

  test("thermostat - powered off state", async ({ page }) => {
    await setupApiMocks(page, {
      deviceInfo: { power: false, temperature: 18, isAuto: false },
    });

    const stovePage = new StovePage(page);
    await stovePage.gotoStove();
    await stovePage.waitForThermostat();

    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("stove-thermostat-off.png");
  });

  test("thermostat - with pellet warning", async ({ page }) => {
    await setupApiMocks(page, {
      deviceInfo: {
        power: true,
        temperature: 22,
        pelletInReserve: true,
        autonomyMinutes: 30,
      },
    });

    const stovePage = new StovePage(page);
    await stovePage.gotoStove();
    await stovePage.waitForThermostat();

    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("stove-pellet-warning.png");
  });

  test("thermostat - high temperature setting", async ({ page }) => {
    await setupApiMocks(page, {
      deviceInfo: { power: true, temperature: 28, isAuto: true },
    });

    const stovePage = new StovePage(page);
    await stovePage.gotoStove();
    await stovePage.waitForThermostat();

    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("stove-high-temp.png");
  });

  test("thermostat - low temperature setting", async ({ page }) => {
    await setupApiMocks(page, {
      deviceInfo: { power: true, temperature: 15, isAuto: false },
    });

    const stovePage = new StovePage(page);
    await stovePage.gotoStove();
    await stovePage.waitForThermostat();

    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("stove-low-temp.png");
  });
});

/**
 * Screenshot generation for documentation.
 * Run with: yarn e2e:screenshots
 */
test.describe("Documentation Screenshots @screenshot", () => {
  test.beforeEach(async ({ page }) => {
    const stovePage = new StovePage(page);
    await stovePage.setupAuth();
  });

  test("generate stove control screenshot", async ({ page }) => {
    await setupApiMocks(page, {
      deviceInfo: { power: true, temperature: 22, isAuto: true },
    });

    const stovePage = new StovePage(page);
    await stovePage.gotoStove();
    await stovePage.waitForThermostat();
    await page.waitForTimeout(500);

    // Save to screenshots directory for documentation
    await stovePage.takeDocScreenshot("stove-control");
  });

  test("generate powered off screenshot", async ({ page }) => {
    await setupApiMocks(page, {
      deviceInfo: { power: false, temperature: 18, isAuto: false },
    });

    const stovePage = new StovePage(page);
    await stovePage.gotoStove();
    await stovePage.waitForThermostat();
    await page.waitForTimeout(500);

    await stovePage.takeDocScreenshot("stove-off");
  });
});
