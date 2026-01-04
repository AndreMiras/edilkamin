import type { Page, Route } from "@playwright/test";

import {
  createMockDeviceInfo,
  type MockDeviceInfoOptions,
} from "../fixtures/device-info";

export interface MockApiOptions {
  deviceInfo?: MockDeviceInfoOptions;
  /** Delay in ms before responding (to test loading states) */
  delay?: number;
  /** Return 401 for device info requests (to test auth failure) */
  unauthorized?: boolean;
  /** Return error for specific operations */
  failOperations?: Array<"power" | "temperature" | "auto" | "fan">;
}

/**
 * Set up authentication mocking for AWS Cognito.
 * This intercepts any Cognito API calls that might still occur.
 *
 * Note: The main auth bypass is handled by setting 'e2e-bypass-auth' in localStorage,
 * which tells the app to skip AWS Cognito token refresh. This route handler
 * is a fallback in case any Cognito calls are still made.
 */
export async function setupAuthMocks(page: Page): Promise<void> {
  // Intercept Cognito network calls (fallback if any are made)
  await page.route(/cognito-idp.*\.amazonaws\.com/, async (route: Route) => {
    const postData = route.request().postData();

    // Handle InitiateAuth (token refresh)
    if (postData?.includes("InitiateAuth")) {
      return route.fulfill({
        status: 200,
        contentType: "application/x-amz-json-1.1",
        body: JSON.stringify({
          AuthenticationResult: {
            AccessToken: "mock-access-token",
            IdToken: "mock-id-token",
            RefreshToken: "mock-refresh-token",
            ExpiresIn: 3600,
            TokenType: "Bearer",
          },
        }),
      });
    }

    // Default: return success for other Cognito operations
    return route.fulfill({
      status: 200,
      contentType: "application/x-amz-json-1.1",
      body: JSON.stringify({}),
    });
  });
}

/**
 * Set up API route interception for /api/proxy/** requests.
 * Mocks all Edilkamin API calls to avoid real backend dependency.
 */
export async function setupApiMocks(
  page: Page,
  options: MockApiOptions = {},
): Promise<void> {
  const { deviceInfo = {}, delay = 0, unauthorized = false } = options;

  // Also set up auth mocks for Cognito
  await setupAuthMocks(page);

  await page.route("**/api/proxy/**", async (route: Route) => {
    const url = route.request().url();
    const method = route.request().method();

    // Add optional delay
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Device info: GET /api/proxy/device/{mac}/info
    if (url.includes("/device/") && url.includes("/info") && method === "GET") {
      if (unauthorized) {
        return route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ message: "Unauthorized" }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(createMockDeviceInfo(deviceInfo)),
      });
    }

    // PUT/POST commands (setPower, setTemperature, etc.)
    // The edilkamin library uses PUT for mqtt/command endpoint
    if (method === "PUT" || method === "POST") {
      // Check if this operation should fail
      const shouldFail = shouldFailOperation(url, options.failOperations);
      if (shouldFail) {
        return route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Operation failed" }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    }

    // Unhandled routes - log and abort
    console.warn(`Unhandled API route: ${method} ${url}`);
    return route.abort();
  });
}

function shouldFailOperation(url: string, failOperations?: string[]): boolean {
  if (!failOperations) return false;

  if (failOperations.includes("power") && url.includes("power")) return true;
  if (failOperations.includes("temperature") && url.includes("temperature"))
    return true;
  if (failOperations.includes("auto") && url.includes("auto")) return true;
  if (failOperations.includes("fan") && url.includes("fan")) return true;

  return false;
}

/**
 * Wait for device info API request to complete
 */
export async function waitForDeviceInfo(page: Page): Promise<void> {
  await page.waitForResponse(
    (response) =>
      response.url().includes("/device/") && response.url().includes("/info"),
  );
}
