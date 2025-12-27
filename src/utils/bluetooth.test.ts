import { Capacitor } from "@capacitor/core";
import { BleClient } from "@capacitor-community/bluetooth-le";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  isBluetoothEnabled,
  isBluetoothSupported,
  requestEnableBluetooth,
  scanForDevices,
} from "./bluetooth";

// Mock Capacitor
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: vi.fn(),
    getPlatform: vi.fn(),
  },
}));

describe("bluetooth utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isBluetoothSupported", () => {
    it("returns true on native platforms", () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      expect(isBluetoothSupported()).toBe(true);
    });

    it("checks navigator.bluetooth on web platform", () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
      // In test environment, navigator.bluetooth is undefined
      expect(isBluetoothSupported()).toBe(false);
    });
  });

  describe("scanForDevices", () => {
    it("uses native plugin on Android", async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);

      const devices = await scanForDevices();

      expect(BleClient.initialize).toHaveBeenCalled();
      expect(BleClient.requestDevice).toHaveBeenCalledWith({
        namePrefix: "EDILKAMIN_EP",
        optionalServices: ["0000abf0-0000-1000-8000-00805f9b34fb"],
      });
      expect(devices).toHaveLength(1);
      expect(devices[0].bleMac).toBe("001122334455");
    });

    it("returns empty array on user cancellation", async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(BleClient.requestDevice).mockRejectedValueOnce(
        new Error("User cancelled the requestDevice() operation"),
      );

      const devices = await scanForDevices();
      expect(devices).toEqual([]);
    });
  });

  describe("isBluetoothEnabled", () => {
    it("returns true on web platform (cannot detect)", async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);

      const result = await isBluetoothEnabled();
      expect(result).toBe(true);
      expect(BleClient.isEnabled).not.toHaveBeenCalled();
    });

    it("calls BleClient.isEnabled on native platform", async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(BleClient.isEnabled).mockResolvedValue(true);

      const result = await isBluetoothEnabled();
      expect(result).toBe(true);
      expect(BleClient.initialize).toHaveBeenCalled();
      expect(BleClient.isEnabled).toHaveBeenCalled();
    });

    it("returns false when Bluetooth is disabled on native", async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(BleClient.isEnabled).mockResolvedValue(false);

      const result = await isBluetoothEnabled();
      expect(result).toBe(false);
      expect(BleClient.initialize).toHaveBeenCalled();
    });
  });

  describe("requestEnableBluetooth", () => {
    it("returns false on web platform", async () => {
      vi.mocked(Capacitor.getPlatform).mockReturnValue("web");

      const result = await requestEnableBluetooth();
      expect(result).toBe(false);
      expect(BleClient.requestEnable).not.toHaveBeenCalled();
    });

    it("returns false on iOS (not supported)", async () => {
      vi.mocked(Capacitor.getPlatform).mockReturnValue("ios");

      const result = await requestEnableBluetooth();
      expect(result).toBe(false);
      expect(BleClient.requestEnable).not.toHaveBeenCalled();
    });

    it("calls BleClient.requestEnable on Android", async () => {
      vi.mocked(Capacitor.getPlatform).mockReturnValue("android");

      const result = await requestEnableBluetooth();
      expect(result).toBe(true);
      expect(BleClient.initialize).toHaveBeenCalled();
      expect(BleClient.requestEnable).toHaveBeenCalled();
    });
  });
});
