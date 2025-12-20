import { beforeEach, describe, expect, it } from "vitest";

import { render } from "../test/utils";
import ThemeInitializer from "./ThemeInitializer";

describe("ThemeInitializer", () => {
  beforeEach(() => {
    localStorage.clear();
    // Clean up dark class
    document.documentElement.classList.remove("dark");
  });

  it("should render without crashing", () => {
    const { container } = render(<ThemeInitializer />);
    expect(container).toBeInTheDocument();
  });

  it("should return null (no visible output)", () => {
    const { container } = render(<ThemeInitializer />);
    expect(container.firstChild).toBeNull();
  });

  it("should not add dark class when theme is light", () => {
    localStorage.setItem("theme", "light");

    render(<ThemeInitializer />);

    // Should not have dark class
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should add dark class when theme is dark", () => {
    localStorage.setItem("theme", "dark");

    render(<ThemeInitializer />);

    // Should have dark class
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should not change class when re-rendering with same theme", () => {
    localStorage.setItem("theme", "light");

    const { rerender } = render(<ThemeInitializer />);

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Re-render without changing theme
    rerender(<ThemeInitializer />);

    // Should still not have dark class
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should default to light theme when localStorage is empty", () => {
    // Don't set anything in localStorage
    render(<ThemeInitializer />);

    // Should not have dark class (default is light)
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
