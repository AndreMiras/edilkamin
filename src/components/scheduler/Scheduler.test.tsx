import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "../../test/utils";
import { Scheduler } from "./Scheduler";
import type { ChronoSettings, EasyTimerSettings, ScheduleValue } from "./types";

// Create an empty schedule array (336 zeros)
const emptySchedule = new Array(336).fill(0) as ScheduleValue[];

const defaultChronoSettings: ChronoSettings = {
  enabled: false,
  comfortTemperature: 22,
  economyTemperature: 18,
  schedule: emptySchedule,
};

const defaultEasyTimer: EasyTimerSettings = {
  active: false,
  time: 0,
};

describe("Scheduler", () => {
  it("renders the scheduler title", () => {
    render(
      <Scheduler
        chronoSettings={defaultChronoSettings}
        easyTimer={defaultEasyTimer}
        onChronoSettingsChange={vi.fn()}
        onEasyTimerChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Schedule & Timer")).toBeInTheDocument();
  });

  it("renders two tabs for Weekly Schedule and Easy Timer", () => {
    render(
      <Scheduler
        chronoSettings={defaultChronoSettings}
        easyTimer={defaultEasyTimer}
        onChronoSettingsChange={vi.fn()}
        onEasyTimerChange={vi.fn()}
      />,
    );
    // Use getAllByText since "Weekly Schedule" appears in both tab and content
    const weeklyScheduleElements = screen.getAllByText("Weekly Schedule");
    expect(weeklyScheduleElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Easy Timer")).toBeInTheDocument();
  });

  it("shows chrono mode toggle when on chrono tab", () => {
    render(
      <Scheduler
        chronoSettings={defaultChronoSettings}
        easyTimer={defaultEasyTimer}
        onChronoSettingsChange={vi.fn()}
        onEasyTimerChange={vi.fn()}
      />,
    );
    // Should show the chrono section title
    const chronoHeading = screen.getAllByRole("heading", { level: 3 });
    expect(chronoHeading.some((h) => h.textContent === "Weekly Schedule")).toBe(
      true,
    );
  });

  it("calls onChronoSettingsChange when toggle is clicked", async () => {
    const user = userEvent.setup();
    const mockChronoChange = vi.fn();
    render(
      <Scheduler
        chronoSettings={defaultChronoSettings}
        easyTimer={defaultEasyTimer}
        onChronoSettingsChange={mockChronoChange}
        onEasyTimerChange={vi.fn()}
      />,
    );
    // Find the chrono toggle switch
    const toggles = screen.getAllByRole("switch");
    await user.click(toggles[0]);
    expect(mockChronoChange).toHaveBeenCalledWith({
      ...defaultChronoSettings,
      enabled: true,
    });
  });

  it("shows loading spinner when isLoading is true", () => {
    render(
      <Scheduler
        chronoSettings={defaultChronoSettings}
        easyTimer={defaultEasyTimer}
        onChronoSettingsChange={vi.fn()}
        onEasyTimerChange={vi.fn()}
        isLoading={true}
      />,
    );
    // Loading spinner should be visible (animate-spin class)
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("switches to Easy Timer tab when clicked", async () => {
    const user = userEvent.setup();
    render(
      <Scheduler
        chronoSettings={defaultChronoSettings}
        easyTimer={defaultEasyTimer}
        onChronoSettingsChange={vi.fn()}
        onEasyTimerChange={vi.fn()}
      />,
    );
    const timerTab = screen.getByText("Easy Timer");
    await user.click(timerTab);
    // After clicking, Easy Timer section should be shown
    expect(
      screen.getByText("Set a timer to automatically turn off the stove"),
    ).toBeInTheDocument();
  });

  it("shows temperature steppers when chrono is enabled", () => {
    render(
      <Scheduler
        chronoSettings={{ ...defaultChronoSettings, enabled: true }}
        easyTimer={defaultEasyTimer}
        onChronoSettingsChange={vi.fn()}
        onEasyTimerChange={vi.fn()}
      />,
    );
    // "Comfort" appears in multiple places (stepper, paint mode, legend)
    // Just check that they exist
    const comfortElements = screen.getAllByText("Comfort");
    expect(comfortElements.length).toBeGreaterThanOrEqual(1);
    const economyElements = screen.getAllByText(/Economy|Eco/);
    expect(economyElements.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onChronoSettingsChange when comfort temperature is increased", async () => {
    const user = userEvent.setup();
    const mockChronoChange = vi.fn();
    render(
      <Scheduler
        chronoSettings={{ ...defaultChronoSettings, enabled: true }}
        easyTimer={defaultEasyTimer}
        onChronoSettingsChange={mockChronoChange}
        onEasyTimerChange={vi.fn()}
      />,
    );
    // Find the increase button for Comfort (first plus button)
    const increaseButtons = screen.getAllByLabelText(/Increase/);
    await user.click(increaseButtons[0]);
    expect(mockChronoChange).toHaveBeenCalled();
  });

  it("disables controls when disabled prop is true", () => {
    render(
      <Scheduler
        chronoSettings={defaultChronoSettings}
        easyTimer={defaultEasyTimer}
        onChronoSettingsChange={vi.fn()}
        onEasyTimerChange={vi.fn()}
        disabled={true}
      />,
    );
    const toggles = screen.getAllByRole("switch");
    toggles.forEach((toggle) => {
      expect(toggle).toBeDisabled();
    });
  });
});
