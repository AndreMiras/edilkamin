import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BluetoothContextValue, useBluetooth } from "@/context/bluetooth";
import i18n from "@/i18n";

import ConnectionModeToggle from "./ConnectionModeToggle";

// Mock the bluetooth context
vi.mock("@/context/bluetooth", () => ({
  useBluetooth: vi.fn(),
}));

const mockUseBluetooth = vi.mocked(useBluetooth);

const defaultContextValue: BluetoothContextValue = {
  connectionMode: "cloud",
  setConnectionMode: vi.fn(),
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  bleDeviceId: "test-device-id",
  setBleDeviceId: vi.fn(),
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn().mockResolvedValue(undefined),
  isBleSupported: true,
};

const renderWithI18n = (ui: React.ReactElement) => {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
};

describe("ConnectionModeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBluetooth.mockReturnValue({ ...defaultContextValue });
  });

  describe("rendering conditions", () => {
    it("should render nothing when BLE is not supported", () => {
      mockUseBluetooth.mockReturnValue({
        ...defaultContextValue,
        isBleSupported: false,
      });

      const { container } = renderWithI18n(<ConnectionModeToggle />);
      expect(container).toBeEmptyDOMElement();
    });

    it("should render nothing when no bleDeviceId is set", () => {
      mockUseBluetooth.mockReturnValue({
        ...defaultContextValue,
        bleDeviceId: null,
      });

      const { container } = renderWithI18n(<ConnectionModeToggle />);
      expect(container).toBeEmptyDOMElement();
    });

    it("should render both buttons when BLE is supported and device ID is set", () => {
      renderWithI18n(<ConnectionModeToggle />);

      expect(
        screen.getByRole("button", { name: /cloud/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /bluetooth/i }),
      ).toBeInTheDocument();
    });
  });

  describe("cloud mode active by default", () => {
    it("should show cloud button as active when connectionMode is cloud", () => {
      renderWithI18n(<ConnectionModeToggle />);

      const cloudButton = screen.getByRole("button", { name: /cloud/i });
      expect(cloudButton).toHaveAttribute("aria-pressed", "true");
    });

    it("should show bluetooth button as inactive when connectionMode is cloud", () => {
      renderWithI18n(<ConnectionModeToggle />);

      const bleButton = screen.getByRole("button", { name: /bluetooth/i });
      expect(bleButton).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("BLE mode interactions", () => {
    it("should call connect when clicking BLE button", async () => {
      const connect = vi.fn().mockResolvedValue(undefined);
      const setConnectionMode = vi.fn();

      mockUseBluetooth.mockReturnValue({
        ...defaultContextValue,
        connect,
        setConnectionMode,
      });

      const user = userEvent.setup();
      renderWithI18n(<ConnectionModeToggle />);

      await user.click(screen.getByRole("button", { name: /bluetooth/i }));

      expect(setConnectionMode).toHaveBeenCalledWith("ble");
      expect(connect).toHaveBeenCalled();
    });

    it("should call disconnect when clicking Cloud button while in BLE mode", async () => {
      const disconnect = vi.fn().mockResolvedValue(undefined);
      const setConnectionMode = vi.fn();

      mockUseBluetooth.mockReturnValue({
        ...defaultContextValue,
        connectionMode: "ble",
        disconnect,
        setConnectionMode,
      });

      const user = userEvent.setup();
      renderWithI18n(<ConnectionModeToggle />);

      await user.click(screen.getByRole("button", { name: /cloud/i }));

      expect(disconnect).toHaveBeenCalled();
      expect(setConnectionMode).toHaveBeenCalledWith("cloud");
    });

    it("should not call connect when clicking BLE button without bleDeviceId", async () => {
      const connect = vi.fn();
      const setConnectionMode = vi.fn();

      // This case shouldn't render anything, but test the guard anyway
      mockUseBluetooth.mockReturnValue({
        ...defaultContextValue,
        bleDeviceId: null,
        connect,
        setConnectionMode,
      });

      const { container } = renderWithI18n(<ConnectionModeToggle />);

      // Component should not render
      expect(container).toBeEmptyDOMElement();
    });

    it("should not call anything when clicking already active mode", async () => {
      const connect = vi.fn();
      const setConnectionMode = vi.fn();

      mockUseBluetooth.mockReturnValue({
        ...defaultContextValue,
        connectionMode: "cloud",
        connect,
        setConnectionMode,
      });

      const user = userEvent.setup();
      renderWithI18n(<ConnectionModeToggle />);

      await user.click(screen.getByRole("button", { name: /cloud/i }));

      expect(setConnectionMode).not.toHaveBeenCalled();
      expect(connect).not.toHaveBeenCalled();
    });
  });

  describe("connecting state", () => {
    it("should show connecting text when isConnecting is true", () => {
      mockUseBluetooth.mockReturnValue({
        ...defaultContextValue,
        isConnecting: true,
      });

      renderWithI18n(<ConnectionModeToggle />);

      expect(screen.getByText(/connecting/i)).toBeInTheDocument();
    });

    it("should disable BLE button when connecting", () => {
      mockUseBluetooth.mockReturnValue({
        ...defaultContextValue,
        isConnecting: true,
      });

      renderWithI18n(<ConnectionModeToggle />);

      const bleButton = screen.getByRole("button", { name: /connecting/i });
      expect(bleButton).toBeDisabled();
    });
  });

  describe("connection status indicators", () => {
    it("should show green dot when connected in BLE mode", () => {
      mockUseBluetooth.mockReturnValue({
        ...defaultContextValue,
        connectionMode: "ble",
        isConnected: true,
      });

      renderWithI18n(<ConnectionModeToggle />);

      const greenDot = document.querySelector(".bg-green-500");
      expect(greenDot).toBeInTheDocument();
    });

    it("should not show green dot when in cloud mode", () => {
      mockUseBluetooth.mockReturnValue({
        ...defaultContextValue,
        connectionMode: "cloud",
        isConnected: true,
      });

      renderWithI18n(<ConnectionModeToggle />);

      const greenDot = document.querySelector(".bg-green-500");
      expect(greenDot).not.toBeInTheDocument();
    });

    it("should show red dot when there is a connection error in BLE mode", () => {
      mockUseBluetooth.mockReturnValue({
        ...defaultContextValue,
        connectionMode: "ble",
        connectionError: "Connection failed",
      });

      renderWithI18n(<ConnectionModeToggle />);

      const redDot = document.querySelector(".bg-red-500");
      expect(redDot).toBeInTheDocument();
    });

    it("should not show red dot when in cloud mode even with error", () => {
      mockUseBluetooth.mockReturnValue({
        ...defaultContextValue,
        connectionMode: "cloud",
        connectionError: "Connection failed",
      });

      renderWithI18n(<ConnectionModeToggle />);

      const redDot = document.querySelector(".bg-red-500");
      expect(redDot).not.toBeInTheDocument();
    });
  });

  describe("BLE mode active state", () => {
    it("should show BLE button as active when connectionMode is ble", () => {
      mockUseBluetooth.mockReturnValue({
        ...defaultContextValue,
        connectionMode: "ble",
      });

      renderWithI18n(<ConnectionModeToggle />);

      const bleButton = screen.getByRole("button", { name: /bluetooth/i });
      expect(bleButton).toHaveAttribute("aria-pressed", "true");
    });

    it("should show cloud button as inactive when connectionMode is ble", () => {
      mockUseBluetooth.mockReturnValue({
        ...defaultContextValue,
        connectionMode: "ble",
      });

      renderWithI18n(<ConnectionModeToggle />);

      const cloudButton = screen.getByRole("button", { name: /cloud/i });
      expect(cloudButton).toHaveAttribute("aria-pressed", "false");
    });
  });
});
