import { describe, expect, it, vi } from "vitest";

import { render, screen } from "../test/utils";
import RequireAuth from "./RequireAuth";

// Mock the useIsLoggedIn hook
vi.mock("../utils/hooks", () => ({
  useIsLoggedIn: vi.fn(),
}));

import { useIsLoggedIn } from "../utils/hooks";

const mockedUseIsLoggedIn = vi.mocked(useIsLoggedIn);

describe("RequireAuth", () => {
  it("renders loading spinner when auth state is undefined", () => {
    mockedUseIsLoggedIn.mockReturnValue(undefined);

    render(
      <RequireAuth>
        <div>Protected Content</div>
      </RequireAuth>,
    );

    // Should show spinner, not content
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    // Check for spinner element (animate-spin class)
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("renders login required message when not authenticated", () => {
    mockedUseIsLoggedIn.mockReturnValue(false);

    render(
      <RequireAuth>
        <div>Protected Content</div>
      </RequireAuth>,
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByText("Login Required")).toBeInTheDocument();
    expect(
      screen.getByText("Please log in to access this feature."),
    ).toBeInTheDocument();
  });

  it("renders custom message when provided and not authenticated", () => {
    mockedUseIsLoggedIn.mockReturnValue(false);

    render(
      <RequireAuth message="Custom auth message">
        <div>Protected Content</div>
      </RequireAuth>,
    );

    expect(screen.getByText("Custom auth message")).toBeInTheDocument();
    expect(
      screen.queryByText("Please log in to access this feature."),
    ).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    mockedUseIsLoggedIn.mockReturnValue(true);

    render(
      <RequireAuth>
        <div>Protected Content</div>
      </RequireAuth>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(screen.queryByText("Login Required")).not.toBeInTheDocument();
  });

  it("renders alert with correct role", () => {
    mockedUseIsLoggedIn.mockReturnValue(false);

    render(
      <RequireAuth>
        <div>Protected Content</div>
      </RequireAuth>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
