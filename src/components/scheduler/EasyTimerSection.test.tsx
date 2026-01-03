import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "../../test/utils";
import { EasyTimerSection } from "./EasyTimerSection";
import type { EasyTimerSettings } from "./types";

const defaultEasyTimer: EasyTimerSettings = {
  active: false,
  time: 0,
};

describe("EasyTimerSection", () => {
  it("renders title and description", () => {
    render(
      <EasyTimerSection easyTimer={defaultEasyTimer} onChange={vi.fn()} />,
    );
    expect(screen.getByText("Easy Timer")).toBeInTheDocument();
    expect(
      screen.getByText("Set a timer to automatically turn off the stove"),
    ).toBeInTheDocument();
  });

  it("renders a toggle switch", () => {
    render(
      <EasyTimerSection easyTimer={defaultEasyTimer} onChange={vi.fn()} />,
    );
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("calls onChange when toggle is clicked", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(
      <EasyTimerSection easyTimer={defaultEasyTimer} onChange={mockOnChange} />,
    );
    const toggle = screen.getByRole("switch");
    await user.click(toggle);
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultEasyTimer,
      active: true,
    });
  });

  it("shows timer controls when active", () => {
    const activeTimer: EasyTimerSettings = { active: true, time: 60 };
    render(<EasyTimerSection easyTimer={activeTimer} onChange={vi.fn()} />);
    expect(screen.getByText("until automatic shutoff")).toBeInTheDocument();
  });

  it("shows preset buttons when active", () => {
    const activeTimer: EasyTimerSettings = { active: true, time: 60 };
    render(<EasyTimerSection easyTimer={activeTimer} onChange={vi.fn()} />);
    expect(screen.getByText("30 min")).toBeInTheDocument();
    // Use getAllByText since "1 hour" appears both in display and as preset
    expect(screen.getAllByText("1 hour").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2 hours")).toBeInTheDocument();
  });

  it("shows cancel button when active", () => {
    const activeTimer: EasyTimerSettings = { active: true, time: 60 };
    render(<EasyTimerSection easyTimer={activeTimer} onChange={vi.fn()} />);
    expect(screen.getByText("Cancel Timer")).toBeInTheDocument();
  });

  it("calls onChange with new time when preset is clicked", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    const activeTimer: EasyTimerSettings = { active: true, time: 60 };
    render(
      <EasyTimerSection easyTimer={activeTimer} onChange={mockOnChange} />,
    );
    const preset120 = screen.getByText("2 hours");
    await user.click(preset120);
    expect(mockOnChange).toHaveBeenCalledWith({ active: true, time: 120 });
  });

  it("calls onChange with active:false when cancel is clicked", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    const activeTimer: EasyTimerSettings = { active: true, time: 60 };
    render(
      <EasyTimerSection easyTimer={activeTimer} onChange={mockOnChange} />,
    );
    const cancelButton = screen.getByText("Cancel Timer");
    await user.click(cancelButton);
    expect(mockOnChange).toHaveBeenCalledWith({ active: false, time: 0 });
  });

  it("disables controls when disabled prop is true", () => {
    const activeTimer: EasyTimerSettings = { active: true, time: 60 };
    render(
      <EasyTimerSection
        easyTimer={activeTimer}
        onChange={vi.fn()}
        disabled={true}
      />,
    );
    expect(screen.getByRole("switch")).toBeDisabled();
    const presets = screen
      .getAllByRole("button")
      .filter(
        (btn) =>
          btn.textContent?.includes("min") || btn.textContent?.includes("hour"),
      );
    presets.forEach((preset) => {
      expect(preset).toBeDisabled();
    });
  });

  it("shows slider for custom duration when active", () => {
    const activeTimer: EasyTimerSettings = { active: true, time: 60 };
    render(<EasyTimerSection easyTimer={activeTimer} onChange={vi.fn()} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("displays current time in minutes when under 60", () => {
    const activeTimer: EasyTimerSettings = { active: true, time: 45 };
    render(<EasyTimerSection easyTimer={activeTimer} onChange={vi.fn()} />);
    expect(screen.getByText("45 min")).toBeInTheDocument();
  });

  it("displays current time in hours when over 60", () => {
    const activeTimer: EasyTimerSettings = { active: true, time: 120 };
    render(<EasyTimerSection easyTimer={activeTimer} onChange={vi.fn()} />);
    // Should show "2 hours" in both display and preset
    const twoHoursElements = screen.getAllByText("2 hours");
    expect(twoHoursElements.length).toBeGreaterThanOrEqual(1);
  });
});
