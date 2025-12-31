import userEvent from "@testing-library/user-event";
import { getSession } from "edilkamin";
import * as bluetoothWeb from "edilkamin/bluetooth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, waitFor, within } from "../test/utils";
import * as bluetoothLocal from "../utils/bluetooth";
import Home from "./Home";

// Mock edilkamin's getSession to resolve immediately
vi.mock("edilkamin", () => ({
  getSession: vi.fn(),
}));

// Mock the DeviceThermostat component to avoid needing to mock the entire device control flow
vi.mock("./DeviceThermostat", () => ({
  default: ({ mac }: { mac: string }) => (
    <div data-testid={`device-thermostat-${mac}`}>
      <a href={`/fireplace/${mac}`}>{mac}</a>
    </div>
  ),
}));

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore default mock implementations
    vi.mocked(bluetoothLocal.isBluetoothSupported).mockReturnValue(true);
    vi.mocked(bluetoothLocal.isBluetoothEnabled).mockResolvedValue(true);
    vi.mocked(bluetoothLocal.scanForDevices).mockResolvedValue([]);
    localStorage.clear();
    // Set a valid token so we see the authenticated state
    localStorage.setItem("edilkamin-token", "test-token");
    // Mock getSession to return the token immediately
    vi.mocked(getSession).mockResolvedValue("test-token");
  });

  const openManageDevicesModal = async (
    user: ReturnType<typeof userEvent.setup>,
  ) => {
    // Wait for dashboard to load (authenticated state)
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /manage devices/i }),
      ).toBeInTheDocument();
    });
    const manageButton = screen.getByRole("button", {
      name: /manage devices/i,
    });
    await user.click(manageButton);
    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  };

  it("should render empty state when no devices stored", async () => {
    render(<Home />);

    // Wait for authenticated state to render (manage button appears when authenticated)
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /manage devices/i }),
      ).toBeInTheDocument();
    });

    // Should show empty state message
    expect(screen.getByText(/no registered fireplaces/i)).toBeInTheDocument();
  });

  it("should open device management dialog when clicking add first device button", async () => {
    const user = userEvent.setup();
    render(<Home />);

    // Wait for authenticated state
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /manage devices/i }),
      ).toBeInTheDocument();
    });

    // Click the "Add your first device" button in empty state
    const addFirstDeviceButton = screen.getByRole("button", {
      name: /add your first device/i,
    });
    await user.click(addFirstDeviceButton);

    // Dialog should be open
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("should show bluetooth hint when not authenticated and BLE is supported", async () => {
    localStorage.clear(); // No token
    // getSession won't be called since there's no stored token
    // BLE is mocked as supported in beforeEach

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/bluetooth mode available/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          /control your stove via bluetooth without logging in/i,
        ),
      ).toBeInTheDocument();
    });
  });

  it("should show login form when not authenticated and BLE is not supported", async () => {
    localStorage.clear(); // No token
    vi.mocked(bluetoothLocal.isBluetoothSupported).mockReturnValue(false);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/login required/i)).toBeInTheDocument();
      // Should show login form (aria-label is "Email" and "Password")
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });
  });

  it("should load devices from localStorage on mount", async () => {
    const mockDevices = ["aabbccddeeff", "112233445566"];
    localStorage.setItem("fireplaces", JSON.stringify(mockDevices));

    render(<Home />);

    // Wait for authenticated state first
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /manage devices/i }),
      ).toBeInTheDocument();
    });

    // Devices should be displayed via DeviceThermostat components
    expect(
      screen.getByTestId("device-thermostat-aabbccddeeff"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("device-thermostat-112233445566"),
    ).toBeInTheDocument();
  });

  it("should add valid MAC address to list via modal", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Fireplaces")).toBeInTheDocument();
    });

    await openManageDevicesModal(user);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);
    const addButton = screen.getByRole("button", { name: /add fireplace/i });

    await user.type(input, "aabbccddeeff");
    await user.click(addButton);

    // Device should appear in the grid
    await waitFor(() => {
      expect(
        screen.getByTestId("device-thermostat-aabbccddeeff"),
      ).toBeInTheDocument();
    });

    // Should be persisted to localStorage (new format)
    const stored = JSON.parse(localStorage.getItem("fireplaces-v2") || "[]");
    expect(stored.map((d: { wifiMac: string }) => d.wifiMac)).toContain(
      "aabbccddeeff",
    );
  });

  it("should accept colon-separated MAC address format", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Fireplaces")).toBeInTheDocument();
    });

    await openManageDevicesModal(user);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);
    const addButton = screen.getByRole("button", { name: /add fireplace/i });

    await user.type(input, "aa:bb:cc:dd:ee:ff");
    await user.click(addButton);

    // Should be normalized and stored (new format)
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("fireplaces-v2") || "[]");
      expect(stored.map((d: { wifiMac: string }) => d.wifiMac)).toContain(
        "aabbccddeeff",
      );
    });
  });

  it("should reject invalid MAC address", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Fireplaces")).toBeInTheDocument();
    });

    await openManageDevicesModal(user);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);
    const addButton = screen.getByRole("button", { name: /add fireplace/i });

    await user.type(input, "invalid-mac");

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Invalid MAC address/i)).toBeInTheDocument();
    });

    // Button should be disabled
    expect(addButton).toBeDisabled();

    // Should NOT be added to localStorage (new format)
    const stored = JSON.parse(localStorage.getItem("fireplaces-v2") || "[]");
    expect(stored.map((d: { wifiMac: string }) => d.wifiMac)).not.toContain(
      "invalid-mac",
    );
  });

  it("should remove device from list via modal", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "fireplaces-v2",
      JSON.stringify([
        { wifiMac: "aabbccddeeff" },
        { wifiMac: "112233445566" },
      ]),
    );

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.getByTestId("device-thermostat-aabbccddeeff"),
      ).toBeInTheDocument();
    });

    await openManageDevicesModal(user);

    // Find remove button for first device in the modal
    const dialog = screen.getByRole("dialog");
    const firstDeviceItem = within(dialog)
      .getByText("aabbccddeeff")
      .closest("li");
    expect(firstDeviceItem).toBeInTheDocument();

    const removeButton = within(firstDeviceItem!).getByRole("button", {
      name: /remove/i,
    });
    await user.click(removeButton);

    // Device should be removed from grid
    await waitFor(() => {
      expect(
        screen.queryByTestId("device-thermostat-aabbccddeeff"),
      ).not.toBeInTheDocument();
    });

    // Should be removed from localStorage (new format)
    const stored = JSON.parse(localStorage.getItem("fireplaces-v2") || "[]");
    const wifiMacs = stored.map((d: { wifiMac: string }) => d.wifiMac);
    expect(wifiMacs).not.toContain("aabbccddeeff");
    expect(wifiMacs).toContain("112233445566");
  });

  it("should clear input after successful add", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Fireplaces")).toBeInTheDocument();
    });

    await openManageDevicesModal(user);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);
    const addButton = screen.getByRole("button", { name: /add fireplace/i });

    await user.type(input, "aabbccddeeff");
    await user.click(addButton);

    // Input should be cleared
    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("should not add duplicate MAC addresses", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "fireplaces-v2",
      JSON.stringify([{ wifiMac: "aabbccddeeff" }]),
    );

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.getByTestId("device-thermostat-aabbccddeeff"),
      ).toBeInTheDocument();
    });

    await openManageDevicesModal(user);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);

    await user.type(input, "aabbccddeeff");

    // Should show validation message about duplicate
    await waitFor(() => {
      expect(screen.getByText(/Device already added/i)).toBeInTheDocument();
    });

    // Add button should be disabled
    const addButton = screen.getByRole("button", { name: /add fireplace/i });
    expect(addButton).toBeDisabled();

    // Should not add duplicate (new format)
    const stored = JSON.parse(localStorage.getItem("fireplaces-v2") || "[]");
    const wifiMacs = stored.map((d: { wifiMac: string }) => d.wifiMac);
    expect(
      wifiMacs.filter((mac: string) => mac === "aabbccddeeff"),
    ).toHaveLength(1);
  });

  it("should disable add button when input is empty", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Fireplaces")).toBeInTheDocument();
    });

    await openManageDevicesModal(user);

    const addButton = screen.getByRole("button", { name: /add fireplace/i });
    expect(addButton).toBeDisabled();
  });

  it("should enable add button when valid MAC is entered", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Fireplaces")).toBeInTheDocument();
    });

    await openManageDevicesModal(user);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);
    const addButton = screen.getByRole("button", { name: /add fireplace/i });

    await user.type(input, "aabbccddeeff");

    // Button should be enabled
    await waitFor(() => {
      expect(addButton).not.toBeDisabled();
    });
  });

  it("should submit on Enter key press", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Fireplaces")).toBeInTheDocument();
    });

    await openManageDevicesModal(user);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);

    await user.type(input, "aabbccddeeff");
    await user.type(input, "{Enter}");

    // Device should be added
    await waitFor(() => {
      expect(
        screen.getByTestId("device-thermostat-aabbccddeeff"),
      ).toBeInTheDocument();
    });
  });

  it("should render links to device pages", async () => {
    localStorage.setItem("fireplaces", JSON.stringify(["aabbccddeeff"]));

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.getByTestId("device-thermostat-aabbccddeeff"),
      ).toBeInTheDocument();
    });

    const link = screen.getByRole("link", { name: "aabbccddeeff" });
    expect(link).toHaveAttribute("href", "/fireplace/aabbccddeeff");
  });

  it("should show validation feedback for invalid input", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Fireplaces")).toBeInTheDocument();
    });

    await openManageDevicesModal(user);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);
    await user.type(input, "xyz");

    // Should mark input as invalid with destructive border
    await waitFor(() => {
      expect(input.className).toContain("border-destructive");
    });
  });

  it("should clear validation feedback when input is cleared", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Fireplaces")).toBeInTheDocument();
    });

    await openManageDevicesModal(user);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);

    // Type invalid value
    await user.type(input, "xyz");
    await waitFor(() => {
      expect(input.className).toContain("border-destructive");
    });

    // Clear input
    await user.clear(input);

    // Validation should be cleared
    await waitFor(() => {
      expect(input.className).not.toContain("border-destructive");
    });
  });

  it("should handle multiple devices correctly", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Fireplaces")).toBeInTheDocument();
    });

    await openManageDevicesModal(user);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);
    const addButton = screen.getByRole("button", { name: /add fireplace/i });

    // Add first device
    await user.type(input, "aabbccddeeff");
    await user.click(addButton);

    // Add second device
    await user.type(input, "112233445566");
    await user.click(addButton);

    // Both should be in the grid
    await waitFor(() => {
      expect(
        screen.getByTestId("device-thermostat-aabbccddeeff"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("device-thermostat-112233445566"),
      ).toBeInTheDocument();
    });

    // Both should be in localStorage (new format)
    const stored = JSON.parse(localStorage.getItem("fireplaces-v2") || "[]");
    const wifiMacs = stored.map((d: { wifiMac: string }) => d.wifiMac);
    expect(wifiMacs).toEqual(["aabbccddeeff", "112233445566"]);
  });

  it("should render centered flex container for multiple devices", async () => {
    localStorage.setItem(
      "fireplaces-v2",
      JSON.stringify([
        { wifiMac: "aabbccddeeff" },
        { wifiMac: "112233445566" },
      ]),
    );

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.getByTestId("device-thermostat-aabbccddeeff"),
      ).toBeInTheDocument();
    });

    // Check for flex container with centering
    const container = screen.getByTestId(
      "device-thermostat-aabbccddeeff",
    ).parentElement;
    expect(container?.className).toContain("flex");
    expect(container?.className).toContain("justify-center");
  });

  describe("Bluetooth scanning", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should render scan button in modal", async () => {
      const user = userEvent.setup();
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Fireplaces")).toBeInTheDocument();
      });

      await openManageDevicesModal(user);

      const scanButton = screen.getByRole("button", {
        name: /scan for devices/i,
      });
      expect(scanButton).toBeInTheDocument();
    });

    it("should show disabled scan button when bluetooth not supported", async () => {
      // Mock bluetooth as not supported
      vi.spyOn(bluetoothLocal, "isBluetoothSupported").mockReturnValue(false);

      const user = userEvent.setup();
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Fireplaces")).toBeInTheDocument();
      });

      await openManageDevicesModal(user);

      const scanButton = screen.getByRole("button", {
        name: /scan for devices/i,
      });
      expect(scanButton).toBeDisabled();
    });

    it("should show tooltip on hover when bluetooth not supported", async () => {
      // Mock bluetooth as not supported
      vi.spyOn(bluetoothLocal, "isBluetoothSupported").mockReturnValue(false);

      const user = userEvent.setup();
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Fireplaces")).toBeInTheDocument();
      });

      await openManageDevicesModal(user);

      const scanButton = screen.getByRole("button", {
        name: /scan for devices/i,
      });

      await user.hover(scanButton);

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });
    });

    it("should add device to list after successful scan", async () => {
      // Mock our local scanForDevices function to return a device
      vi.mocked(bluetoothLocal.scanForDevices).mockResolvedValue([
        {
          bleMac: "a8032afed50a",
          wifiMac: "a8032afed508",
          name: "EDILKAMIN_EP",
        },
      ]);

      const user = userEvent.setup();
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Fireplaces")).toBeInTheDocument();
      });

      await openManageDevicesModal(user);

      const scanButton = screen.getByRole("button", {
        name: /scan for devices/i,
      });

      await user.click(scanButton);

      // Device should be added to the grid
      await waitFor(() => {
        expect(
          screen.getByTestId("device-thermostat-a8032afed508"),
        ).toBeInTheDocument();
      });

      // Should be persisted to localStorage (new format, includes bleMac)
      const stored = JSON.parse(localStorage.getItem("fireplaces-v2") || "[]");
      expect(stored).toEqual([
        {
          wifiMac: "a8032afed508",
          bleMac: "a8032afed50a",
          name: "EDILKAMIN_EP",
        },
      ]);
    });

    it("should not show error when user cancels scan", async () => {
      // Mock our local scanForDevices to return empty array (user cancelled)
      vi.mocked(bluetoothLocal.scanForDevices).mockResolvedValue([]);

      const user = userEvent.setup();
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Fireplaces")).toBeInTheDocument();
      });

      await openManageDevicesModal(user);

      const scanButton = screen.getByRole("button", {
        name: /scan for devices/i,
      });

      await user.click(scanButton);

      // Wait a bit to ensure no error appears
      await new Promise((resolve) => setTimeout(resolve, 100));

      // No error message should be shown
      expect(screen.queryByText(/scan failed/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/scan incomplete/i)).not.toBeInTheDocument();
    });
  });
});
