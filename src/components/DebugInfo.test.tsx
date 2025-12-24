import { DeviceInfoType } from "edilkamin";
import { describe, expect, it } from "vitest";

import { render, screen } from "../test/utils";
import DebugInfo from "./DebugInfo";

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

  it("renders device info as formatted JSON", () => {
    render(<DebugInfo info={mockDeviceInfo} />);

    expect(screen.getByText(/"power": true/)).toBeInTheDocument();
    expect(screen.getByText(/"enviroment": 22/)).toBeInTheDocument();
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
    expect(pre?.textContent).toContain("\n");
    expect(pre?.textContent).toContain("  ");
  });

  it("displays nested objects correctly", () => {
    render(<DebugInfo info={mockDeviceInfo} />);

    expect(screen.getByText(/"status":/)).toBeInTheDocument();
    expect(screen.getByText(/"nvm":/)).toBeInTheDocument();
  });

  it("uses pre tag for rendering", () => {
    const { container } = render(<DebugInfo info={mockDeviceInfo} />);

    const pre = container.querySelector("pre");
    expect(pre).toBeInTheDocument();
  });
});
