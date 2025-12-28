import "@testing-library/jest-dom";

import { vi } from "vitest";

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
  setPower: vi.fn(),
  setTemperature: vi.fn(),
  setPowerLevel: vi.fn(),
  setFan1Speed: vi.fn(),
  isBluetoothEnabled: vi.fn().mockResolvedValue(true),
  requestEnableBluetooth: vi.fn(),
  // scanForDevices returns empty array by default; tests can spy and override
  scanForDevices: vi.fn().mockResolvedValue([]),
}));
