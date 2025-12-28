import { beforeEach, describe, expect, it } from "vitest";

import {
  addStoredDevice,
  getDeviceByWifiMac,
  getStoredDevices,
  removeStoredDevice,
  setStoredDevices,
  StoredDevice,
  updateDeviceBleMac,
} from "./deviceStorage";

describe("deviceStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getStoredDevices", () => {
    it("returns empty array when nothing stored", () => {
      expect(getStoredDevices()).toEqual([]);
    });

    it("returns devices from new format", () => {
      const devices: StoredDevice[] = [
        { wifiMac: "AABBCCDDEEFF", bleMac: "001122334455" },
        { wifiMac: "112233445566" },
      ];
      localStorage.setItem("fireplaces-v2", JSON.stringify(devices));

      expect(getStoredDevices()).toEqual(devices);
    });

    it("migrates from old format to new", () => {
      const oldDevices = ["AABBCCDDEEFF", "112233445566"];
      localStorage.setItem("fireplaces", JSON.stringify(oldDevices));

      const result = getStoredDevices();

      expect(result).toEqual([
        { wifiMac: "AABBCCDDEEFF" },
        { wifiMac: "112233445566" },
      ]);
      // Old format should be removed
      expect(localStorage.getItem("fireplaces")).toBeNull();
      // New format should be saved
      expect(localStorage.getItem("fireplaces-v2")).toBeTruthy();
    });

    it("handles invalid JSON in new format", () => {
      localStorage.setItem("fireplaces-v2", "invalid json");

      expect(getStoredDevices()).toEqual([]);
    });

    it("handles invalid JSON in old format", () => {
      localStorage.setItem("fireplaces", "invalid json");

      expect(getStoredDevices()).toEqual([]);
    });

    it("prefers new format over old format", () => {
      const newDevices: StoredDevice[] = [{ wifiMac: "NEW123456789" }];
      const oldDevices = ["OLD123456789"];
      localStorage.setItem("fireplaces-v2", JSON.stringify(newDevices));
      localStorage.setItem("fireplaces", JSON.stringify(oldDevices));

      expect(getStoredDevices()).toEqual(newDevices);
    });
  });

  describe("setStoredDevices", () => {
    it("saves devices to localStorage", () => {
      const devices: StoredDevice[] = [
        { wifiMac: "AABBCCDDEEFF", bleMac: "001122334455", name: "My Stove" },
      ];

      setStoredDevices(devices);

      expect(JSON.parse(localStorage.getItem("fireplaces-v2")!)).toEqual(
        devices,
      );
    });
  });

  describe("addStoredDevice", () => {
    it("adds device to empty storage", () => {
      const device: StoredDevice = { wifiMac: "AABBCCDDEEFF" };

      const result = addStoredDevice(device);

      expect(result).toEqual([device]);
      expect(getStoredDevices()).toEqual([device]);
    });

    it("adds device to existing storage", () => {
      const existing: StoredDevice = { wifiMac: "EXISTING12345" };
      setStoredDevices([existing]);

      const newDevice: StoredDevice = {
        wifiMac: "NEWDEVICE1234",
        bleMac: "001122334455",
      };
      const result = addStoredDevice(newDevice);

      expect(result).toEqual([existing, newDevice]);
    });

    it("prevents duplicate WiFi MAC", () => {
      const device: StoredDevice = { wifiMac: "AABBCCDDEEFF" };
      setStoredDevices([device]);

      const duplicate: StoredDevice = {
        wifiMac: "AABBCCDDEEFF",
        bleMac: "different",
      };
      const result = addStoredDevice(duplicate);

      expect(result).toEqual([device]);
      expect(getStoredDevices()).toHaveLength(1);
    });
  });

  describe("removeStoredDevice", () => {
    it("removes device by index", () => {
      const devices: StoredDevice[] = [
        { wifiMac: "DEVICE1" },
        { wifiMac: "DEVICE2" },
        { wifiMac: "DEVICE3" },
      ];
      setStoredDevices(devices);

      const result = removeStoredDevice(1);

      expect(result).toEqual([{ wifiMac: "DEVICE1" }, { wifiMac: "DEVICE3" }]);
    });

    it("handles out of bounds index gracefully", () => {
      const devices: StoredDevice[] = [{ wifiMac: "DEVICE1" }];
      setStoredDevices(devices);

      const result = removeStoredDevice(5);

      expect(result).toEqual(devices);
    });
  });

  describe("updateDeviceBleMac", () => {
    it("updates BLE MAC for existing device", () => {
      const devices: StoredDevice[] = [
        { wifiMac: "AABBCCDDEEFF" },
        { wifiMac: "112233445566" },
      ];
      setStoredDevices(devices);

      const result = updateDeviceBleMac("AABBCCDDEEFF", "001122334455");

      expect(result).toEqual([
        { wifiMac: "AABBCCDDEEFF", bleMac: "001122334455" },
        { wifiMac: "112233445566" },
      ]);
    });

    it("does not modify devices if WiFi MAC not found", () => {
      const devices: StoredDevice[] = [{ wifiMac: "AABBCCDDEEFF" }];
      setStoredDevices(devices);

      const result = updateDeviceBleMac("NOTFOUND12345", "001122334455");

      expect(result).toEqual(devices);
    });

    it("overwrites existing BLE MAC", () => {
      const devices: StoredDevice[] = [
        { wifiMac: "AABBCCDDEEFF", bleMac: "OLD123456789" },
      ];
      setStoredDevices(devices);

      const result = updateDeviceBleMac("AABBCCDDEEFF", "NEW987654321");

      expect(result).toEqual([
        { wifiMac: "AABBCCDDEEFF", bleMac: "NEW987654321" },
      ]);
    });
  });

  describe("getDeviceByWifiMac", () => {
    it("finds device by WiFi MAC", () => {
      const devices: StoredDevice[] = [
        { wifiMac: "AABBCCDDEEFF", bleMac: "001122334455", name: "My Stove" },
        { wifiMac: "112233445566" },
      ];
      setStoredDevices(devices);

      const result = getDeviceByWifiMac("AABBCCDDEEFF");

      expect(result).toEqual({
        wifiMac: "AABBCCDDEEFF",
        bleMac: "001122334455",
        name: "My Stove",
      });
    });

    it("returns undefined when device not found", () => {
      const devices: StoredDevice[] = [{ wifiMac: "AABBCCDDEEFF" }];
      setStoredDevices(devices);

      expect(getDeviceByWifiMac("NOTFOUND12345")).toBeUndefined();
    });

    it("returns undefined when storage is empty", () => {
      expect(getDeviceByWifiMac("AABBCCDDEEFF")).toBeUndefined();
    });
  });
});
