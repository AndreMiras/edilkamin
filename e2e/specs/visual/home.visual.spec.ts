import { expect, test } from "@playwright/test";

import { setupAuthMocks } from "../../mocks/api-handlers";
import { HomePage } from "../../pages/home.page";

test.describe("Home Visual Regression @visual", () => {
  test("device management dialog", async ({ page }) => {
    await setupAuthMocks(page);

    const homePage = new HomePage(page);
    await homePage.setupAuth();
    await homePage.gotoHome();
    await page.getByRole("button", { name: "Manage Devices" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: "Manage Devices" }),
    ).toBeVisible();
    await expect(dialog.getByRole("textbox")).toBeVisible();
    await expect(dialog).toHaveScreenshot("home-device-management-dialog.png");
  });

  test("mobile navigation sheet", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const homePage = new HomePage(page);
    await homePage.gotoHome();
    await page.getByRole("button", { name: "Toggle menu" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByText("Dark mode")).toBeVisible();
    await expect(dialog).toHaveScreenshot("home-mobile-navigation-sheet.png");
  });
});
