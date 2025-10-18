import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import i18n from "../i18n";
import { render, screen, waitFor } from "../test/utils";
import LanguageSwitcher from "./LanguageSwitcher";

describe("LanguageSwitcher", () => {
  beforeEach(async () => {
    localStorage.clear();
    // Reset language to English before each test
    await i18n.changeLanguage("en");
  });

  it("should render dropdown with current language", () => {
    render(<LanguageSwitcher />);

    // Default language is EN
    expect(screen.getByRole("button", { name: /EN/i })).toBeInTheDocument();
  });

  it("should display all available languages in dropdown", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const toggle = screen.getByRole("button", { name: /EN/i });
    await user.click(toggle);

    // Should show English, Français, Español
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Français")).toBeInTheDocument();
    expect(screen.getByText("Español")).toBeInTheDocument();
  });

  it("should change language when menu item is clicked", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    // Open dropdown
    const toggle = screen.getByRole("button", { name: "EN" });
    await user.click(toggle);

    // Click Français option
    const frenchOption = screen.getByText("Français");
    await user.click(frenchOption);

    // Dropdown should now show FR
    await waitFor(() => {
      const toggleButton = screen.getByRole("button", { name: "FR" });
      expect(toggleButton).toBeInTheDocument();
    });
  });

  it("should store language selection in localStorage", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    // Open dropdown and select Español
    const toggle = screen.getByRole("button");
    await user.click(toggle);

    const spanishOption = screen.getByText("Español");
    await user.click(spanishOption);

    // Check localStorage was updated
    await waitFor(() => {
      expect(localStorage.getItem("edilkamin-locale")).toBe("es");
    });
  });

  it("should mark active language with active class", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const toggle = screen.getByRole("button");
    await user.click(toggle);

    // English should be marked as active initially
    const englishOption = screen.getByText("English");
    expect(englishOption).toHaveClass("dropdown-item", "active");
  });

  it("should update active state after language change", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    // Open and select Français
    let toggle = screen.getByRole("button", { name: "EN" });
    await user.click(toggle);
    await user.click(screen.getByText("Français"));

    // Wait for language to change
    await waitFor(() => {
      toggle = screen.getByRole("button", { name: "FR" });
      expect(toggle).toBeInTheDocument();
    });

    // Re-open dropdown
    await user.click(toggle);

    // Français should now be marked as active
    const frenchOption = screen.getByText("Français");
    expect(frenchOption).toHaveClass("dropdown-item", "active");
  });

  it("should render all three language options", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const toggle = screen.getByRole("button");
    await user.click(toggle);

    // Verify all three languages are in the dropdown
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Français")).toBeInTheDocument();
    expect(screen.getByText("Español")).toBeInTheDocument();
  });

  it("should close dropdown after selecting a language", async () => {
    const user = userEvent.setup();
    const { container } = render(<LanguageSwitcher />);

    // Open dropdown
    const toggle = screen.getByRole("button", { name: "EN" });
    await user.click(toggle);

    // Verify dropdown is open
    expect(screen.getByText("English")).toBeInTheDocument();
    const dropdown = container.querySelector(".dropdown");
    expect(dropdown).toHaveClass("show");

    // Select Español
    const spanishOption = screen.getByText("Español");
    await user.click(spanishOption);

    // Wait for language to change
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "ES" })).toBeInTheDocument();
    });

    // Dropdown should close
    await waitFor(() => {
      expect(dropdown).not.toHaveClass("show");
    });
  });
});
