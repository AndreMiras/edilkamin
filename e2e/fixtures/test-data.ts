/**
 * Test constants and data for E2E tests
 */

// Test MAC address (12 hex characters)
export const TEST_MAC = "aabbccddeeff";

// Mock authentication token
export const TEST_TOKEN = "mock-e2e-token-12345";

// Test fireplace device for localStorage
export const TEST_FIREPLACE = {
  wifiMac: TEST_MAC,
  name: "Living Room Stove",
};

/**
 * Set up authenticated state in browser context via localStorage.
 * Call this in page.addInitScript() before navigating.
 *
 * Sets the e2e-bypass-auth flag to skip AWS Cognito token refresh,
 * allowing tests to run with mocked authentication.
 */
export function getAuthSetupScript(
  token: string = TEST_TOKEN,
  fireplaces: Array<{ wifiMac: string; name?: string }> = [TEST_FIREPLACE],
): string {
  return `
    localStorage.setItem("edilkamin-token", "${token}");
    localStorage.setItem("fireplaces-v2", '${JSON.stringify(fireplaces)}');
    localStorage.setItem("e2e-bypass-auth", "true");
  `;
}

/**
 * URLs for E2E tests
 */
export const ROUTES = {
  home: "/",
  stove: (mac: string = TEST_MAC) => `/stove/${mac}`,
  login: "/",
} as const;
