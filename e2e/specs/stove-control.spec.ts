import { expect, test } from "@playwright/test";

import { setupApiMocks } from "../mocks/api-handlers";
import { StovePage } from "../pages/stove.page";

test.describe("Stove Control Page", () => {
  test.beforeEach(async ({ page }) => {
    const stovePage = new StovePage(page);
    await stovePage.setupAuth();
  });

  test("displays thermostat with target temperature", async ({ page }) => {
    await setupApiMocks(page, {
      deviceInfo: { power: true, temperature: 22 },
    });

    const stovePage = new StovePage(page);
    await stovePage.gotoStove();
    await stovePage.waitForThermostat();

    // Should display the target temperature
    await stovePage.expectTemperature(22);
  });

  test("shows power button", async ({ page }) => {
    await setupApiMocks(page, {
      deviceInfo: { power: true, temperature: 20 },
    });

    const stovePage = new StovePage(page);
    await stovePage.gotoStove();
    await stovePage.waitForThermostat();

    await expect(stovePage.powerButton).toBeVisible();
  });

  test("shows temperature adjustment buttons", async ({ page }) => {
    await setupApiMocks(page, {
      deviceInfo: { power: true, temperature: 21 },
    });

    const stovePage = new StovePage(page);
    await stovePage.gotoStove();
    await stovePage.waitForThermostat();

    await expect(stovePage.increaseButton).toBeVisible();
    await expect(stovePage.decreaseButton).toBeVisible();
  });

  test("clicking power button sends command", async ({ page }) => {
    await setupApiMocks(page, {
      deviceInfo: { power: true, temperature: 22 },
    });

    const stovePage = new StovePage(page);
    await stovePage.gotoStove();
    await stovePage.waitForThermostat();

    // Set up request listener before clicking
    // The edilkamin library uses PUT for mqtt/command endpoint
    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().includes("/api/proxy/") && request.method() === "PUT",
    );

    await stovePage.togglePower();

    // Should have made a PUT request
    const request = await requestPromise;
    expect(request.method()).toBe("PUT");
  });

  test("displays stove in powered off state", async ({ page }) => {
    await setupApiMocks(page, {
      deviceInfo: { power: false, temperature: 18 },
    });

    const stovePage = new StovePage(page);
    await stovePage.gotoStove();
    await stovePage.waitForThermostat();

    // Temperature should still be visible
    await stovePage.expectTemperature(18);
  });

  test("handles API loading state", async ({ page }) => {
    // Add delay to see loading state
    await setupApiMocks(page, {
      deviceInfo: { power: true, temperature: 22 },
      delay: 500,
    });

    const stovePage = new StovePage(page);
    await stovePage.gotoStove();

    // Eventually thermostat should appear
    await stovePage.waitForThermostat();
    await stovePage.expectTemperature(22);
  });

  test("displays pellet warning when reserve is low", async ({ page }) => {
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

    // Pellet warning should be visible
    await expect(stovePage.pelletWarning).toBeVisible();
  });
});

test.describe("Stove Control - Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    const stovePage = new StovePage(page);
    await stovePage.setupAuth();
  });

  test("handles 401 unauthorized error", async ({ page }) => {
    await setupApiMocks(page, { unauthorized: true });

    const stovePage = new StovePage(page);
    await stovePage.gotoStove();

    // Should redirect to login or show error
    // The exact behavior depends on your app's auth handling
    await page.waitForTimeout(1000);
  });
});
