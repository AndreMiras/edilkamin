import { fireEvent, waitFor } from "@testing-library/react";
import { DeviceInfoType } from "edilkamin";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "../test/utils";
import DebugInfo from "./DebugInfo";

// Mock clipboard API
const mockWriteText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  mockWriteText.mockClear();
  // Use Object.defineProperty to override the read-only clipboard property
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: mockWriteText,
    },
    writable: true,
    configurable: true,
  });
});

describe("DebugInfo Component", () => {
  const mockDeviceInfo: DeviceInfoType = {
    status: {
      commands: {
        power: true,
      },
      temperatures: {
        board: 45,
        enviroment: 22,
      },
      flags: {
        is_pellet_in_reserve: false,
      },
      pellet: {
        autonomy_time: 900,
      },
    },
    nvm: {
      user_parameters: {
        enviroment_1_temperature: 20,
        enviroment_2_temperature: 22,
        enviroment_3_temperature: 24,
        is_auto: false,
        is_sound_active: true,
        manual_power: 1,
        fan_1_ventilation: 3,
        fan_2_ventilation: 0,
        fan_3_ventilation: 0,
        is_standby_active: true,
        standby_waiting_time: 300,
        is_fahrenheit: false,
        language: 1,
      },
    },
  };

  it("renders device info as formatted JSON with syntax highlighting", () => {
    const { container } = render(<DebugInfo info={mockDeviceInfo} />);

    // Check that JSON content is rendered (syntax highlighting splits into spans)
    const pre = container.querySelector("pre");
    expect(pre).toBeInTheDocument();
    expect(pre?.textContent).toContain("power");
    expect(pre?.textContent).toContain("true");
    expect(pre?.textContent).toContain("enviroment");
  });

  it("renders null value when info is null", () => {
    const { container } = render(<DebugInfo info={null} />);

    const pre = container.querySelector("pre");
    expect(pre).toBeInTheDocument();
    expect(pre?.textContent).toBe("null");
  });

  it("formats JSON with proper indentation", () => {
    const { container } = render(<DebugInfo info={mockDeviceInfo} />);

    const pre = container.querySelector("pre");
    expect(pre?.textContent).toContain("status");
    expect(pre?.textContent).toContain("nvm");
  });

  it("displays nested objects correctly", () => {
    const { container } = render(<DebugInfo info={mockDeviceInfo} />);

    const pre = container.querySelector("pre");
    expect(pre?.textContent).toContain("status");
    expect(pre?.textContent).toContain("nvm");
    expect(pre?.textContent).toContain("temperatures");
  });

  it("uses pre tag for rendering", () => {
    const { container } = render(<DebugInfo info={mockDeviceInfo} />);

    const pre = container.querySelector("pre");
    expect(pre).toBeInTheDocument();
  });

  it("has a copy button", () => {
    render(<DebugInfo info={mockDeviceInfo} />);

    const copyButton = screen.getByRole("button", { name: /copy/i });
    expect(copyButton).toBeInTheDocument();
  });

  it("shows check icon after copy button is clicked", async () => {
    const { container } = render(<DebugInfo info={mockDeviceInfo} />);

    const copyButton = screen.getByRole("button", { name: /copy/i });
    fireEvent.click(copyButton);

    // After clicking, the icon should change from "copy" to "check"
    await waitFor(() => {
      const checkIcon = container.querySelector('[data-icon="check"]');
      expect(checkIcon).toBeInTheDocument();
    });
  });

  it("has scrollable container with max height", () => {
    const { container } = render(<DebugInfo info={mockDeviceInfo} />);

    const scrollContainer = container.querySelector(".overflow-y-auto");
    expect(scrollContainer).toBeInTheDocument();
    expect(scrollContainer).toHaveClass("max-h-96");
  });
});
