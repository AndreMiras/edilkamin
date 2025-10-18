import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "../test/utils";
import TemperatureAdjuster from "./TemperatureAdjuster";

describe("TemperatureAdjuster", () => {
  it("should render with current temperature value", () => {
    const onTemperatureChange = vi.fn();
    render(
      <TemperatureAdjuster
        currentTemperature={20}
        onTemperatureChange={onTemperatureChange}
        loading={false}
      />,
    );

    expect(screen.getByDisplayValue("20")).toBeInTheDocument();
  });

  it("should render increment and decrement buttons", () => {
    const onTemperatureChange = vi.fn();
    render(
      <TemperatureAdjuster
        currentTemperature={20}
        onTemperatureChange={onTemperatureChange}
        loading={false}
      />,
    );

    const buttons = screen.getAllByRole("button");
    // Should have 2 buttons (minus and plus)
    expect(buttons).toHaveLength(2);
  });

  it("should call onTemperatureChange with decreased value when minus button is clicked", async () => {
    const onTemperatureChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TemperatureAdjuster
        currentTemperature={20}
        onTemperatureChange={onTemperatureChange}
        loading={false}
      />,
    );

    const buttons = screen.getAllByRole("button");
    const minusButton = buttons[0]; // First button is minus

    await user.click(minusButton);

    expect(onTemperatureChange).toHaveBeenCalledWith(19.5);
    expect(onTemperatureChange).toHaveBeenCalledTimes(1);
  });

  it("should call onTemperatureChange with increased value when plus button is clicked", async () => {
    const onTemperatureChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TemperatureAdjuster
        currentTemperature={20}
        onTemperatureChange={onTemperatureChange}
        loading={false}
      />,
    );

    const buttons = screen.getAllByRole("button");
    const plusButton = buttons[1]; // Second button is plus

    await user.click(plusButton);

    expect(onTemperatureChange).toHaveBeenCalledWith(20.5);
    expect(onTemperatureChange).toHaveBeenCalledTimes(1);
  });

  it("should call onTemperatureChange when value is changed in input", () => {
    const onTemperatureChange = vi.fn();

    render(
      <TemperatureAdjuster
        currentTemperature={20}
        onTemperatureChange={onTemperatureChange}
        loading={false}
      />,
    );

    const input = screen.getByDisplayValue("20") as HTMLInputElement;

    // Simulate changing the value using fireEvent
    fireEvent.change(input, { target: { value: "25" } });

    // Should be called with new value
    expect(onTemperatureChange).toHaveBeenCalledWith(25);
  });

  it("should disable all controls when loading is true", () => {
    const onTemperatureChange = vi.fn();

    render(
      <TemperatureAdjuster
        currentTemperature={20}
        onTemperatureChange={onTemperatureChange}
        loading={true}
      />,
    );

    const buttons = screen.getAllByRole("button");
    const input = screen.getByDisplayValue("20");

    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
    expect(input).toBeDisabled();
  });

  it("should not call onTemperatureChange when buttons are disabled", async () => {
    const onTemperatureChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TemperatureAdjuster
        currentTemperature={20}
        onTemperatureChange={onTemperatureChange}
        loading={true}
      />,
    );

    const buttons = screen.getAllByRole("button");

    await user.click(buttons[0]);
    await user.click(buttons[1]);

    expect(onTemperatureChange).not.toHaveBeenCalled();
  });

  it("should handle decimal temperatures correctly", async () => {
    const onTemperatureChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TemperatureAdjuster
        currentTemperature={20.5}
        onTemperatureChange={onTemperatureChange}
        loading={false}
      />,
    );

    expect(screen.getByDisplayValue("20.5")).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    const plusButton = buttons[1];

    await user.click(plusButton);

    // 20.5 + 0.5 = 21
    expect(onTemperatureChange).toHaveBeenCalledWith(21);
  });

  it("should handle negative temperature changes", async () => {
    const onTemperatureChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TemperatureAdjuster
        currentTemperature={0.5}
        onTemperatureChange={onTemperatureChange}
        loading={false}
      />,
    );

    const buttons = screen.getAllByRole("button");
    const minusButton = buttons[0];

    await user.click(minusButton);

    // 0.5 - 0.5 = 0
    expect(onTemperatureChange).toHaveBeenCalledWith(0);
  });

  it("should render input as number type", () => {
    const onTemperatureChange = vi.fn();

    render(
      <TemperatureAdjuster
        currentTemperature={20}
        onTemperatureChange={onTemperatureChange}
        loading={false}
      />,
    );

    const input = screen.getByDisplayValue("20");
    expect(input).toHaveAttribute("type", "number");
  });
});
