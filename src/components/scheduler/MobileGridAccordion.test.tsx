import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "../../test/utils";
import { MobileGridAccordion } from "./MobileGridAccordion";
import type { ScheduleValue } from "./types";

// Create an empty schedule array (336 zeros)
const emptySchedule = new Array(336).fill(0) as ScheduleValue[];

// Create a schedule with some data for preview testing
const mixedSchedule = new Array(336).fill(0).map((_, i) => {
  if (i < 48) return (i % 3) as ScheduleValue; // Monday has mixed values
  return 0 as ScheduleValue;
});

describe("MobileGridAccordion", () => {
  describe("Week Overview", () => {
    it("renders all 7 day labels", () => {
      render(
        <MobileGridAccordion schedule={emptySchedule} onChange={vi.fn()} />,
      );
      expect(screen.getByText("Mon")).toBeInTheDocument();
      expect(screen.getByText("Tue")).toBeInTheDocument();
      expect(screen.getByText("Wed")).toBeInTheDocument();
      expect(screen.getByText("Thu")).toBeInTheDocument();
      expect(screen.getByText("Fri")).toBeInTheDocument();
      expect(screen.getByText("Sat")).toBeInTheDocument();
      expect(screen.getByText("Sun")).toBeInTheDocument();
    });

    it("renders tap-to-edit instructions", () => {
      render(
        <MobileGridAccordion schedule={emptySchedule} onChange={vi.fn()} />,
      );
      expect(
        screen.getByText("Tap a day to edit its schedule"),
      ).toBeInTheDocument();
    });

    it("renders legend with schedule values", () => {
      render(
        <MobileGridAccordion schedule={emptySchedule} onChange={vi.fn()} />,
      );
      expect(screen.getByText("Off")).toBeInTheDocument();
      expect(screen.getByText("Eco")).toBeInTheDocument();
      expect(screen.getByText("Comfort")).toBeInTheDocument();
    });

    it("renders 7 clickable day rows", () => {
      render(
        <MobileGridAccordion schedule={emptySchedule} onChange={vi.fn()} />,
      );
      const dayButtons = screen
        .getAllByRole("button")
        .filter(
          (btn) =>
            btn.textContent?.includes("Mon") ||
            btn.textContent?.includes("Tue") ||
            btn.textContent?.includes("Wed") ||
            btn.textContent?.includes("Thu") ||
            btn.textContent?.includes("Fri") ||
            btn.textContent?.includes("Sat") ||
            btn.textContent?.includes("Sun"),
        );
      expect(dayButtons.length).toBe(7);
    });
  });

  describe("Day Expansion", () => {
    it("expands to edit mode when a day is clicked", async () => {
      const user = userEvent.setup();
      render(
        <MobileGridAccordion schedule={emptySchedule} onChange={vi.fn()} />,
      );

      // Click on Monday row
      const mondayButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("Mon"));
      expect(mondayButton).toBeDefined();
      await user.click(mondayButton!);

      // Should show full day name and back button
      expect(screen.getByText("Monday")).toBeInTheDocument();
      expect(screen.getByText("Back to week")).toBeInTheDocument();
    });

    it("shows paint mode selector in expanded view", async () => {
      const user = userEvent.setup();
      render(
        <MobileGridAccordion schedule={emptySchedule} onChange={vi.fn()} />,
      );

      // Click on Monday row
      const mondayButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("Mon"));
      await user.click(mondayButton!);

      // Should show paint mode selector
      expect(screen.getByText("Paint mode:")).toBeInTheDocument();
    });

    it("returns to week overview when back button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <MobileGridAccordion schedule={emptySchedule} onChange={vi.fn()} />,
      );

      // Expand Monday
      const mondayButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("Mon"));
      await user.click(mondayButton!);

      // Click back button
      const backButton = screen.getByText("Back to week");
      await user.click(backButton);

      // Should be back to week view
      expect(
        screen.getByText("Tap a day to edit its schedule"),
      ).toBeInTheDocument();
      expect(screen.queryByText("Monday")).not.toBeInTheDocument();
    });

    it("shows 48 schedule slots in expanded view (one day)", async () => {
      const user = userEvent.setup();
      render(
        <MobileGridAccordion schedule={emptySchedule} onChange={vi.fn()} />,
      );

      // Click on Monday row
      const mondayButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("Mon"));
      await user.click(mondayButton!);

      // Count buttons that have time-based aria-labels for Monday
      const slots = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("aria-label")?.includes("Monday"));
      expect(slots.length).toBe(48);
    });
  });

  describe("Schedule Editing", () => {
    it("calls onChange when a slot is clicked in expanded view", async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      render(
        <MobileGridAccordion
          schedule={emptySchedule}
          onChange={mockOnChange}
        />,
      );

      // Expand Monday
      const mondayButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("Mon"));
      await user.click(mondayButton!);

      // Click a slot
      const slots = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("aria-label")?.includes("Monday"));
      await user.pointer({ keys: "[MouseLeft]", target: slots[0] });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("updates schedule with selected paint value", async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      render(
        <MobileGridAccordion
          schedule={emptySchedule}
          onChange={mockOnChange}
        />,
      );

      // Expand Monday
      const mondayButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("Mon"));
      await user.click(mondayButton!);

      // Click a slot (default paint value is Comfort = 2)
      const slots = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("aria-label")?.includes("Monday"));
      await user.pointer({ keys: "[MouseLeft]", target: slots[0] });

      // Check that the first slot was set to Comfort (2)
      const newSchedule = mockOnChange.mock.calls[0][0];
      expect(newSchedule[0]).toBe(2);
    });

    it("can change paint value before painting", async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      render(
        <MobileGridAccordion
          schedule={emptySchedule}
          onChange={mockOnChange}
        />,
      );

      // Expand Monday
      const mondayButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("Mon"));
      await user.click(mondayButton!);

      // Click Eco in paint selector
      const ecoButtons = screen.getAllByText("Eco");
      await user.click(ecoButtons[0]); // Click the one in paint selector

      // Click a slot
      const slots = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("aria-label")?.includes("Monday"));
      await user.pointer({ keys: "[MouseLeft]", target: slots[0] });

      // Check that the first slot was set to Eco (1)
      const newSchedule = mockOnChange.mock.calls[0][0];
      expect(newSchedule[0]).toBe(1);
    });
  });

  describe("Disabled State", () => {
    it("disables all slots when disabled prop is true", async () => {
      const user = userEvent.setup();
      render(
        <MobileGridAccordion
          schedule={emptySchedule}
          onChange={vi.fn()}
          disabled={true}
        />,
      );

      // Expand Monday
      const mondayButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("Mon"));
      await user.click(mondayButton!);

      // All slots should be disabled
      const slots = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("aria-label")?.includes("Monday"));
      slots.forEach((slot) => {
        expect(slot).toBeDisabled();
      });
    });

    it("does not call onChange when clicking disabled slots", async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      render(
        <MobileGridAccordion
          schedule={emptySchedule}
          onChange={mockOnChange}
          disabled={true}
        />,
      );

      // Expand Monday
      const mondayButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("Mon"));
      await user.click(mondayButton!);

      // Try to click a slot
      const slots = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("aria-label")?.includes("Monday"));
      await user.pointer({ keys: "[MouseLeft]", target: slots[0] });

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe("Different Days", () => {
    it("shows correct day name when expanding different days", async () => {
      const user = userEvent.setup();
      render(
        <MobileGridAccordion schedule={emptySchedule} onChange={vi.fn()} />,
      );

      // Expand Wednesday
      const wednesdayButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("Wed"));
      await user.click(wednesdayButton!);

      expect(screen.getByText("Wednesday")).toBeInTheDocument();

      // Go back and expand Sunday
      await user.click(screen.getByText("Back to week"));
      const sundayButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("Sun"));
      await user.click(sundayButton!);

      expect(screen.getByText("Sunday")).toBeInTheDocument();
    });

    it("edits correct day slots when expanding different days", async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      render(
        <MobileGridAccordion
          schedule={emptySchedule}
          onChange={mockOnChange}
        />,
      );

      // Expand Tuesday (day index 1)
      const tuesdayButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("Tue"));
      await user.click(tuesdayButton!);

      // Click a slot
      const slots = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("aria-label")?.includes("Tuesday"));
      await user.pointer({ keys: "[MouseLeft]", target: slots[0] });

      // Check that slot 48 (first slot of Tuesday) was modified
      const newSchedule = mockOnChange.mock.calls[0][0];
      expect(newSchedule[48]).toBe(2); // Tuesday starts at index 48
    });
  });
});
