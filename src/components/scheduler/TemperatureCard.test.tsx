import { describe, expect, it, vi } from "vitest";

import { render, screen } from "../../test/utils";
import { TemperatureCard } from "./TemperatureCard";

describe("TemperatureCard", () => {
  const defaultProps = {
    value: 20,
    onChange: vi.fn(),
    label: "Economy",
    icon: "moon" as const,
    color: "economy" as const,
  };

  it("renders the label", () => {
    render(<TemperatureCard {...defaultProps} />);
    expect(screen.getByText("Economy")).toBeInTheDocument();
  });

  it("displays the temperature value with default unit", () => {
    render(<TemperatureCard {...defaultProps} value={17.5} />);
    expect(screen.getByText("17.5°C")).toBeInTheDocument();
  });

  it("displays the temperature value with Fahrenheit unit", () => {
    render(<TemperatureCard {...defaultProps} value={65} unit="F" />);
    expect(screen.getByText("65.0°F")).toBeInTheDocument();
  });

  it("calls onChange with decreased value when decrease button is clicked", async () => {
    const onChange = vi.fn();
    const { user } = render(
      <TemperatureCard {...defaultProps} value={20} onChange={onChange} />,
    );

    const decreaseButton = screen.getByRole("button", { name: /decrease/i });
    await user.click(decreaseButton);

    expect(onChange).toHaveBeenCalledWith(19.5);
  });

  it("calls onChange with increased value when increase button is clicked", async () => {
    const onChange = vi.fn();
    const { user } = render(
      <TemperatureCard {...defaultProps} value={20} onChange={onChange} />,
    );

    const increaseButton = screen.getByRole("button", { name: /increase/i });
    await user.click(increaseButton);

    expect(onChange).toHaveBeenCalledWith(20.5);
  });

  it("respects custom step value", async () => {
    const onChange = vi.fn();
    const { user } = render(
      <TemperatureCard
        {...defaultProps}
        value={20}
        step={1}
        onChange={onChange}
      />,
    );

    const increaseButton = screen.getByRole("button", { name: /increase/i });
    await user.click(increaseButton);

    expect(onChange).toHaveBeenCalledWith(21);
  });

  it("disables decrease button at minimum value", () => {
    render(<TemperatureCard {...defaultProps} value={10} min={10} />);
    const decreaseButton = screen.getByRole("button", { name: /decrease/i });
    expect(decreaseButton).toBeDisabled();
  });

  it("disables increase button at maximum value", () => {
    render(<TemperatureCard {...defaultProps} value={30} max={30} />);
    const increaseButton = screen.getByRole("button", { name: /increase/i });
    expect(increaseButton).toBeDisabled();
  });

  it("disables both buttons when disabled prop is true", () => {
    render(<TemperatureCard {...defaultProps} disabled={true} />);
    const decreaseButton = screen.getByRole("button", { name: /decrease/i });
    const increaseButton = screen.getByRole("button", { name: /increase/i });
    expect(decreaseButton).toBeDisabled();
    expect(increaseButton).toBeDisabled();
  });

  it("does not go below minimum value", async () => {
    const onChange = vi.fn();
    const { user } = render(
      <TemperatureCard
        {...defaultProps}
        value={10.5}
        min={10}
        step={1}
        onChange={onChange}
      />,
    );

    const decreaseButton = screen.getByRole("button", { name: /decrease/i });
    await user.click(decreaseButton);

    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("does not go above maximum value", async () => {
    const onChange = vi.fn();
    const { user } = render(
      <TemperatureCard
        {...defaultProps}
        value={29.5}
        max={30}
        step={1}
        onChange={onChange}
      />,
    );

    const increaseButton = screen.getByRole("button", { name: /increase/i });
    await user.click(increaseButton);

    expect(onChange).toHaveBeenCalledWith(30);
  });

  it("renders with comfort color scheme", () => {
    render(
      <TemperatureCard
        {...defaultProps}
        label="Comfort"
        icon="sun"
        color="comfort"
      />,
    );
    expect(screen.getByText("Comfort")).toBeInTheDocument();
  });
});
