import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  connectToDevice,
  disconnectFromDevice,
  isBluetoothSupported,
} from "@/utils/bluetooth";

import { BluetoothProvider, useBluetooth } from "./bluetooth";

// Mock the bluetooth utility functions
vi.mock("@/utils/bluetooth", () => ({
  connectToDevice: vi.fn(),
  disconnectFromDevice: vi.fn(),
  isBluetoothSupported: vi.fn(),
}));

const TestComponent = () => {
  const {
    connectionMode,
    setConnectionMode,
    isConnected,
    isConnecting,
    connectionError,
    bleDeviceId,
    setBleDeviceId,
    connect,
    disconnect,
    isBleSupported,
  } = useBluetooth();

  return (
    <div>
      <div data-testid="connectionMode">{connectionMode}</div>
      <div data-testid="isConnected">{String(isConnected)}</div>
      <div data-testid="isConnecting">{String(isConnecting)}</div>
      <div data-testid="connectionError">{connectionError || "null"}</div>
      <div data-testid="bleDeviceId">{bleDeviceId || "null"}</div>
      <div data-testid="isBleSupported">{String(isBleSupported)}</div>
      <button onClick={() => setConnectionMode("ble")}>Set BLE Mode</button>
      <button onClick={() => setConnectionMode("cloud")}>Set Cloud Mode</button>
      <button onClick={() => setBleDeviceId("test-device-id")}>
        Set Device ID
      </button>
      <button onClick={() => connect()}>Connect</button>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  );
};

describe("BluetoothContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isBluetoothSupported).mockReturnValue(true);
    vi.mocked(connectToDevice).mockResolvedValue(undefined);
    vi.mocked(disconnectFromDevice).mockResolvedValue(undefined);
  });

  describe("default state values", () => {
    it("should provide default context values", () => {
      render(
        <BluetoothProvider>
          <TestComponent />
        </BluetoothProvider>,
      );

      expect(screen.getByTestId("connectionMode")).toHaveTextContent("cloud");
      expect(screen.getByTestId("isConnected")).toHaveTextContent("false");
      expect(screen.getByTestId("isConnecting")).toHaveTextContent("false");
      expect(screen.getByTestId("connectionError")).toHaveTextContent("null");
      expect(screen.getByTestId("bleDeviceId")).toHaveTextContent("null");
    });

    it("should return correct isBleSupported value when supported", () => {
      vi.mocked(isBluetoothSupported).mockReturnValue(true);

      render(
        <BluetoothProvider>
          <TestComponent />
        </BluetoothProvider>,
      );

      expect(screen.getByTestId("isBleSupported")).toHaveTextContent("true");
    });

    it("should return correct isBleSupported value when not supported", () => {
      vi.mocked(isBluetoothSupported).mockReturnValue(false);

      render(
        <BluetoothProvider>
          <TestComponent />
        </BluetoothProvider>,
      );

      expect(screen.getByTestId("isBleSupported")).toHaveTextContent("false");
    });
  });

  describe("connection mode", () => {
    it("should update connection mode when setConnectionMode is called", async () => {
      const user = userEvent.setup();

      render(
        <BluetoothProvider>
          <TestComponent />
        </BluetoothProvider>,
      );

      expect(screen.getByTestId("connectionMode")).toHaveTextContent("cloud");

      await user.click(screen.getByRole("button", { name: "Set BLE Mode" }));

      expect(screen.getByTestId("connectionMode")).toHaveTextContent("ble");
    });

    it("should switch back to cloud mode", async () => {
      const user = userEvent.setup();

      render(
        <BluetoothProvider>
          <TestComponent />
        </BluetoothProvider>,
      );

      await user.click(screen.getByRole("button", { name: "Set BLE Mode" }));
      expect(screen.getByTestId("connectionMode")).toHaveTextContent("ble");

      await user.click(screen.getByRole("button", { name: "Set Cloud Mode" }));
      expect(screen.getByTestId("connectionMode")).toHaveTextContent("cloud");
    });
  });

  describe("connect flow", () => {
    it("should set error when connecting without device ID", async () => {
      const user = userEvent.setup();

      render(
        <BluetoothProvider>
          <TestComponent />
        </BluetoothProvider>,
      );

      await user.click(screen.getByRole("button", { name: "Connect" }));

      expect(screen.getByTestId("connectionError")).toHaveTextContent(
        "No BLE device ID set",
      );
      expect(connectToDevice).not.toHaveBeenCalled();
    });

    it("should connect successfully when device ID is set", async () => {
      const user = userEvent.setup();

      render(
        <BluetoothProvider>
          <TestComponent />
        </BluetoothProvider>,
      );

      await user.click(screen.getByRole("button", { name: "Set Device ID" }));
      await user.click(screen.getByRole("button", { name: "Connect" }));

      await waitFor(() => {
        expect(screen.getByTestId("isConnected")).toHaveTextContent("true");
      });

      expect(connectToDevice).toHaveBeenCalledWith(
        "test-device-id",
        expect.any(Function),
      );
      expect(screen.getByTestId("connectionError")).toHaveTextContent("null");
    });

    it("should show connecting state during connection", async () => {
      const user = userEvent.setup();
      let resolveConnect: () => void = () => {};
      vi.mocked(connectToDevice).mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveConnect = resolve;
          }),
      );

      render(
        <BluetoothProvider>
          <TestComponent />
        </BluetoothProvider>,
      );

      await user.click(screen.getByRole("button", { name: "Set Device ID" }));
      await user.click(screen.getByRole("button", { name: "Connect" }));

      // Should be connecting
      expect(screen.getByTestId("isConnecting")).toHaveTextContent("true");
      expect(screen.getByTestId("isConnected")).toHaveTextContent("false");

      // Resolve the connection
      resolveConnect();

      await waitFor(() => {
        expect(screen.getByTestId("isConnecting")).toHaveTextContent("false");
        expect(screen.getByTestId("isConnected")).toHaveTextContent("true");
      });
    });

    it("should handle connection error", async () => {
      const user = userEvent.setup();
      vi.mocked(connectToDevice).mockRejectedValue(new Error("BLE Error"));

      render(
        <BluetoothProvider>
          <TestComponent />
        </BluetoothProvider>,
      );

      await user.click(screen.getByRole("button", { name: "Set Device ID" }));
      await user.click(screen.getByRole("button", { name: "Connect" }));

      await waitFor(() => {
        expect(screen.getByTestId("connectionError")).toHaveTextContent(
          "BLE Error",
        );
      });

      expect(screen.getByTestId("isConnected")).toHaveTextContent("false");
      expect(screen.getByTestId("isConnecting")).toHaveTextContent("false");
    });

    it("should handle non-Error thrown during connection", async () => {
      const user = userEvent.setup();
      vi.mocked(connectToDevice).mockRejectedValue("Some string error");

      render(
        <BluetoothProvider>
          <TestComponent />
        </BluetoothProvider>,
      );

      await user.click(screen.getByRole("button", { name: "Set Device ID" }));
      await user.click(screen.getByRole("button", { name: "Connect" }));

      await waitFor(() => {
        expect(screen.getByTestId("connectionError")).toHaveTextContent(
          "Connection failed",
        );
      });
    });
  });

  describe("disconnect flow", () => {
    it("should disconnect and clear state", async () => {
      const user = userEvent.setup();

      render(
        <BluetoothProvider>
          <TestComponent />
        </BluetoothProvider>,
      );

      // First connect
      await user.click(screen.getByRole("button", { name: "Set Device ID" }));
      await user.click(screen.getByRole("button", { name: "Connect" }));

      await waitFor(() => {
        expect(screen.getByTestId("isConnected")).toHaveTextContent("true");
      });

      // Then disconnect
      await user.click(screen.getByRole("button", { name: "Disconnect" }));

      await waitFor(() => {
        expect(screen.getByTestId("isConnected")).toHaveTextContent("false");
      });

      expect(disconnectFromDevice).toHaveBeenCalledWith("test-device-id");
      expect(screen.getByTestId("connectionError")).toHaveTextContent("null");
    });

    it("should handle disconnect without device ID", async () => {
      const user = userEvent.setup();

      render(
        <BluetoothProvider>
          <TestComponent />
        </BluetoothProvider>,
      );

      await user.click(screen.getByRole("button", { name: "Disconnect" }));

      // Should not throw and should still clear connected state
      expect(disconnectFromDevice).not.toHaveBeenCalled();
      expect(screen.getByTestId("isConnected")).toHaveTextContent("false");
    });
  });

  describe("disconnect callback", () => {
    it("should update state when device disconnects unexpectedly", async () => {
      const user = userEvent.setup();
      let disconnectCallback: () => void = () => {};

      vi.mocked(connectToDevice).mockImplementation(
        async (deviceId, onDisconnect) => {
          if (onDisconnect) {
            disconnectCallback = () => onDisconnect(deviceId);
          }
        },
      );

      render(
        <BluetoothProvider>
          <TestComponent />
        </BluetoothProvider>,
      );

      await user.click(screen.getByRole("button", { name: "Set Device ID" }));
      await user.click(screen.getByRole("button", { name: "Connect" }));

      await waitFor(() => {
        expect(screen.getByTestId("isConnected")).toHaveTextContent("true");
      });

      // Simulate unexpected disconnect
      disconnectCallback();

      await waitFor(() => {
        expect(screen.getByTestId("isConnected")).toHaveTextContent("false");
        expect(screen.getByTestId("connectionError")).toHaveTextContent(
          "Device disconnected",
        );
      });
    });
  });

  describe("useBluetooth hook", () => {
    it("should throw error when used outside of provider", () => {
      // Suppress console.error for expected error
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useBluetooth must be used within BluetoothProvider");

      consoleSpy.mockRestore();
    });
  });
});
