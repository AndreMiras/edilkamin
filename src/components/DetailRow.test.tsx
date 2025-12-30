import { describe, expect, it } from "vitest";

import { render, screen } from "../test/utils";
import DetailRow from "./DetailRow";

describe("DetailRow", () => {
  it("should render label and value", () => {
    render(<DetailRow label="Temperature" value="23.5°" />);

    expect(screen.getByText("Temperature")).toBeInTheDocument();
    expect(screen.getByText("23.5°")).toBeInTheDocument();
  });

  it("should render label with muted styling", () => {
    const { container } = render(<DetailRow label="Label" value="Value" />);

    const label = container.querySelector(".text-muted-foreground");
    expect(label).toBeInTheDocument();
    expect(label?.textContent).toBe("Label");
  });

  it("should render numeric values", () => {
    render(<DetailRow label="Count" value={42} />);

    expect(screen.getByText("Count")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("should use flex layout with space-between", () => {
    const { container } = render(<DetailRow label="Label" value="Value" />);

    const row = container.firstChild;
    expect(row).toHaveClass("flex", "justify-between");
  });
});
