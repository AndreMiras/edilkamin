import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "../../test/utils";
import { MAX_TEMP, MIN_TEMP } from "./constants";
import Thermostat from "./Thermostat";

describe("Thermostat", () => {
  const defaultProps = {
    temperature: 20.0,
    powerState: false,
    loading: false,
    onTemperatureChange: vi.fn(),
    onPowerChange: vi.fn(),
    isAuto: true, // Temperature controls are only shown in auto mode
  };

  it("should render with the correct temperature", () => {
    render(<Thermostat {...defaultProps} temperature={22.5} />);

    expect(screen.getByText("22.5")).toBeInTheDocument();
    expect(screen.getByText("°C")).toBeInTheDocument();
  });

  it("should display OFF status when powerState is false", () => {
    render(<Thermostat {...defaultProps} powerState={false} />);

    expect(screen.getByText("OFF")).toBeInTheDocument();
    expect(screen.getByText("Standby")).toBeInTheDocument();
  });

  it("should display ON status when powerState is true", () => {
    render(<Thermostat {...defaultProps} powerState={true} />);

    expect(screen.getByText("ON")).toBeInTheDocument();
    expect(screen.getByText("Heating")).toBeInTheDocument();
  });

  it("should call onPowerChange with 1 when power button is clicked while off", async () => {
    const onPowerChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Thermostat
        {...defaultProps}
        powerState={false}
        onPowerChange={onPowerChange}
      />,
    );

    const powerButton = screen.getByRole("button", { name: /off/i });
    await user.click(powerButton);

    expect(onPowerChange).toHaveBeenCalledWith(1);
  });

  it("should call onPowerChange with 0 when power button is clicked while on", async () => {
    const onPowerChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Thermostat
        {...defaultProps}
        powerState={true}
        onPowerChange={onPowerChange}
      />,
    );

    const powerButton = screen.getByRole("button", { name: /on/i });
    await user.click(powerButton);

    expect(onPowerChange).toHaveBeenCalledWith(0);
  });

  it("should call onTemperatureChange when decrease button is clicked", async () => {
    const onTemperatureChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Thermostat
        {...defaultProps}
        temperature={20}
        onTemperatureChange={onTemperatureChange}
      />,
    );

    const decreaseButton = screen.getByLabelText("Decrease temperature");
    await user.click(decreaseButton);

    expect(onTemperatureChange).toHaveBeenCalledWith(19.5);
  });

  it("should call onTemperatureChange when increase button is clicked", async () => {
    const onTemperatureChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Thermostat
        {...defaultProps}
        temperature={20}
        onTemperatureChange={onTemperatureChange}
      />,
    );

    const increaseButton = screen.getByLabelText("Increase temperature");
    await user.click(increaseButton);

    expect(onTemperatureChange).toHaveBeenCalledWith(20.5);
  });

  it("should disable decrease button at minimum temperature", () => {
    render(<Thermostat {...defaultProps} temperature={MIN_TEMP} />);

    const decreaseButton = screen.getByLabelText("Decrease temperature");
    expect(decreaseButton).toBeDisabled();
  });

  it("should disable increase button at maximum temperature", () => {
    render(<Thermostat {...defaultProps} temperature={MAX_TEMP} />);

    const increaseButton = screen.getByLabelText("Increase temperature");
    expect(increaseButton).toBeDisabled();
  });

  it("should apply loading state styles when loading is true", () => {
    const { container } = render(
      <Thermostat {...defaultProps} loading={true} />,
    );

    const thermostatContainer = container.firstChild;
    expect(thermostatContainer).toHaveClass("opacity-50");
    expect(thermostatContainer).toHaveClass("pointer-events-none");
  });

  it("should disable all buttons when loading", () => {
    render(<Thermostat {...defaultProps} loading={true} />);

    const powerButton = screen.getByRole("button", { name: /off/i });
    const decreaseButton = screen.getByLabelText("Decrease temperature");
    const increaseButton = screen.getByLabelText("Increase temperature");

    expect(powerButton).toBeDisabled();
    expect(decreaseButton).toBeDisabled();
    expect(increaseButton).toBeDisabled();
  });

  it("should render children when provided", () => {
    render(
      <Thermostat {...defaultProps}>
        <div data-testid="child-component">Child Content</div>
      </Thermostat>,
    );

    expect(screen.getByTestId("child-component")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("should apply flicker animation to fire icon when power is on", () => {
    render(<Thermostat {...defaultProps} powerState={true} />);

    // Find the fire icon by its SVG data icon attribute - the class is on the SVG itself
    const fireIcon = document.querySelector('[data-icon="fire"]');
    expect(fireIcon).toHaveClass("animate-flicker");
  });

  it("should not apply flicker animation when power is off", () => {
    render(<Thermostat {...defaultProps} powerState={false} />);

    const fireIcon = document.querySelector('[data-icon="fire"]');
    expect(fireIcon).not.toHaveClass("animate-flicker");
  });
});
