import { Capacitor } from "@capacitor/core";
import {
  BleClient,
  // @ts-expect-error - Mock-only exports not in type definitions
  resetNotificationCallback,
  // @ts-expect-error - Mock-only exports not in type definitions
  triggerNotification,
} from "@capacitor-community/bluetooth-le";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Unmock the bluetooth module (overrides the global mock in setup.ts)
vi.unmock("./bluetooth");
vi.unmock("@/utils/bluetooth");
vi.unmock("../utils/bluetooth");

import {
  connectToDevice,
  isBluetoothEnabled,
  isBluetoothSupported,
  readAutoMode,
  requestEnableBluetooth,
  scanForDevices,
  setAutoMode,
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

  describe("readAutoMode", () => {
    beforeEach(async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      resetNotificationCallback();
      // Connect first to set up notification handler
      await connectToDevice("test-device-id");
    });

    it("returns true when device is in auto mode", async () => {
      // Mock BleClient.write to return auto mode enabled response
      vi.mocked(BleClient.write).mockImplementationOnce(async () => {
        // Response format: [slaveAddr, funcCode, byteCount, dataHigh, dataLow]
        // For boolean true: data[0] = 1
        const response = new Uint8Array([0x01, 0x03, 0x02, 0x00, 0x01]);
        triggerNotification(response);
      });

      const result = await readAutoMode("test-device-id");

      expect(BleClient.write).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("returns false when device is in manual mode", async () => {
      // Mock BleClient.write to return auto mode disabled response
      vi.mocked(BleClient.write).mockImplementationOnce(async () => {
        // For boolean false: data[0] = 0
        const response = new Uint8Array([0x01, 0x03, 0x02, 0x00, 0x00]);
        triggerNotification(response);
      });

      const result = await readAutoMode("test-device-id");

      expect(result).toBe(false);
    });
  });

  describe("setAutoMode", () => {
    beforeEach(async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      resetNotificationCallback();
      // Connect first to set up notification handler
      await connectToDevice("test-device-id");
    });

    it("sends correct command to enable auto mode", async () => {
      // Mock successful write response
      vi.mocked(BleClient.write).mockImplementationOnce(async () => {
        const response = new Uint8Array([0x01, 0x06, 0x00, 0x10, 0x00, 0x01]);
        triggerNotification(response);
      });

      await setAutoMode("test-device-id", true);

      expect(BleClient.write).toHaveBeenCalled();
    });

    it("sends correct command to disable auto mode", async () => {
      // Mock successful write response
      vi.mocked(BleClient.write).mockImplementationOnce(async () => {
        const response = new Uint8Array([0x01, 0x06, 0x00, 0x10, 0x00, 0x00]);
        triggerNotification(response);
      });

      await setAutoMode("test-device-id", false);

      expect(BleClient.write).toHaveBeenCalled();
    });

    it("throws error when command fails", async () => {
      // Mock error response (isError = true when function code has high bit set)
      vi.mocked(BleClient.write).mockImplementationOnce(async () => {
        // Error response: function code 0x86 (0x06 | 0x80), error code 1
        const response = new Uint8Array([0x01, 0x86, 0x01]);
        triggerNotification(response);
      });

      await expect(setAutoMode("test-device-id", true)).rejects.toThrow(
        "Failed to set auto mode: error code 1",
      );
    });
  });
});
