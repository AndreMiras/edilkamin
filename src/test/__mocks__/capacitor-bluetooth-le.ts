import { vi } from "vitest";

// Store the notification callback so tests can trigger responses
let notificationCallback: ((value: DataView) => void) | null = null;

export const BleClient = {
  initialize: vi.fn().mockResolvedValue(undefined),
  requestDevice: vi.fn().mockResolvedValue({
    deviceId: "001122334455",
    name: "EDILKAMIN_EP",
  }),
  // Bluetooth state methods
  isEnabled: vi.fn().mockResolvedValue(true),
  requestEnable: vi.fn().mockResolvedValue(undefined),
  // Additional methods that might be needed in future
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn().mockResolvedValue(undefined),
  getServices: vi.fn().mockResolvedValue([]),
  read: vi.fn().mockResolvedValue(new DataView(new ArrayBuffer(0))),
  write: vi.fn().mockImplementation(async () => {
    // Simulate device response after write
    if (notificationCallback) {
      // Return a success response (non-error, with data)
      const response = new Uint8Array([0x01, 0x03, 0x02, 0x00, 0x01]);
      notificationCallback(new DataView(response.buffer));
    }
  }),
  startNotifications: vi
    .fn()
    .mockImplementation(
      async (
        _deviceId: string,
        _serviceUUID: string,
        _charUUID: string,
        callback: (value: DataView) => void,
      ) => {
        notificationCallback = callback;
      },
    ),
  stopNotifications: vi.fn().mockResolvedValue(undefined),
};

// Helper to trigger a custom response in tests
export const triggerNotification = (data: Uint8Array) => {
  if (notificationCallback) {
    notificationCallback(new DataView(data.buffer));
  }
};

// Helper to reset the notification callback
export const resetNotificationCallback = () => {
  notificationCallback = null;
};
