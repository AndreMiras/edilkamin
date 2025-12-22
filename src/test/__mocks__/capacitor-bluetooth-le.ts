import { vi } from "vitest";

export const BleClient = {
  initialize: vi.fn().mockResolvedValue(undefined),
  requestDevice: vi.fn().mockResolvedValue({
    deviceId: "001122334455",
    name: "EDILKAMIN_EP",
  }),
  // Additional methods that might be needed in future
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn().mockResolvedValue(undefined),
  getServices: vi.fn().mockResolvedValue([]),
  read: vi.fn().mockResolvedValue(new DataView(new ArrayBuffer(0))),
  write: vi.fn().mockResolvedValue(undefined),
};
