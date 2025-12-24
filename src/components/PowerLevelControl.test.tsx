import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PowerLevelControl from "./PowerLevelControl";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        "powerLevel.label": "Heating Intensity",
        "powerLevel.increase": "Increase intensity",
        "powerLevel.decrease": "Decrease intensity",
        currentTemp: "Current",
      };
      let result = translations[key] || key;
      if (options) {
        Object.entries(options).forEach(([k, v]) => {
          result = result.replace(`{{${k}}}`, String(v));
        });
      }
      return result;
    },
  }),
}));

describe("PowerLevelControl", () => {
  const defaultProps = {
    level: 3,
    onLevelChange: vi.fn(),
    loading: false,
  };

  it("renders current power level", () => {
    render(<PowerLevelControl {...defaultProps} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("/5")).toBeInTheDocument();
  });

  it("renders label", () => {
    render(<PowerLevelControl {...defaultProps} />);
    expect(screen.getByText("Heating Intensity")).toBeInTheDocument();
  });

  it("calls onLevelChange with decreased level when minus clicked", () => {
    const onLevelChange = vi.fn();
    render(
      <PowerLevelControl {...defaultProps} onLevelChange={onLevelChange} />,
    );

    fireEvent.click(screen.getByLabelText("Decrease intensity"));
    expect(onLevelChange).toHaveBeenCalledWith(2);
  });

  it("calls onLevelChange with increased level when plus clicked", () => {
    const onLevelChange = vi.fn();
    render(
      <PowerLevelControl {...defaultProps} onLevelChange={onLevelChange} />,
    );

    fireEvent.click(screen.getByLabelText("Increase intensity"));
    expect(onLevelChange).toHaveBeenCalledWith(4);
  });

  it("disables decrease button at minimum level", () => {
    render(<PowerLevelControl {...defaultProps} level={1} />);
    expect(screen.getByLabelText("Decrease intensity")).toBeDisabled();
  });

  it("disables increase button at maximum level", () => {
    render(<PowerLevelControl {...defaultProps} level={5} />);
    expect(screen.getByLabelText("Increase intensity")).toBeDisabled();
  });

  it("disables both buttons when loading", () => {
    render(<PowerLevelControl {...defaultProps} loading={true} />);
    expect(screen.getByLabelText("Decrease intensity")).toBeDisabled();
    expect(screen.getByLabelText("Increase intensity")).toBeDisabled();
  });

  it("renders environment temperature when provided", () => {
    render(
      <PowerLevelControl {...defaultProps} environmentTemperature={18.5} />,
    );
    expect(screen.getByText("Current: 18.5°C")).toBeInTheDocument();
  });

  it("does not render environment temperature when not provided", () => {
    render(<PowerLevelControl {...defaultProps} />);
    expect(screen.queryByText(/Current:/)).not.toBeInTheDocument();
  });
});
