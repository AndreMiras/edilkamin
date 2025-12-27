import { Capacitor } from "@capacitor/core";
import { bleToWifiMac } from "edilkamin";

/** Device name broadcast by Edilkamin stoves */
const EDILKAMIN_DEVICE_NAME = "EDILKAMIN_EP";

/** GATT Service UUID for Edilkamin devices (full 128-bit format) */
const EDILKAMIN_SERVICE_UUID = "0000abf0-0000-1000-8000-00805f9b34fb";

export interface DiscoveredDevice {
  bleMac: string;
  wifiMac: string;
  name: string;
}

/**
 * Check if Bluetooth scanning is supported on the current platform.
 * - Web: Checks for navigator.bluetooth availability
 * - Native (Android/iOS): Always supported via native plugin
 */
export const isBluetoothSupported = (): boolean => {
  // Use isNativePlatform() for reliable detection in WebView
  if (Capacitor.isNativePlatform()) {
    return true;
  }

  // Web platform - check for Web Bluetooth API
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
};

/**
 * Check if Bluetooth is enabled (turned on) on the device.
 * - Native: Uses BleClient.isEnabled()
 * - Web: Always returns true (cannot detect Bluetooth state in browser)
 */
export const isBluetoothEnabled = async (): Promise<boolean> => {
  if (Capacitor.isNativePlatform()) {
    const { BleClient } = await import("@capacitor-community/bluetooth-le");
    // Must initialize before checking enabled state
    await BleClient.initialize();
    return BleClient.isEnabled();
  }
  return true; // Web: assume enabled (cannot detect)
};

/**
 * Request user to enable Bluetooth via system dialog.
 * Only works on Android. Returns true if request was shown.
 */
export const requestEnableBluetooth = async (): Promise<boolean> => {
  if (Capacitor.getPlatform() === "android") {
    const { BleClient } = await import("@capacitor-community/bluetooth-le");
    // Must initialize before requesting enable
    await BleClient.initialize();
    await BleClient.requestEnable();
    return true;
  }
  return false; // iOS/Web: not supported
};

/**
 * Scan for Edilkamin devices using platform-appropriate Bluetooth API.
 * - Web: Uses Web Bluetooth API via edilkamin/bluetooth
 * - Native: Uses @capacitor-community/bluetooth-le plugin
 *
 * @returns Array of discovered devices (typically one device from picker)
 * @throws Error if scanning fails or is not supported
 */
export const scanForDevices = async (): Promise<DiscoveredDevice[]> => {
  // Use isNativePlatform() for reliable detection in WebView
  if (Capacitor.isNativePlatform()) {
    return scanWithNativePlugin();
  }

  return scanWithWebBluetooth();
};

/**
 * Scan using Web Bluetooth API (for web browsers).
 */
const scanWithWebBluetooth = async (): Promise<DiscoveredDevice[]> => {
  // Dynamic import to avoid SSR issues with Next.js
  const { scanForDevices: webScan } = await import("edilkamin/bluetooth");
  return webScan();
};

/**
 * Scan using native Bluetooth plugin (for Android/iOS).
 */
const scanWithNativePlugin = async (): Promise<DiscoveredDevice[]> => {
  const { BleClient } = await import("@capacitor-community/bluetooth-le");

  // Initialize BLE - this also handles runtime permission requests
  await BleClient.initialize();

  try {
    // Request device - opens native device picker
    const device = await BleClient.requestDevice({
      namePrefix: EDILKAMIN_DEVICE_NAME,
      optionalServices: [EDILKAMIN_SERVICE_UUID],
    });

    const bleMac = device.deviceId;
    const name = device.name || EDILKAMIN_DEVICE_NAME;

    // Convert BLE MAC to WiFi MAC for API calls
    let wifiMac = "";
    try {
      // Normalize MAC address format (remove colons/dashes if present)
      const normalizedMac = bleMac.replace(/[:-]/g, "");
      if (/^[0-9a-f]{12}$/i.test(normalizedMac)) {
        wifiMac = bleToWifiMac(normalizedMac);
      }
    } catch {
      // If conversion fails, leave wifiMac empty
      // Home component will show appropriate error
      wifiMac = "";
    }

    return [{ bleMac, wifiMac, name }];
  } catch (error) {
    // Handle user cancellation
    if (error instanceof Error && error.message.includes("cancel")) {
      return [];
    }
    throw error;
  }
};
