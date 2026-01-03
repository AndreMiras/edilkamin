import "@testing-library/jest-dom";

import { vi } from "vitest";

// Mock window.matchMedia for responsive hooks
// Default to desktop view (min-width: 640px returns true)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    // Return true for min-width queries (desktop mode)
    matches: query.includes("min-width"),
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Setup FontAwesome icons for tests (same as _app.tsx)

const { library } = require("@fortawesome/fontawesome-svg-core");

const { fab } = require("@fortawesome/free-brands-svg-icons");

const { far } = require("@fortawesome/free-regular-svg-icons");

const { fas } = require("@fortawesome/free-solid-svg-icons");

library.add(fab, far, fas);

// Mock Next.js router globally
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
    route: "/",
  }),
}));

// Mock bluetooth utilities globally (default to supported=true for UI tests)
vi.mock("../utils/bluetooth", () => ({
  isBluetoothSupported: vi.fn(() => true),
  connectToDevice: vi.fn(),
  disconnectFromDevice: vi.fn(),
  readPowerState: vi.fn(),
  readTemperature: vi.fn(),
  readPowerLevel: vi.fn(),
  readFan1Speed: vi.fn(),
  readAutoMode: vi.fn(),
  setPower: vi.fn(),
  setTemperature: vi.fn(),
  setPowerLevel: vi.fn(),
  setFan1Speed: vi.fn(),
  setAutoMode: vi.fn(),
  isBluetoothEnabled: vi.fn().mockResolvedValue(true),
  requestEnableBluetooth: vi.fn(),
  // scanForDevices returns empty array by default; tests can spy and override
  scanForDevices: vi.fn().mockResolvedValue([]),
}));
