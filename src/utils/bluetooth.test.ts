import { Capacitor } from "@capacitor/core";
import { BleClient } from "@capacitor-community/bluetooth-le";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { isBluetoothSupported, scanForDevices } from "./bluetooth";

// Mock Capacitor
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: vi.fn(),
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
});
