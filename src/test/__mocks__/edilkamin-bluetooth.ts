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

// BLE protocol layer exports
export const SERVICE_UUID = "0000abf0-0000-1000-8000-00805f9b34fb";
export const NOTIFY_CHARACTERISTIC_UUID =
  "0000abf2-0000-1000-8000-00805f9b34fb";
export const WRITE_CHARACTERISTIC_UUID = "0000abf1-0000-1000-8000-00805f9b34fb";

export const readCommands = {
  power: new Uint8Array([0x01, 0x03, 0x00, 0x00, 0x00, 0x01]),
  temperature: new Uint8Array([0x01, 0x03, 0x00, 0x01, 0x00, 0x01]),
  powerLevel: new Uint8Array([0x01, 0x03, 0x00, 0x02, 0x00, 0x01]),
  fan1Speed: new Uint8Array([0x01, 0x03, 0x00, 0x03, 0x00, 0x01]),
  autoMode: new Uint8Array([0x01, 0x03, 0x00, 0x10, 0x00, 0x01]),
};

export const writeCommands = {
  setPower: (on: boolean) =>
    new Uint8Array([0x01, 0x06, 0x00, 0x00, 0x00, on ? 0x01 : 0x00]),
  setTemperature: (temp: number) =>
    new Uint8Array([0x01, 0x06, 0x00, 0x01, 0x00, temp * 2]),
  setPowerLevel: (level: number) =>
    new Uint8Array([0x01, 0x06, 0x00, 0x02, 0x00, level]),
  setFan1Speed: (speed: number) =>
    new Uint8Array([0x01, 0x06, 0x00, 0x03, 0x00, speed]),
  setAutoMode: (enabled: boolean) =>
    new Uint8Array([0x01, 0x06, 0x00, 0x10, 0x00, enabled ? 0x01 : 0x00]),
};

export interface ModbusResponse {
  isError: boolean;
  data: Uint8Array;
}

export const parsers = {
  // Boolean values are typically in the last byte of a 2-byte register value
  boolean: (response: ModbusResponse) => {
    // If 2 bytes (register value), check last byte; otherwise check first
    if (response.data.length >= 2) {
      return response.data[1] === 1;
    }
    return response.data[0] === 1;
  },
  number: (response: ModbusResponse) => {
    // If 2 bytes, combine as 16-bit value; otherwise return single byte
    if (response.data.length >= 2) {
      return (response.data[0] << 8) | response.data[1];
    }
    return response.data[0];
  },
  temperature: (response: ModbusResponse) => {
    // Temperature is stored as degrees * 2
    if (response.data.length >= 2) {
      return ((response.data[0] << 8) | response.data[1]) / 2;
    }
    return response.data[0] / 2;
  },
};

export const createPacket = vi.fn(async (cmd: Uint8Array) => cmd);
export const parseResponse = vi.fn((data: Uint8Array): ModbusResponse => {
  // Check if function code has error bit set (0x80)
  // Modbus error responses have function code with high bit set
  const functionCode = data[1];
  const isError = (functionCode & 0x80) !== 0;

  if (isError) {
    // Error response: data[2] is the error code
    return {
      isError: true,
      data: new Uint8Array([data[2]]),
    };
  }

  // Normal response: for read responses, data starts at byte 3
  // For function code 0x03 (read holding registers): [addr, func, byteCount, data...]
  if (functionCode === 0x03) {
    const byteCount = data[2];
    // Extract data bytes (typically 2 bytes for single register)
    return {
      isError: false,
      data: data.slice(3, 3 + byteCount),
    };
  }

  // For function code 0x06 (write single register): echo response
  return {
    isError: false,
    data: new Uint8Array([]),
  };
});
