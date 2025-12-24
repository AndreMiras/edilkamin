import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "../test/utils";
import AutoModeToggle from "./AutoModeToggle";

describe("AutoModeToggle", () => {
  it("renders with label and description", () => {
    render(
      <AutoModeToggle isAuto={false} onToggle={vi.fn()} loading={false} />,
    );
    expect(screen.getByText("Auto Mode")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Automatically adjust power to maintain target temperature",
      ),
    ).toBeInTheDocument();
  });

  it("calls onToggle with true when switch is clicked while off", async () => {
    const user = userEvent.setup();
    const mockToggle = vi.fn();
    render(
      <AutoModeToggle isAuto={false} onToggle={mockToggle} loading={false} />,
    );
    const switchButton = screen.getByRole("switch");
    await user.click(switchButton);
    expect(mockToggle).toHaveBeenCalledWith(true);
  });

  it("calls onToggle with false when switch is clicked while on", async () => {
    const user = userEvent.setup();
    const mockToggle = vi.fn();
    render(
      <AutoModeToggle isAuto={true} onToggle={mockToggle} loading={false} />,
    );
    const switchButton = screen.getByRole("switch");
    await user.click(switchButton);
    expect(mockToggle).toHaveBeenCalledWith(false);
  });

  it("has aria-checked true when isAuto is true", () => {
    render(<AutoModeToggle isAuto={true} onToggle={vi.fn()} loading={false} />);
    const switchButton = screen.getByRole("switch");
    expect(switchButton).toHaveAttribute("aria-checked", "true");
  });

  it("has aria-checked false when isAuto is false", () => {
    render(
      <AutoModeToggle isAuto={false} onToggle={vi.fn()} loading={false} />,
    );
    const switchButton = screen.getByRole("switch");
    expect(switchButton).toHaveAttribute("aria-checked", "false");
  });

  it("disables switch when loading", () => {
    render(<AutoModeToggle isAuto={false} onToggle={vi.fn()} loading={true} />);
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("disables switch when disabled prop is true", () => {
    render(
      <AutoModeToggle
        isAuto={false}
        onToggle={vi.fn()}
        loading={false}
        disabled={true}
      />,
    );
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("is enabled when loading is false and disabled is false", () => {
    render(
      <AutoModeToggle isAuto={false} onToggle={vi.fn()} loading={false} />,
    );
    expect(screen.getByRole("switch")).not.toBeDisabled();
  });
});
