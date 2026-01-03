import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "../../test/utils";
import type { ScheduleValue } from "./types";
import { WeeklyScheduleGrid } from "./WeeklyScheduleGrid";

// Create an empty schedule array (336 zeros)
const emptySchedule = new Array(336).fill(0) as ScheduleValue[];

describe("WeeklyScheduleGrid", () => {
  it("renders day labels", () => {
    render(<WeeklyScheduleGrid schedule={emptySchedule} onChange={vi.fn()} />);
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
  });

  it("renders paint mode selector with three options", () => {
    render(<WeeklyScheduleGrid schedule={emptySchedule} onChange={vi.fn()} />);
    // Each option appears twice (paint mode and legend), so use getAllByText
    const offElements = screen.getAllByText("Off");
    expect(offElements.length).toBeGreaterThanOrEqual(1);
    const ecoElements = screen.getAllByText("Eco");
    expect(ecoElements.length).toBeGreaterThanOrEqual(1);
    const comfortElements = screen.getAllByText("Comfort");
    expect(comfortElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders legend at the bottom", () => {
    render(<WeeklyScheduleGrid schedule={emptySchedule} onChange={vi.fn()} />);
    // Legend has the same text as paint mode, but appears twice
    const offElements = screen.getAllByText("Off");
    expect(offElements.length).toBeGreaterThanOrEqual(2);
  });

  it("calls onChange when a slot is clicked", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(
      <WeeklyScheduleGrid schedule={emptySchedule} onChange={mockOnChange} />,
    );
    // Click a slot using mouse down event (component uses onMouseDown, not onClick)
    const slots = screen
      .getAllByRole("button")
      .filter((btn) => btn.getAttribute("aria-label")?.includes("Monday"));
    // Use pointer events for mouseDown
    await user.pointer({ keys: "[MouseLeft]", target: slots[0] });
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("has 336 schedule slots (7 days x 48 half-hours)", () => {
    render(<WeeklyScheduleGrid schedule={emptySchedule} onChange={vi.fn()} />);
    // Count buttons that have time-based aria-labels
    const slots = screen
      .getAllByRole("button")
      .filter((btn) =>
        btn
          .getAttribute("aria-label")
          ?.match(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/),
      );
    expect(slots.length).toBe(336);
  });

  it("disables all slots when disabled prop is true", () => {
    render(
      <WeeklyScheduleGrid
        schedule={emptySchedule}
        onChange={vi.fn()}
        disabled={true}
      />,
    );
    const slots = screen
      .getAllByRole("button")
      .filter((btn) => btn.getAttribute("aria-label")?.includes("Monday"));
    slots.forEach((slot) => {
      expect(slot).toBeDisabled();
    });
  });

  it("shows paint mode label", () => {
    render(<WeeklyScheduleGrid schedule={emptySchedule} onChange={vi.fn()} />);
    expect(screen.getByText("Paint mode:")).toBeInTheDocument();
  });
});
