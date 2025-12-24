import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "../test/utils";
import PowerLevelSlider from "./PowerLevelSlider";

describe("PowerLevelSlider", () => {
  it("renders with correct initial level", () => {
    render(
      <PowerLevelSlider level={3} onLevelChange={vi.fn()} loading={false} />,
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveValue("3");
  });

  it("calls onLevelChange when slider moves", () => {
    const mockChange = vi.fn();
    render(
      <PowerLevelSlider level={3} onLevelChange={mockChange} loading={false} />,
    );
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "4" } });
    expect(mockChange).toHaveBeenCalledWith(4);
  });

  it("disables slider when loading", () => {
    render(
      <PowerLevelSlider level={3} onLevelChange={vi.fn()} loading={true} />,
    );
    expect(screen.getByRole("slider")).toBeDisabled();
  });

  it("disables slider when disabled prop is true", () => {
    render(
      <PowerLevelSlider
        level={3}
        onLevelChange={vi.fn()}
        loading={false}
        disabled={true}
      />,
    );
    expect(screen.getByRole("slider")).toBeDisabled();
  });

  it("has min value of 1 and max value of 5", () => {
    render(
      <PowerLevelSlider level={3} onLevelChange={vi.fn()} loading={false} />,
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("min", "1");
    expect(slider).toHaveAttribute("max", "5");
  });

  it("displays the label text", () => {
    render(
      <PowerLevelSlider level={3} onLevelChange={vi.fn()} loading={false} />,
    );
    expect(screen.getByText("Heating Intensity")).toBeInTheDocument();
  });

  it("displays current level text", () => {
    render(
      <PowerLevelSlider level={3} onLevelChange={vi.fn()} loading={false} />,
    );
    expect(screen.getByText("Level: 3")).toBeInTheDocument();
  });

  it("disables slider when readOnly is true", () => {
    render(
      <PowerLevelSlider
        level={3}
        onLevelChange={vi.fn()}
        loading={false}
        readOnly={true}
      />,
    );
    expect(screen.getByRole("slider")).toBeDisabled();
  });

  it("shows Auto badge when readOnly is true", () => {
    render(
      <PowerLevelSlider
        level={3}
        onLevelChange={vi.fn()}
        loading={false}
        readOnly={true}
      />,
    );
    expect(screen.getByText("Auto")).toBeInTheDocument();
  });

  it("does not show Auto badge when readOnly is false", () => {
    render(
      <PowerLevelSlider level={3} onLevelChange={vi.fn()} loading={false} />,
    );
    expect(screen.queryByText("Auto")).not.toBeInTheDocument();
  });
});
