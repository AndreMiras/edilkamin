import { expect, test } from "@playwright/test";

import { TEST_MAC, TEST_TOKEN } from "../fixtures/test-data";
import { setupAuthMocks } from "../mocks/api-handlers";
import { HomePage } from "../pages/home.page";

test.describe("Home Page", () => {
  test("shows login form when not authenticated", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.gotoHome();

    // Should show login form when no token in localStorage
    await expect(homePage.loginButton).toBeVisible();
  });

  test("shows device list when authenticated", async ({ page }) => {
    const homePage = new HomePage(page);

    // Set up auth mocks for Cognito token refresh
    await setupAuthMocks(page);

    // Set up authentication before navigating
    await homePage.setupAuth(TEST_TOKEN, [{ wifiMac: TEST_MAC }]);
    await homePage.gotoHome();

    // Should show device list instead of login form
    await expect(page.locator(`a[href="/stove/${TEST_MAC}"]`)).toBeVisible();
  });

  test("can navigate to stove page from device list", async ({ page }) => {
    const homePage = new HomePage(page);

    // Set up auth mocks for Cognito token refresh
    await setupAuthMocks(page);

    await homePage.setupAuth();
    await homePage.gotoHome();

    // Click on the device link
    await homePage.clickDevice(TEST_MAC);

    // Should navigate to stove page
    await expect(page).toHaveURL(new RegExp(`/stove/${TEST_MAC}`));
  });
});
