import { describe, expect, it, vi } from "vitest";

import { render, screen } from "../../test/utils";
import { TemperatureCardsSection } from "./TemperatureCardsSection";

describe("TemperatureCardsSection", () => {
  const defaultProps = {
    comfortTemperature: 22,
    economyTemperature: 17,
    onComfortChange: vi.fn(),
    onEconomyChange: vi.fn(),
  };

  it("renders the section header", () => {
    render(<TemperatureCardsSection {...defaultProps} />);
    expect(screen.getByText("Target Temperatures")).toBeInTheDocument();
  });

  it("renders both economy and comfort cards", () => {
    render(<TemperatureCardsSection {...defaultProps} />);
    expect(screen.getByText("Economy")).toBeInTheDocument();
    expect(screen.getByText("Comfort")).toBeInTheDocument();
  });

  it("displays correct temperature values", () => {
    render(<TemperatureCardsSection {...defaultProps} />);
    expect(screen.getByText("17.0°C")).toBeInTheDocument();
    expect(screen.getByText("22.0°C")).toBeInTheDocument();
  });

  it("displays temperatures in Fahrenheit when unit is F", () => {
    render(
      <TemperatureCardsSection
        {...defaultProps}
        economyTemperature={63}
        comfortTemperature={72}
        unit="F"
      />,
    );
    expect(screen.getByText("63.0°F")).toBeInTheDocument();
    expect(screen.getByText("72.0°F")).toBeInTheDocument();
  });

  it("calls onEconomyChange when economy card buttons are clicked", async () => {
    const onEconomyChange = vi.fn();
    const { user } = render(
      <TemperatureCardsSection
        {...defaultProps}
        onEconomyChange={onEconomyChange}
      />,
    );

    const increaseButtons = screen.getAllByRole("button", {
      name: /increase/i,
    });
    // Economy card is rendered first
    await user.click(increaseButtons[0]);

    expect(onEconomyChange).toHaveBeenCalledWith(17.5);
  });

  it("calls onComfortChange when comfort card buttons are clicked", async () => {
    const onComfortChange = vi.fn();
    const { user } = render(
      <TemperatureCardsSection
        {...defaultProps}
        onComfortChange={onComfortChange}
      />,
    );

    const increaseButtons = screen.getAllByRole("button", {
      name: /increase/i,
    });
    // Comfort card is rendered second
    await user.click(increaseButtons[1]);

    expect(onComfortChange).toHaveBeenCalledWith(22.5);
  });

  it("disables all buttons when disabled prop is true", () => {
    render(<TemperatureCardsSection {...defaultProps} disabled={true} />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("renders four buttons (2 per card)", () => {
    render(<TemperatureCardsSection {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });
});
