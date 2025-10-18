import { describe, expect, it, vi } from "vitest";

import Index from "../../pages/index";
import { render, screen } from "../../test/utils";

// Mock the Home component since it's already tested
vi.mock("../../components/Home", () => ({
  default: () => <div data-testid="home-component">Home</div>,
}));

describe("Index Page", () => {
  it("should render the Home component", () => {
    render(<Index />);
    expect(screen.getByTestId("home-component")).toBeInTheDocument();
  });
});
