import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { render, screen, waitFor, within } from "../test/utils";
import Home from "./Home";

describe("Home", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should render empty state when no devices stored", () => {
    render(<Home />);

    // Should show empty state message
    expect(screen.getByText(/no registered fireplaces/i)).toBeInTheDocument();
  });

  it("should load devices from localStorage on mount", () => {
    const mockDevices = ["aabbccddeeff", "112233445566"];
    localStorage.setItem("fireplaces", JSON.stringify(mockDevices));

    render(<Home />);

    // Devices should be displayed
    expect(screen.getByText("aabbccddeeff")).toBeInTheDocument();
    expect(screen.getByText("112233445566")).toBeInTheDocument();
  });

  it("should add valid MAC address to list", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);
    const addButton = screen.getByRole("button", { name: /add fireplace/i });

    await user.type(input, "aabbccddeeff");
    await user.click(addButton);

    // Device should appear in list
    await waitFor(() => {
      expect(screen.getByText("aabbccddeeff")).toBeInTheDocument();
    });

    // Should be persisted to localStorage
    const stored = JSON.parse(localStorage.getItem("fireplaces") || "[]");
    expect(stored).toContain("aabbccddeeff");
  });

  it("should accept colon-separated MAC address format", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);
    const addButton = screen.getByRole("button", { name: /add fireplace/i });

    await user.type(input, "aa:bb:cc:dd:ee:ff");
    await user.click(addButton);

    // Should be normalized and stored
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("fireplaces") || "[]");
      expect(stored).toContain("aabbccddeeff");
    });
  });

  it("should reject invalid MAC address", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);
    const addButton = screen.getByRole("button", { name: /add fireplace/i });

    await user.type(input, "invalid-mac");

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Invalid MAC address/i)).toBeInTheDocument();
    });

    // Button should be disabled
    expect(addButton).toBeDisabled();

    // Should NOT be added to localStorage if button was clicked
    const stored = JSON.parse(localStorage.getItem("fireplaces") || "[]");
    expect(stored).not.toContain("invalid-mac");
  });

  it("should remove device from list", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "fireplaces",
      JSON.stringify(["aabbccddeeff", "112233445566"]),
    );

    render(<Home />);

    // Find all list items
    const listItems = screen.getAllByRole("link");
    expect(listItems).toHaveLength(2);

    // Find remove button for first device
    const firstItem = screen.getByText("aabbccddeeff").closest("li");
    expect(firstItem).toBeInTheDocument();

    const removeButton = within(firstItem!).getByRole("button");
    await user.click(removeButton);

    // Device should be removed from list
    await waitFor(() => {
      expect(screen.queryByText("aabbccddeeff")).not.toBeInTheDocument();
    });

    // Should be removed from localStorage
    const stored = JSON.parse(localStorage.getItem("fireplaces") || "[]");
    expect(stored).not.toContain("aabbccddeeff");
    expect(stored).toContain("112233445566");
  });

  it("should clear input after successful add", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);
    const addButton = screen.getByRole("button", { name: /add fireplace/i });

    await user.type(input, "aabbccddeeff");
    await user.click(addButton);

    // Input should be cleared
    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("should not add duplicate MAC addresses", async () => {
    const user = userEvent.setup();
    localStorage.setItem("fireplaces", JSON.stringify(["aabbccddeeff"]));

    render(<Home />);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);

    await user.type(input, "aabbccddeeff");

    // Should show validation message about duplicate
    await waitFor(() => {
      expect(screen.getByText(/Device already added/i)).toBeInTheDocument();
    });

    // Add button should be disabled
    const addButton = screen.getByRole("button", { name: /add fireplace/i });
    expect(addButton).toBeDisabled();

    // Should not add duplicate
    const stored = JSON.parse(localStorage.getItem("fireplaces") || "[]");
    expect(stored.filter((mac: string) => mac === "aabbccddeeff")).toHaveLength(
      1,
    );
  });

  it("should disable add button when input is empty", () => {
    render(<Home />);

    const addButton = screen.getByRole("button", { name: /add fireplace/i });
    expect(addButton).toBeDisabled();
  });

  it("should enable add button when valid MAC is entered", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);
    const addButton = screen.getByRole("button", { name: /add fireplace/i });

    await user.type(input, "aabbccddeeff");

    // Button should be enabled
    await waitFor(() => {
      expect(addButton).not.toBeDisabled();
    });
  });

  it("should submit on Enter key press", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);

    await user.type(input, "aabbccddeeff");
    await user.type(input, "{Enter}");

    // Device should be added
    await waitFor(() => {
      expect(screen.getByText("aabbccddeeff")).toBeInTheDocument();
    });
  });

  it("should render links to device pages", () => {
    localStorage.setItem("fireplaces", JSON.stringify(["aabbccddeeff"]));

    render(<Home />);

    const link = screen.getByRole("link", { name: "aabbccddeeff" });
    expect(link).toHaveAttribute("href", "/fireplace/aabbccddeeff");
  });

  it("should show validation feedback for invalid input", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);
    await user.type(input, "xyz");

    // Should mark input as invalid
    await waitFor(() => {
      expect(input).toHaveClass("is-invalid");
    });
  });

  it("should clear validation feedback when input is cleared", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);

    // Type invalid value
    await user.type(input, "xyz");
    await waitFor(() => {
      expect(input).toHaveClass("is-invalid");
    });

    // Clear input
    await user.clear(input);

    // Validation should be cleared
    await waitFor(() => {
      expect(input).not.toHaveClass("is-invalid");
    });
  });

  it("should handle multiple devices correctly", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/aabbccddeeff/i);
    const addButton = screen.getByRole("button", { name: /add fireplace/i });

    // Add first device
    await user.type(input, "aabbccddeeff");
    await user.click(addButton);

    // Add second device
    await user.type(input, "112233445566");
    await user.click(addButton);

    // Both should be in the list
    await waitFor(() => {
      expect(screen.getByText("aabbccddeeff")).toBeInTheDocument();
      expect(screen.getByText("112233445566")).toBeInTheDocument();
    });

    // Both should be in localStorage
    const stored = JSON.parse(localStorage.getItem("fireplaces") || "[]");
    expect(stored).toEqual(["aabbccddeeff", "112233445566"]);
  });
});
