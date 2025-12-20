import { vi } from "vitest";

export const EDILKAMIN_DEVICE_NAME = "EDILKAMIN_EP";
export const EDILKAMIN_SERVICE_UUID = 0xabf0;

export const isWebBluetoothSupported = vi.fn(() => false);
export const scanForDevices = vi.fn();
export const scanWithOptions = vi.fn();

export interface DiscoveredDevice {
  bleMac: string;
  wifiMac: string;
  name: string;
  rssi?: number;
}
