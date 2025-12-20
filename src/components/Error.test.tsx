import { describe, expect, it, vi } from "vitest";

import { render, screen } from "../test/utils";
import Error from "./Error";

describe("Error Component", () => {
  it("renders with title and body", () => {
    render(
      <Error title="Test Error" body="Test error message" onClose={vi.fn()} />,
    );

    expect(screen.getByText("Test Error")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("uses default title when title is not provided", () => {
    render(<Error title="" body="Test error message" onClose={vi.fn()} />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("calls onClose when dismiss button is clicked", async () => {
    const onClose = vi.fn();
    const { user } = render(
      <Error title="Test Error" body="Test error message" onClose={onClose} />,
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders as alert with close button", () => {
    render(
      <Error title="Test Error" body="Test error message" onClose={vi.fn()} />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("renders with destructive variant styling", () => {
    const { container } = render(
      <Error title="Test Error" body="Test error message" onClose={vi.fn()} />,
    );

    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
    expect(alert?.className).toContain("border-destructive");
  });
});
