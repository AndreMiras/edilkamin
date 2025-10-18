import { describe, expect, it, vi } from "vitest";

import { render, screen } from "../test/utils";
import Error from "./Error";

describe("Error Component", () => {
  it("renders with title and body", () => {
    render(
      <Error title="Test Error" body="Test error message" onClose={vi.fn()} />
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
      <Error title="Test Error" body="Test error message" onClose={onClose} />
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders as dismissible alert", () => {
    const { container } = render(
      <Error title="Test Error" body="Test error message" onClose={vi.fn()} />
    );

    const alert = container.querySelector(".alert-dismissible");
    expect(alert).toBeInTheDocument();
  });

  it("renders with danger variant", () => {
    const { container } = render(
      <Error title="Test Error" body="Test error message" onClose={vi.fn()} />
    );

    const alert = container.querySelector(".alert-danger");
    expect(alert).toBeInTheDocument();
  });
});
