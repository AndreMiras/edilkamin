import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "../../test/utils";
import { QuickPresets } from "./QuickPresets";

// Mock the edilkamin module functions used by QuickPresets
vi.mock("edilkamin", () => ({
  createEmptySchedule: vi.fn(() => new Array(336).fill(0)),
  createWorkWeekSchedule: vi.fn(() => {
    // Return a schedule with some slots set to 2 (Comfort) for morning/evening
    const schedule = new Array(336).fill(0);
    // Set some weekday morning/evening slots to 2
    for (let day = 0; day < 5; day++) {
      for (let slot = 12; slot < 18; slot++) {
        // 6am-9am
        schedule[day * 48 + slot] = 2;
      }
      for (let slot = 34; slot < 44; slot++) {
        // 5pm-10pm
        schedule[day * 48 + slot] = 2;
      }
    }
    return schedule;
  }),
}));

describe("QuickPresets", () => {
  it("renders the presets title", () => {
    render(<QuickPresets onApply={vi.fn()} />);
    expect(screen.getByText("Quick Presets:")).toBeInTheDocument();
  });

  it("renders four preset buttons", () => {
    render(<QuickPresets onApply={vi.fn()} />);
    expect(screen.getByText("Clear All")).toBeInTheDocument();
    expect(screen.getByText("Work Week")).toBeInTheDocument();
    expect(screen.getByText("Early Bird")).toBeInTheDocument();
    expect(screen.getByText("Always Comfort")).toBeInTheDocument();
  });

  it("calls onApply when Clear All is clicked", async () => {
    const user = userEvent.setup();
    const mockOnApply = vi.fn();
    render(<QuickPresets onApply={mockOnApply} />);
    // Use getByRole to find the actual button, not the inner div text
    const clearAllButton = screen.getByRole("button", { name: /Clear All/i });
    await user.click(clearAllButton);
    expect(mockOnApply).toHaveBeenCalled();
    // Should be called with an array
    const schedule = mockOnApply.mock.calls[0][0];
    expect(Array.isArray(schedule)).toBe(true);
    expect(schedule.length).toBe(336);
  });

  it("calls onApply when Work Week is clicked", async () => {
    const user = userEvent.setup();
    const mockOnApply = vi.fn();
    render(<QuickPresets onApply={mockOnApply} />);
    // Use getByRole to find the actual button, not the inner div text
    const workWeekButton = screen.getByRole("button", { name: /Work Week/i });
    await user.click(workWeekButton);
    expect(mockOnApply).toHaveBeenCalled();
    const schedule = mockOnApply.mock.calls[0][0];
    expect(Array.isArray(schedule)).toBe(true);
    expect(schedule.length).toBe(336);
  });

  it("calls onApply when Always Comfort is clicked", async () => {
    const user = userEvent.setup();
    const mockOnApply = vi.fn();
    render(<QuickPresets onApply={mockOnApply} />);
    // Use getByRole to find the actual button, not the inner div text
    const alwaysComfortButton = screen.getByRole("button", {
      name: /Always Comfort/i,
    });
    await user.click(alwaysComfortButton);
    expect(mockOnApply).toHaveBeenCalled();
    // Should be called with an array of 336 twos
    const schedule = mockOnApply.mock.calls[0][0];
    expect(schedule.length).toBe(336);
    expect(schedule.every((v: number) => v === 2)).toBe(true);
  });

  it("disables buttons when disabled prop is true", () => {
    render(<QuickPresets onApply={vi.fn()} disabled={true} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("shows descriptions for each preset", () => {
    render(<QuickPresets onApply={vi.fn()} />);
    expect(screen.getByText("Set all slots to Off")).toBeInTheDocument();
    expect(
      screen.getByText("Morning & evening on weekdays"),
    ).toBeInTheDocument();
    expect(screen.getByText("Early morning schedule")).toBeInTheDocument();
    expect(screen.getByText("Comfort temperature 24/7")).toBeInTheDocument();
  });
});
