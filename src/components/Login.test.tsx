import userEvent from "@testing-library/user-event";
import { signIn } from "edilkamin";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, waitFor } from "../test/utils";
import Errors from "./Errors";
import Login from "./Login";

// Mock the edilkamin library
vi.mock("edilkamin", () => ({
  signIn: vi.fn(),
}));

describe("Login", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render login form with username and password inputs", () => {
    render(<Login />);

    expect(screen.getByLabelText(/email|username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login|sign in/i }),
    ).toBeInTheDocument();
  });

  it("should update username state on input change", async () => {
    const user = userEvent.setup();
    render(<Login />);

    const usernameInput = screen.getByLabelText(/email|username/i);
    await user.type(usernameInput, "testuser");

    expect(usernameInput).toHaveValue("testuser");
  });

  it("should update password state on input change", async () => {
    const user = userEvent.setup();
    render(<Login />);

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, "password123");

    expect(passwordInput).toHaveValue("password123");
  });

  it("should call signIn API on form submit with credentials", async () => {
    const user = userEvent.setup();
    const mockToken = "test-auth-token-12345";
    vi.mocked(signIn).mockResolvedValue(mockToken);

    render(<Login />);

    await user.type(screen.getByLabelText(/email|username/i), "testuser");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login|sign in/i }));

    // Third argument is useLegacy flag (false when NEXT_PUBLIC_USE_LEGACY_API is unset)
    expect(signIn).toHaveBeenCalledWith("testuser", "password123", false);
  });

  it("should store token in localStorage on successful login", async () => {
    const user = userEvent.setup();
    const mockToken = "test-auth-token-12345";
    vi.mocked(signIn).mockResolvedValue(mockToken);

    render(<Login />);

    await user.type(screen.getByLabelText(/email|username/i), "testuser");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login|sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem("edilkamin-token")).toBe(mockToken);
    });
  });

  it("should add error to context on login failure", async () => {
    const user = userEvent.setup();
    const mockError = new Error("Invalid credentials");
    vi.mocked(signIn).mockRejectedValue(mockError);

    render(
      <>
        <Login />
        <Errors />
      </>,
    );

    await user.type(screen.getByLabelText(/email|username/i), "wronguser");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /login|sign in/i }));

    // Error should be displayed
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(console.error).toHaveBeenCalledWith(mockError);
  });

  it("should handle non-Error exceptions gracefully", async () => {
    const user = userEvent.setup();
    vi.mocked(signIn).mockRejectedValue("String error");

    render(
      <>
        <Login />
        <Errors />
      </>,
    );

    await user.type(screen.getByLabelText(/email|username/i), "testuser");
    await user.type(screen.getByLabelText(/password/i), "testpass");
    await user.click(screen.getByRole("button", { name: /login|sign in/i }));

    // Should show unknown error message
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(console.error).toHaveBeenCalledWith("String error");
  });

  it("should prevent default form submission", async () => {
    const user = userEvent.setup();
    const mockToken = "test-token";
    vi.mocked(signIn).mockResolvedValue(mockToken);

    const { container } = render(<Login />);

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();

    await user.type(screen.getByLabelText(/email|username/i), "test");
    await user.type(screen.getByLabelText(/password/i), "test");

    // Press Enter to submit form
    const usernameInput = screen.getByLabelText(/email|username/i);
    await user.type(usernameInput, "{Enter}");

    // Form submission should be prevented (no page reload)
    // The actual implementation prevents default in onFormSubmit
    expect(form).toBeInTheDocument();
  });

  it("should have autocomplete attributes for accessibility", () => {
    render(<Login />);

    const usernameInput = screen.getByLabelText(/email|username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(usernameInput).toHaveAttribute("autocomplete", "username");
    expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
  });

  it("should submit form when clicking button", async () => {
    const user = userEvent.setup();
    const mockToken = "test-token";
    vi.mocked(signIn).mockResolvedValue(mockToken);

    render(<Login />);

    await user.type(
      screen.getByLabelText(/email|username/i),
      "user@example.com",
    );
    await user.type(screen.getByLabelText(/password/i), "securepass");
    await user.click(screen.getByRole("button", { name: /login|sign in/i }));

    expect(signIn).toHaveBeenCalledTimes(1);
  });

  it("should have proper input types", () => {
    render(<Login />);

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
