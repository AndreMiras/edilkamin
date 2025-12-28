import { Capacitor } from "@capacitor/core";
import { bleToWifiMac } from "edilkamin";
import {
  createPacket,
  ModbusResponse,
  NOTIFY_CHARACTERISTIC_UUID,
  parseResponse,
  parsers,
  readCommands,
  SERVICE_UUID,
  WRITE_CHARACTERISTIC_UUID,
  writeCommands,
} from "edilkamin/bluetooth";

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

// =============================================================================
// BLE Device Control (using edilkamin/bluetooth protocol layer)
// =============================================================================

/** Pending response resolver for notification-based responses */
let pendingResponseResolve: ((data: DataView) => void) | null = null;
let pendingResponseReject: ((error: Error) => void) | null = null;

/**
 * Connect to an Edilkamin device and set up notifications for responses.
 * Must be called before sending commands.
 *
 * @param deviceId - BLE device ID (MAC address from scanning)
 * @param onDisconnect - Optional callback when device disconnects
 */
export const connectToDevice = async (
  deviceId: string,
  onDisconnect?: (deviceId: string) => void,
): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    throw new Error("BLE device control is only supported on native platforms");
  }

  const { BleClient } = await import("@capacitor-community/bluetooth-le");

  // Initialize BLE - idempotent, safe to call multiple times
  await BleClient.initialize();

  // Connect to device
  await BleClient.connect(deviceId, (disconnectedId) => {
    // Clear any pending response
    if (pendingResponseReject) {
      pendingResponseReject(new Error("Device disconnected"));
      pendingResponseResolve = null;
      pendingResponseReject = null;
    }
    onDisconnect?.(disconnectedId);
  });

  // Start notifications for responses
  await BleClient.startNotifications(
    deviceId,
    SERVICE_UUID,
    NOTIFY_CHARACTERISTIC_UUID,
    (value: DataView) => {
      // Resolve any pending response promise
      if (pendingResponseResolve) {
        pendingResponseResolve(value);
        pendingResponseResolve = null;
        pendingResponseReject = null;
      }
    },
  );
};

/**
 * Disconnect from an Edilkamin device.
 *
 * @param deviceId - BLE device ID
 */
export const disconnectFromDevice = async (deviceId: string): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const { BleClient } = await import("@capacitor-community/bluetooth-le");

    try {
      await BleClient.stopNotifications(
        deviceId,
        SERVICE_UUID,
        NOTIFY_CHARACTERISTIC_UUID,
      );
    } catch {
      // Ignore errors stopping notifications
    }

    await BleClient.disconnect(deviceId);
  } catch {
    // Ignore errors during disconnect - this is a cleanup operation
    // and may fail if BleClient was never initialized or we were never connected
  }
};

/**
 * Send a command to the device and wait for response.
 *
 * @param deviceId - BLE device ID
 * @param command - 6-byte Modbus command
 * @param timeout - Response timeout in ms (default 5000)
 * @returns Parsed Modbus response
 */
export const sendCommand = async (
  deviceId: string,
  command: Uint8Array,
  timeout: number = 5000,
): Promise<ModbusResponse> => {
  if (!Capacitor.isNativePlatform()) {
    throw new Error("BLE device control is only supported on native platforms");
  }

  const { BleClient } = await import("@capacitor-community/bluetooth-le");

  // Initialize BLE - idempotent, safe to call multiple times
  await BleClient.initialize();

  // Build encrypted packet using edilkamin protocol
  const packet = await createPacket(command);

  // Create promise for response with timeout
  const responsePromise = new Promise<DataView>((resolve, reject) => {
    pendingResponseResolve = resolve;
    pendingResponseReject = reject;

    setTimeout(() => {
      if (pendingResponseReject) {
        pendingResponseReject(new Error("Response timeout"));
        pendingResponseResolve = null;
        pendingResponseReject = null;
      }
    }, timeout);
  });

  // Send command
  await BleClient.writeWithoutResponse(
    deviceId,
    SERVICE_UUID,
    WRITE_CHARACTERISTIC_UUID,
    new DataView(packet.buffer),
  );

  // Wait for response
  const responseView = await responsePromise;

  // Convert DataView to Uint8Array for parsing
  const responseBytes = new Uint8Array(
    responseView.buffer,
    responseView.byteOffset,
    responseView.byteLength,
  );

  // Parse response using edilkamin protocol
  return parseResponse(responseBytes);
};

// =============================================================================
// High-level device control functions
// =============================================================================

/**
 * Read the current power state from the device.
 *
 * @param deviceId - BLE device ID
 * @returns true if powered on, false if off
 */
export const readPowerState = async (deviceId: string): Promise<boolean> => {
  const response = await sendCommand(deviceId, readCommands.power);
  return parsers.boolean(response);
};

/**
 * Set the power state of the device.
 *
 * @param deviceId - BLE device ID
 * @param on - true to turn on, false to turn off
 */
export const setPower = async (
  deviceId: string,
  on: boolean,
): Promise<void> => {
  const response = await sendCommand(deviceId, writeCommands.setPower(on));
  if (response.isError) {
    throw new Error(`Failed to set power: error code ${response.data[0]}`);
  }
};

/**
 * Read the current temperature from the device.
 *
 * @param deviceId - BLE device ID
 * @returns Temperature in Celsius
 */
export const readTemperature = async (deviceId: string): Promise<number> => {
  const response = await sendCommand(deviceId, readCommands.temperature);
  return parsers.temperature(response);
};

/**
 * Set the target temperature.
 *
 * @param deviceId - BLE device ID
 * @param tempCelsius - Target temperature in Celsius
 */
export const setTemperature = async (
  deviceId: string,
  tempCelsius: number,
): Promise<void> => {
  const response = await sendCommand(
    deviceId,
    writeCommands.setTemperature(tempCelsius),
  );
  if (response.isError) {
    throw new Error(
      `Failed to set temperature: error code ${response.data[0]}`,
    );
  }
};

/**
 * Read the current power level (1-5).
 *
 * @param deviceId - BLE device ID
 * @returns Power level 1-5
 */
export const readPowerLevel = async (deviceId: string): Promise<number> => {
  const response = await sendCommand(deviceId, readCommands.powerLevel);
  return parsers.number(response);
};

/**
 * Set the power level.
 *
 * @param deviceId - BLE device ID
 * @param level - Power level 1-5
 */
export const setPowerLevel = async (
  deviceId: string,
  level: number,
): Promise<void> => {
  const response = await sendCommand(
    deviceId,
    writeCommands.setPowerLevel(level),
  );
  if (response.isError) {
    throw new Error(
      `Failed to set power level: error code ${response.data[0]}`,
    );
  }
};

/**
 * Read fan 1 speed (0=auto, 1-5=manual).
 *
 * @param deviceId - BLE device ID
 * @returns Fan speed 0-5
 */
export const readFan1Speed = async (deviceId: string): Promise<number> => {
  const response = await sendCommand(deviceId, readCommands.fan1Speed);
  return parsers.number(response);
};

/**
 * Set fan 1 speed.
 *
 * @param deviceId - BLE device ID
 * @param speed - Fan speed 0-5 (0=auto)
 */
export const setFan1Speed = async (
  deviceId: string,
  speed: number,
): Promise<void> => {
  const response = await sendCommand(
    deviceId,
    writeCommands.setFan1Speed(speed),
  );
  if (response.isError) {
    throw new Error(`Failed to set fan speed: error code ${response.data[0]}`);
  }
};

// Re-export types and commands for convenience
export type { ModbusResponse };
export { parsers, readCommands, writeCommands };
