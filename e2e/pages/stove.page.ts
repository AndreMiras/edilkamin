import { expect, type Locator, type Page } from "@playwright/test";

import { ROUTES, TEST_MAC } from "../fixtures/test-data";
import { BasePage } from "./base.page";

/**
 * Page object for the Stove control page (/stove/[mac])
 */
export class StovePage extends BasePage {
  // Locators
  readonly powerButton: Locator;
  readonly increaseButton: Locator;
  readonly decreaseButton: Locator;
  readonly thermostat: Locator;
  readonly temperatureDisplay: Locator;
  readonly autoModeToggle: Locator;
  readonly pelletWarning: Locator;

  constructor(page: Page) {
    super(page);

    // Power button has the power-off icon
    this.powerButton = page.locator('button:has([data-icon="power-off"])');

    // Temperature adjustment buttons
    this.increaseButton = page.locator('button:has([data-icon="plus"])');
    this.decreaseButton = page.locator('button:has([data-icon="minus"])');

    // Thermostat container
    this.thermostat = page
      .locator('[data-testid="thermostat"]')
      .or(page.locator(".thermostat"));

    // Temperature display (shows target temperature)
    this.temperatureDisplay = page.getByText(/^\d+\.\d+$/);

    // Auto mode toggle
    this.autoModeToggle = page
      .locator('[data-testid="auto-mode-toggle"]')
      .or(page.getByRole("switch"));

    // Pellet warning indicator
    this.pelletWarning = page
      .locator('[data-testid="pellet-warning"]')
      .or(page.getByText(/pellet/i));
  }

  /**
   * Navigate to stove page with given MAC address
   */
  async gotoStove(mac: string = TEST_MAC): Promise<void> {
    await this.goto(ROUTES.stove(mac));
  }

  /**
   * Wait for thermostat to be fully loaded
   */
  async waitForThermostat(): Promise<void> {
    await this.powerButton.waitFor({ state: "visible" });
  }

  /**
   * Toggle power on/off
   */
  async togglePower(): Promise<void> {
    await this.powerButton.click();
  }

  /**
   * Increase temperature
   */
  async increaseTemperature(): Promise<void> {
    await this.increaseButton.click();
  }

  /**
   * Decrease temperature
   */
  async decreaseTemperature(): Promise<void> {
    await this.decreaseButton.click();
  }

  /**
   * Get the displayed temperature value
   */
  async getDisplayedTemperature(): Promise<string | null> {
    return this.temperatureDisplay.textContent();
  }

  /**
   * Check if stove is powered on (button shows active state)
   */
  async isPoweredOn(): Promise<boolean> {
    // When powered on, the power button typically has a different style
    const classList = await this.powerButton.getAttribute("class");
    return classList?.includes("active") ?? false;
  }

  /**
   * Check if pellet warning is visible
   */
  async hasPelletWarning(): Promise<boolean> {
    return this.pelletWarning.isVisible();
  }

  /**
   * Expand accordion sections for full page view
   */
  async expandAllSections(): Promise<void> {
    const accordionTriggers = this.page.locator('[data-state="closed"]');
    const count = await accordionTriggers.count();
    for (let i = 0; i < count; i++) {
      await accordionTriggers.nth(i).click();
    }
  }

  /**
   * Assert thermostat displays expected temperature
   */
  async expectTemperature(temp: number): Promise<void> {
    await expect(this.page.getByText(`${temp.toFixed(1)}`)).toBeVisible();
  }
}
