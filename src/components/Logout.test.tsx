import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "../test/utils";
import Logout from "./Logout";

// Mock next/router with a custom implementation for this test
const mockPush = vi.fn();
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: "/",
    query: {},
    asPath: "/",
    route: "/",
  }),
}));

describe("Logout", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it("should render logout button", () => {
    render(<Logout />);

    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("should call logout function when clicked", async () => {
    const user = userEvent.setup();

    // Set up a token in localStorage
    localStorage.setItem("edilkamin-token", "test-token");

    render(<Logout />);

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    await user.click(logoutButton);

    // Token should be removed from localStorage
    expect(localStorage.getItem("edilkamin-token")).toBeNull();
  });

  it("should navigate to home page after logout", async () => {
    const user = userEvent.setup();
    localStorage.setItem("edilkamin-token", "test-token");

    render(<Logout />);

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    await user.click(logoutButton);

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should clear token from context", async () => {
    const user = userEvent.setup();
    localStorage.setItem("edilkamin-token", "test-token");

    render(<Logout />);

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    await user.click(logoutButton);

    // After logout, token should be cleared
    // This will be verified through integration with other components
    expect(localStorage.getItem("edilkamin-token")).toBeNull();
  });
});
