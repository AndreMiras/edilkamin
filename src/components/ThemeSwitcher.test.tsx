import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { render, screen, waitFor } from "../test/utils";
import ThemeSwitcher from "./ThemeSwitcher";

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should render sun icon in dark mode", async () => {
    // Set dark mode in localStorage
    localStorage.setItem("theme", "dark");

    render(<ThemeSwitcher />);

    // Wait for theme context to initialize from localStorage
    await waitFor(() => {
      const button = screen.getByRole("button", {
        name: "Switch to light mode",
      });
      expect(button).toBeInTheDocument();
    });
  });

  it("should render moon icon in light mode", () => {
    // Set light mode in localStorage (or default)
    localStorage.setItem("theme", "light");

    render(<ThemeSwitcher />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
  });

  it("should toggle from light to dark on click", async () => {
    const user = userEvent.setup();
    localStorage.setItem("theme", "light");

    render(<ThemeSwitcher />);

    const button = screen.getByRole("button", {
      name: "Switch to dark mode",
    });
    await user.click(button);

    // After clicking, theme should be dark in localStorage
    await waitFor(() => {
      expect(localStorage.getItem("theme")).toBe("dark");
    });
  });

  it("should toggle from dark to light on click", async () => {
    const user = userEvent.setup();
    localStorage.setItem("theme", "dark");

    render(<ThemeSwitcher />);

    // Wait for theme to be loaded from localStorage
    await waitFor(() => {
      const button = screen.getByRole("button", {
        name: "Switch to light mode",
      });
      expect(button).toBeInTheDocument();
    });

    const button = screen.getByRole("button", {
      name: "Switch to light mode",
    });
    await user.click(button);

    // After clicking, theme should be light
    await waitFor(() => {
      expect(localStorage.getItem("theme")).toBe("light");
    });
  });

  it("should update aria-label after toggle", async () => {
    const user = userEvent.setup();
    localStorage.setItem("theme", "light");

    render(<ThemeSwitcher />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Switch to dark mode");

    await user.click(button);

    // Wait for the aria-label to update after toggle
    await waitFor(() => {
      expect(button).toHaveAttribute("aria-label", "Switch to light mode");
    });
  });

  it("should default to light mode when no theme in localStorage", () => {
    // Don't set anything in localStorage

    render(<ThemeSwitcher />);

    const button = screen.getByRole("button");
    // Should default to light mode, so shows moon icon and "Switch to dark mode"
    expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
  });
});
