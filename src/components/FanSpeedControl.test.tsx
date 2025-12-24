import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "../test/utils";
import FanSpeedControl from "./FanSpeedControl";

describe("FanSpeedControl", () => {
  it("renders with correct label for fan 1", () => {
    render(
      <FanSpeedControl
        fanNumber={1}
        speed={3}
        onSpeedChange={vi.fn()}
        loading={false}
      />,
    );
    expect(screen.getByText("Fan 1 Speed")).toBeInTheDocument();
  });

  it("renders with correct label for fan 2", () => {
    render(
      <FanSpeedControl
        fanNumber={2}
        speed={3}
        onSpeedChange={vi.fn()}
        loading={false}
      />,
    );
    expect(screen.getByText("Fan 2 Speed")).toBeInTheDocument();
  });

  it("renders with correct initial speed", () => {
    render(
      <FanSpeedControl
        fanNumber={1}
        speed={3}
        onSpeedChange={vi.fn()}
        loading={false}
      />,
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveValue("3");
  });

  it("calls onSpeedChange when slider moves", () => {
    const mockChange = vi.fn();
    render(
      <FanSpeedControl
        fanNumber={1}
        speed={3}
        onSpeedChange={mockChange}
        loading={false}
      />,
    );
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "4" } });
    expect(mockChange).toHaveBeenCalledWith(4);
  });

  it("disables slider when loading", () => {
    render(
      <FanSpeedControl
        fanNumber={1}
        speed={3}
        onSpeedChange={vi.fn()}
        loading={true}
      />,
    );
    expect(screen.getByRole("slider")).toBeDisabled();
  });

  it("disables slider when disabled prop is true", () => {
    render(
      <FanSpeedControl
        fanNumber={1}
        speed={3}
        onSpeedChange={vi.fn()}
        loading={false}
        disabled={true}
      />,
    );
    expect(screen.getByRole("slider")).toBeDisabled();
  });

  it("has min value of 0 and default max value of 5", () => {
    render(
      <FanSpeedControl
        fanNumber={1}
        speed={3}
        onSpeedChange={vi.fn()}
        loading={false}
      />,
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "5");
  });

  it("uses custom maxSpeed when provided", () => {
    render(
      <FanSpeedControl
        fanNumber={1}
        speed={3}
        onSpeedChange={vi.fn()}
        loading={false}
        maxSpeed={4}
      />,
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("max", "4");
  });

  it("displays custom maxSpeed in the label", () => {
    render(
      <FanSpeedControl
        fanNumber={1}
        speed={3}
        onSpeedChange={vi.fn()}
        loading={false}
        maxSpeed={4}
      />,
    );
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("displays 'Off' when speed is 0", () => {
    render(
      <FanSpeedControl
        fanNumber={1}
        speed={0}
        onSpeedChange={vi.fn()}
        loading={false}
      />,
    );
    expect(screen.getByText("Off")).toBeInTheDocument();
  });

  it("displays current speed when speed is not 0", () => {
    render(
      <FanSpeedControl
        fanNumber={1}
        speed={4}
        onSpeedChange={vi.fn()}
        loading={false}
      />,
    );
    expect(screen.getByText("Speed: 4")).toBeInTheDocument();
  });
});
