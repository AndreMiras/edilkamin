import { vi } from "vitest";

// Mock implementation of edilkamin package for testing
export const signIn = vi.fn();

// Mock for configure function
export const configure = vi.fn(() => ({
  deviceInfo: vi.fn(),
  setPower: vi.fn(),
  setTargetTemperature: vi.fn(),
}));

// Mock for getSession (token refresh)
export const getSession = vi.fn();

// Mock API_URL constants
export const API_URL = "https://api.edilkamin.com/";
export const OLD_API_URL =
  "https://fxtj7xkgc6.execute-api.eu-central-1.amazonaws.com/prod/";

// Import and re-export actual implementations from edilkamin
// This is needed because re-exporting types only works, not implementations
export {
  AlarmCode,
  AlarmDescriptions,
  type AlarmsLogType,
  deriveAlarmHistory,
  deriveUsageAnalytics,
  type DeviceInfoType,
  type UsageAnalyticsType,
} from "../../../node_modules/edilkamin";
