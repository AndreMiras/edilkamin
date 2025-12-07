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
    } as any,
    name: "Test Fireplace",
    mac_address: "aabbccddeeff",
    ...overrides,
  }) as DeviceInfoType;

describe("DeviceDetails", () => {
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

    expect(screen.getByText(/environment:/i)).toBeInTheDocument();
    // Check container HTML for the value since it appears multiple times
    expect(container.textContent).toContain("22");
  });

  it("should render all three environment temperature settings", () => {
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

    expect(screen.getByText(/environment_1_temperature/i)).toBeInTheDocument();
    expect(screen.getByText(/environment_2_temperature/i)).toBeInTheDocument();
    expect(screen.getByText(/environment_3_temperature/i)).toBeInTheDocument();
    expect(screen.getByText(/18/)).toBeInTheDocument();
    expect(screen.getByText(/21/)).toBeInTheDocument();
    expect(screen.getByText(/24/)).toBeInTheDocument();
  });

  it("should render is_auto boolean value", () => {
    const mockDevice = createMockDevice({
      nvm: {
        user_parameters: {
          enviroment_1_temperature: 20,
          enviroment_2_temperature: 22,
          enviroment_3_temperature: 24,
          is_auto: true,
          is_sound_active: false,
        } as any,
      } as any,
    });

    render(<DeviceDetails info={mockDevice} />);

    expect(screen.getByText(/is_auto/i)).toBeInTheDocument();
    expect(screen.getByText(/true/)).toBeInTheDocument();
  });

  it("should render is_sound_active boolean value", () => {
    const mockDevice = createMockDevice({
      nvm: {
        user_parameters: {
          enviroment_1_temperature: 20,
          enviroment_2_temperature: 22,
          enviroment_3_temperature: 24,
          is_auto: false,
          is_sound_active: true,
        } as any,
      } as any,
    });

    render(<DeviceDetails info={mockDevice} />);

    expect(screen.getByText(/is_sound_active/i)).toBeInTheDocument();
    // Should find the "true" value for is_sound_active
    const listItems = screen.getAllByText(/true/);
    expect(listItems.length).toBeGreaterThan(0);
  });

  it("should render all properties in a list", () => {
    const mockDevice = createMockDevice();

    const { container } = render(<DeviceDetails info={mockDevice} />);

    const list = container.querySelector("ul");
    expect(list).toBeInTheDocument();

    const listItems = container.querySelectorAll("li");
    expect(listItems.length).toBe(7); // 7 properties displayed
  });

  it("should display temperature values with degree symbol", () => {
    const mockDevice = createMockDevice();

    const { container } = render(<DeviceDetails info={mockDevice} />);

    // Check for degree symbols (rendered as &deg; in HTML)
    const htmlContent = container.innerHTML;
    expect(htmlContent).toContain("°");
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

    // Should display decimal values as-is
    expect(screen.getByText(/45\.567/)).toBeInTheDocument();
    expect(screen.getByText(/22\.123/)).toBeInTheDocument();
  });

  it("should handle integer temperature values", () => {
    const mockDevice = createMockDevice({
      nvm: {
        user_parameters: {
          enviroment_1_temperature: 20,
          enviroment_2_temperature: 22,
          enviroment_3_temperature: 24,
          is_auto: true,
          is_sound_active: false,
        } as any,
      } as any,
    });

    const { container } = render(<DeviceDetails info={mockDevice} />);

    // Check container text content for values that appear multiple times
    expect(container.textContent).toContain("20");
    expect(container.textContent).toContain("22");
    expect(container.textContent).toContain("24");
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
      } as any,
    });

    const { container } = render(<DeviceDetails info={mockDevice} />);

    // Should render "false" as string in the content
    expect(container.textContent).toContain("false");
    // Check that both boolean values are converted to strings
    const matches = container.textContent?.match(/false/g);
    expect(matches?.length).toBe(2); // Both is_auto and is_sound_active are false
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
      } as any,
    });

    const { container } = render(<DeviceDetails info={mockDevice} />);

    // Should render without errors
    const list = container.querySelector("ul");
    expect(list).toBeInTheDocument();
  });
});
