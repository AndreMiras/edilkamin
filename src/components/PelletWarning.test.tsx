import { describe, expect, it } from "vitest";

import { render, screen } from "../test/utils";
import PelletWarning from "./PelletWarning";

describe("PelletWarning", () => {
  it("renders the warning title", () => {
    render(<PelletWarning autonomyTime={120} />);
    expect(screen.getByText("Pellet Reserve Low")).toBeInTheDocument();
  });

  it("renders the autonomy remaining message", () => {
    render(<PelletWarning autonomyTime={120} />);
    expect(
      screen.getByText("Approximately 2 hours remaining"),
    ).toBeInTheDocument();
  });

  it("renders the warning icon", () => {
    render(<PelletWarning autonomyTime={120} />);
    const icon = document.querySelector('[data-icon="triangle-exclamation"]');
    expect(icon).toBeInTheDocument();
  });

  it("calculates hours correctly from autonomy time in minutes", () => {
    // 120 minutes = 2 hours
    const { container } = render(<PelletWarning autonomyTime={120} />);
    expect(container).toBeInTheDocument();
    expect(screen.getByText(/2 hours/)).toBeInTheDocument();
  });

  it("handles zero autonomy time", () => {
    render(<PelletWarning autonomyTime={0} />);
    expect(screen.getByText("Pellet Reserve Low")).toBeInTheDocument();
    expect(
      screen.getByText("Approximately 0 hours remaining"),
    ).toBeInTheDocument();
  });
});
