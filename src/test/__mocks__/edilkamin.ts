import { vi } from "vitest";

// Mock implementation of edilkamin package for testing
export const signIn = vi.fn();

// Mock for configure function
export const configure = vi.fn(() => ({
  deviceInfo: vi.fn(),
  setPower: vi.fn(),
  setTargetTemperature: vi.fn(),
}));

// Mock API_URL constant
export const API_URL = "https://api.edilkamin.com/";

// Re-export types (will use actual types from edilkamin)
export * from "edilkamin";
