import type { Locator, Page } from "@playwright/test";

import { ROUTES } from "../fixtures/test-data";
import { BasePage } from "./base.page";

/**
 * Page object for the Home page (/)
 */
export class HomePage extends BasePage {
  // Locators
  readonly loginForm: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly deviceList: Locator;
  readonly addDeviceButton: Locator;
  readonly macAddressInput: Locator;

  constructor(page: Page) {
    super(page);

    // Login form elements
    this.loginForm = page.locator("form");
    this.usernameInput = page
      .getByPlaceholder(/email|username/i)
      .or(page.locator('input[type="email"]'));
    this.passwordInput = page
      .getByPlaceholder(/password/i)
      .or(page.locator('input[type="password"]'));
    this.loginButton = page.getByRole("button", { name: /login|sign in/i });

    // Device list elements
    this.deviceList = page
      .locator('[data-testid="device-list"]')
      .or(page.locator(".device-list"));
    this.addDeviceButton = page.getByRole("button", { name: /add/i });
    this.macAddressInput = page.getByPlaceholder(/mac/i);
  }

  /**
   * Navigate to home page
   */
  async gotoHome(): Promise<void> {
    await this.goto(ROUTES.home);
  }

  /**
   * Check if login form is visible
   */
  async isLoginFormVisible(): Promise<boolean> {
    return this.loginButton.isVisible();
  }

  /**
   * Check if device list is visible (authenticated state)
   */
  async isDeviceListVisible(): Promise<boolean> {
    return this.deviceList.isVisible();
  }

  /**
   * Fill in login credentials
   */
  async fillLoginForm(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  /**
   * Click login button
   */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Get list of device MAC addresses displayed
   */
  async getDeviceMacs(): Promise<string[]> {
    const links = this.page.locator('a[href^="/stove/"]');
    const hrefs = await links.evaluateAll((elements) =>
      elements.map((el) => el.getAttribute("href") ?? ""),
    );
    return hrefs.map((href) => href.replace("/stove/", ""));
  }

  /**
   * Click on a device to navigate to its control page
   */
  async clickDevice(mac: string): Promise<void> {
    await this.page.locator(`a[href="/stove/${mac}"]`).click();
  }
}
