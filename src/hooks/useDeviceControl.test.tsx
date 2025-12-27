import { renderHook, waitFor } from "@testing-library/react";
import { configure, getSession } from "edilkamin";
import { act, ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ErrorContextProvider } from "../context/error";
import { TokenContextProvider } from "../context/token";
import i18n from "../i18n";
import { useDeviceControl } from "./useDeviceControl";

// Mock next/router
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock edilkamin library
vi.mock("edilkamin");

// Mock platform utility
vi.mock("../utils/platform", () => ({
  isNativePlatform: () => false,
}));

const mockDeviceInfo = vi.fn();
const mockSetPower = vi.fn();
const mockSetTargetTemperature = vi.fn();
const mockSetPowerLevel = vi.fn();
const mockSetAuto = vi.fn();
const mockSetFanSpeed = vi.fn();

vi.mocked(configure).mockReturnValue({
  deviceInfo: mockDeviceInfo,
  setPower: mockSetPower,
  setTargetTemperature: mockSetTargetTemperature,
  setPowerLevel: mockSetPowerLevel,
  setAuto: mockSetAuto,
  setFanSpeed: mockSetFanSpeed,
  signIn: vi.fn(),
  getSession: vi.fn(),
} as unknown as ReturnType<typeof configure>);

const mockDeviceData = {
  status: {
    commands: { power: true },
    temperatures: { enviroment: 22.5 },
    flags: { is_pellet_in_reserve: false },
    pellet: { autonomy_time: 24 },
  },
  nvm: {
    user_parameters: {
      enviroment_1_temperature: 21,
      manual_power: 3,
      is_auto: true,
      fan_1_ventilation: 2,
      fan_2_ventilation: 1,
      fan_3_ventilation: 0,
    },
  },
};

describe("useDeviceControl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("edilkamin-token", "test-token");
    // Mock getSession to return the token (required by TokenContextProvider)
    vi.mocked(getSession).mockResolvedValue("test-token");
    // Set document visibility to visible by default
    Object.defineProperty(document, "visibilityState", {
      writable: true,
      configurable: true,
      value: "visible",
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nextProvider i18n={i18n}>
      <TokenContextProvider>
        <ErrorContextProvider>{children}</ErrorContextProvider>
      </TokenContextProvider>
    </I18nextProvider>
  );

  describe("initial fetch", () => {
    it("should fetch device info on mount", async () => {
      mockDeviceInfo.mockResolvedValue(mockDeviceData);

      const { result } = renderHook(() => useDeviceControl("ABC123456789"), {
        wrapper,
      });

      await waitFor(() => {
        expect(mockDeviceInfo).toHaveBeenCalledWith(
          "test-token",
          "ABC123456789",
        );
        expect(result.current.loading).toBe(false);
      });
    });

    it("should set lastUpdated timestamp after successful fetch", async () => {
      mockDeviceInfo.mockResolvedValue(mockDeviceData);

      const { result } = renderHook(() => useDeviceControl("ABC123456789"), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.lastUpdated).toBeInstanceOf(Date);
        expect(result.current.lastUpdated).not.toBeNull();
      });
    });

    it("should not fetch when mac is missing", async () => {
      mockDeviceInfo.mockResolvedValue(mockDeviceData);

      renderHook(() => useDeviceControl(undefined), { wrapper });

      // Wait a short time to ensure no fetch is triggered
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(mockDeviceInfo).not.toHaveBeenCalled();
    });

    it("should not fetch when token is missing", async () => {
      localStorage.removeItem("edilkamin-token");
      vi.mocked(getSession).mockResolvedValue(null as unknown as string);
      mockDeviceInfo.mockResolvedValue(mockDeviceData);

      renderHook(() => useDeviceControl("ABC123456789"), { wrapper });

      // Wait a short time to ensure no fetch is triggered
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(mockDeviceInfo).not.toHaveBeenCalled();
    });

    it("should return null lastUpdated initially", async () => {
      mockDeviceInfo.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useDeviceControl("ABC123456789"), {
        wrapper,
      });

      // Wait for context providers to settle
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.lastUpdated).toBeNull();
    });
  });

  describe("refreshDeviceInfo", () => {
    it("should expose refreshDeviceInfo function", async () => {
      mockDeviceInfo.mockResolvedValue(mockDeviceData);

      const { result } = renderHook(() => useDeviceControl("ABC123456789"), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.refreshDeviceInfo).toBe("function");
    });
  });

  describe("event listeners and cleanup", () => {
    it("should add visibility change event listener on mount", async () => {
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");
      mockDeviceInfo.mockResolvedValue(mockDeviceData);

      const { unmount } = renderHook(() => useDeviceControl("ABC123456789"), {
        wrapper,
      });

      await waitFor(() => {
        expect(mockDeviceInfo).toHaveBeenCalled();
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function),
      );

      // Clean up to prevent interference with other tests
      unmount();
    });

    it("should clean up interval and event listener on unmount", async () => {
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
      mockDeviceInfo.mockResolvedValue(mockDeviceData);

      const { unmount } = renderHook(() => useDeviceControl("ABC123456789"), {
        wrapper,
      });

      await waitFor(() => {
        expect(mockDeviceInfo).toHaveBeenCalled();
      });

      // Unmount should trigger cleanup
      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function),
      );
    });
  });
});
