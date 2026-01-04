import type { Page } from "@playwright/test";

import {
  getAuthSetupScript,
  TEST_FIREPLACE,
  TEST_TOKEN,
} from "../fixtures/test-data";

/**
 * Base page object with common functionality
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Set up authenticated state before navigation.
   * Must be called before goto() for auth to take effect.
   */
  async setupAuth(
    token: string = TEST_TOKEN,
    fireplaces: Array<{ wifiMac: string; name?: string }> = [TEST_FIREPLACE],
  ): Promise<void> {
    await this.page.addInitScript(getAuthSetupScript(token, fireplaces));
  }

  /**
   * Navigate to a URL
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Wait for page to be fully loaded (network idle)
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Check if an element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    return this.page.locator(selector).isVisible();
  }

  /**
   * Take a screenshot for documentation
   */
  async takeDocScreenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({
      path: `e2e/screenshots/${name}.png`,
      fullPage: false,
    });
  }
}
