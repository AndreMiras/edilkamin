import { DeviceInfoType } from "edilkamin";
import { describe, expect, it } from "vitest";

import { render, screen } from "../test/utils";
import DeviceDetails from "./DeviceDetails";

// Create a mock DeviceInfoType with all required fields
const createMockDevice = (
  overrides?: Partial<DeviceInfoType>,
): DeviceInfoType =>
  ({
    status: {
      temperatures: {
        board: 45.5,
        enviroment: 22.0,
      } as any,
      flags: {} as any,
      commands: {} as any,
      state: 0,
    },
    nvm: {
      user_parameters: {
        enviroment_1_temperature: 20,
        enviroment_2_temperature: 22,
        enviroment_3_temperature: 24,
        is_auto: true,
        is_sound_active: false,
      } as any,
      installer_parameters: {
        enviroment_1_input: 1,
        enviroment_2_input: 0,
        enviroment_3_input: 0,
      },
    } as any,
    name: "Test Fireplace",
    mac_address: "aabbccddeeff",
    ...overrides,
  }) as DeviceInfoType;

describe("DeviceDetails", () => {
  describe("Temperature Readings Section", () => {
    it("should render board temperature", () => {
      const mockDevice = createMockDevice({
        status: {
          temperatures: {
            board: 45.5,
            enviroment: 22.0,
          } as any,
          flags: {} as any,
          commands: {} as any,
          state: 0,
        },
      } as any);

      render(<DeviceDetails info={mockDevice} />);

      expect(screen.getByText(/board/i)).toBeInTheDocument();
      expect(screen.getByText(/45\.5/)).toBeInTheDocument();
    });

    it("should render environment temperature", () => {
      const mockDevice = createMockDevice({
        status: {
          temperatures: {
            board: 45.5,
            enviroment: 22.0,
          } as any,
          flags: {} as any,
          commands: {} as any,
          state: 0,
        },
      } as any);

      const { container } = render(<DeviceDetails info={mockDevice} />);

      expect(screen.getByText(/environment/i)).toBeInTheDocument();
      expect(container.textContent).toContain("22");
    });

    it("should display section header for temperature readings", () => {
      const mockDevice = createMockDevice();
      render(<DeviceDetails info={mockDevice} />);

      expect(screen.getByText("Temperature Readings")).toBeInTheDocument();
    });

    it("should handle decimal temperature values", () => {
      const mockDevice = createMockDevice({
        status: {
          temperatures: {
            board: 45.567,
            enviroment: 22.123,
          } as any,
          flags: {} as any,
          commands: {} as any,
          state: 0,
        },
      } as any);

      render(<DeviceDetails info={mockDevice} />);

      expect(screen.getByText(/45\.567/)).toBeInTheDocument();
      expect(screen.getByText(/22\.123/)).toBeInTheDocument();
    });
  });

  describe("Target Temperatures Section", () => {
    it("should display section header for target temperatures", () => {
      const mockDevice = createMockDevice();
      render(<DeviceDetails info={mockDevice} />);

      expect(screen.getByText("Target Temperatures")).toBeInTheDocument();
    });

    it("should render zone 1 when active", () => {
      const mockDevice = createMockDevice({
        nvm: {
          user_parameters: {
            enviroment_1_temperature: 18,
            enviroment_2_temperature: 21,
            enviroment_3_temperature: 24,
            is_auto: true,
            is_sound_active: true,
          } as any,
          installer_parameters: {
            enviroment_1_input: 1,
            enviroment_2_input: 0,
            enviroment_3_input: 0,
          },
        } as any,
      });

      render(<DeviceDetails info={mockDevice} />);

      expect(screen.getByText("Zone 1")).toBeInTheDocument();
      expect(screen.getByText(/18/)).toBeInTheDocument();
    });

    it("should render all zones when all are active", () => {
      const mockDevice = createMockDevice({
        nvm: {
          user_parameters: {
            enviroment_1_temperature: 18,
            enviroment_2_temperature: 21,
            enviroment_3_temperature: 24,
            is_auto: true,
            is_sound_active: true,
          } as any,
          installer_parameters: {
            enviroment_1_input: 1,
            enviroment_2_input: 1,
            enviroment_3_input: 1,
          },
        } as any,
      });

      render(<DeviceDetails info={mockDevice} />);

      expect(screen.getByText("Zone 1")).toBeInTheDocument();
      expect(screen.getByText("Zone 2")).toBeInTheDocument();
      expect(screen.getByText("Zone 3")).toBeInTheDocument();
      expect(screen.getByText(/18/)).toBeInTheDocument();
      expect(screen.getByText(/21/)).toBeInTheDocument();
      expect(screen.getByText(/24/)).toBeInTheDocument();
    });

    it("should hide zone 2 and 3 when inactive", () => {
      const mockDevice = createMockDevice({
        nvm: {
          user_parameters: {
            enviroment_1_temperature: 18,
            enviroment_2_temperature: 21,
            enviroment_3_temperature: 24,
            is_auto: true,
            is_sound_active: true,
          } as any,
          installer_parameters: {
            enviroment_1_input: 1,
            enviroment_2_input: 0,
            enviroment_3_input: 0,
          },
        } as any,
      });

      render(<DeviceDetails info={mockDevice} />);

      expect(screen.getByText("Zone 1")).toBeInTheDocument();
      expect(screen.queryByText("Zone 2")).not.toBeInTheDocument();
      expect(screen.queryByText("Zone 3")).not.toBeInTheDocument();
    });

    it("should default to showing zone 1 when installer_parameters missing", () => {
      const mockDevice = createMockDevice({
        nvm: {
          user_parameters: {
            enviroment_1_temperature: 18,
            enviroment_2_temperature: 21,
            enviroment_3_temperature: 24,
            is_auto: true,
            is_sound_active: true,
          } as any,
        } as any,
      });

      render(<DeviceDetails info={mockDevice} />);

      expect(screen.getByText("Zone 1")).toBeInTheDocument();
      expect(screen.queryByText("Zone 2")).not.toBeInTheDocument();
      expect(screen.queryByText("Zone 3")).not.toBeInTheDocument();
    });
  });

  describe("Device Settings Section", () => {
    it("should display section header for device settings", () => {
      const mockDevice = createMockDevice();
      render(<DeviceDetails info={mockDevice} />);

      expect(screen.getByText("Device Settings")).toBeInTheDocument();
    });

    it("should render is_auto boolean value as Auto Mode", () => {
      const mockDevice = createMockDevice({
        nvm: {
          user_parameters: {
            enviroment_1_temperature: 20,
            enviroment_2_temperature: 22,
            enviroment_3_temperature: 24,
            is_auto: true,
            is_sound_active: false,
          } as any,
          installer_parameters: {
            enviroment_1_input: 1,
            enviroment_2_input: 0,
            enviroment_3_input: 0,
          },
        } as any,
      });

      render(<DeviceDetails info={mockDevice} />);

      expect(screen.getByText(/Auto Mode/i)).toBeInTheDocument();
      expect(screen.getByText(/true/)).toBeInTheDocument();
    });

    it("should render is_sound_active boolean value as Sound", () => {
      const mockDevice = createMockDevice({
        nvm: {
          user_parameters: {
            enviroment_1_temperature: 20,
            enviroment_2_temperature: 22,
            enviroment_3_temperature: 24,
            is_auto: false,
            is_sound_active: true,
          } as any,
          installer_parameters: {
            enviroment_1_input: 1,
            enviroment_2_input: 0,
            enviroment_3_input: 0,
          },
        } as any,
      });

      render(<DeviceDetails info={mockDevice} />);

      expect(screen.getByText(/Sound/i)).toBeInTheDocument();
      const trueElements = screen.getAllByText(/true/);
      expect(trueElements.length).toBeGreaterThan(0);
    });

    it("should convert boolean false to string", () => {
      const mockDevice = createMockDevice({
        nvm: {
          user_parameters: {
            enviroment_1_temperature: 20,
            enviroment_2_temperature: 22,
            enviroment_3_temperature: 24,
            is_auto: false,
            is_sound_active: false,
          } as any,
          installer_parameters: {
            enviroment_1_input: 1,
            enviroment_2_input: 0,
            enviroment_3_input: 0,
          },
        } as any,
      });

      const { container } = render(<DeviceDetails info={mockDevice} />);

      expect(container.textContent).toContain("false");
      const matches = container.textContent?.match(/false/g);
      expect(matches?.length).toBe(2);
    });
  });

  describe("Layout and Structure", () => {
    it("should display temperature values with degree symbol", () => {
      const mockDevice = createMockDevice();

      const { container } = render(<DeviceDetails info={mockDevice} />);

      const htmlContent = container.innerHTML;
      expect(htmlContent).toContain("°");
    });

    it("should have three grouped sections", () => {
      const mockDevice = createMockDevice();

      render(<DeviceDetails info={mockDevice} />);

      expect(screen.getByText("Temperature Readings")).toBeInTheDocument();
      expect(screen.getByText("Target Temperatures")).toBeInTheDocument();
      expect(screen.getByText("Device Settings")).toBeInTheDocument();
    });

    it("should render with zero temperature values", () => {
      const mockDevice = createMockDevice({
        status: {
          temperatures: {
            board: 0,
            enviroment: 0,
          } as any,
          flags: {} as any,
          commands: {} as any,
          state: 0,
        } as any,
        nvm: {
          user_parameters: {
            enviroment_1_temperature: 0,
            enviroment_2_temperature: 0,
            enviroment_3_temperature: 0,
            is_auto: false,
            is_sound_active: false,
          } as any,
          installer_parameters: {
            enviroment_1_input: 1,
            enviroment_2_input: 0,
            enviroment_3_input: 0,
          },
        } as any,
      });

      render(<DeviceDetails info={mockDevice} />);

      expect(screen.getByText("Temperature Readings")).toBeInTheDocument();
      expect(screen.getByText("Target Temperatures")).toBeInTheDocument();
      expect(screen.getByText("Device Settings")).toBeInTheDocument();
    });
  });
});
