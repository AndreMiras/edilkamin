import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ErrorContext, ErrorType } from "../context/error";
import { render, screen, within } from "../test/utils";
import Errors from "./Errors";

describe("Errors", () => {
  it("should render nothing when there are no errors", () => {
    const { container } = render(<Errors />);

    // No alerts should be present
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it("should render single error", () => {
    const mockErrors: ErrorType[] = [
      { title: "Test Error", body: "Error message" },
    ];

    render(
      <ErrorContext.Provider
        value={{
          errors: mockErrors,
          setErrors: vi.fn(),
          addError: vi.fn(),
        }}
      >
        <Errors />
      </ErrorContext.Provider>
    );

    expect(screen.getByText("Test Error")).toBeInTheDocument();
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("should render multiple errors", () => {
    const mockErrors: ErrorType[] = [
      { title: "Error 1", body: "First error" },
      { title: "Error 2", body: "Second error" },
      { title: "Error 3", body: "Third error" },
    ];

    render(
      <ErrorContext.Provider
        value={{
          errors: mockErrors,
          setErrors: vi.fn(),
          addError: vi.fn(),
        }}
      >
        <Errors />
      </ErrorContext.Provider>
    );

    expect(screen.getAllByRole("alert")).toHaveLength(3);
    expect(screen.getByText("Error 1")).toBeInTheDocument();
    expect(screen.getByText("Error 2")).toBeInTheDocument();
    expect(screen.getByText("Error 3")).toBeInTheDocument();
  });

  it("should remove error when close button is clicked", async () => {
    const user = userEvent.setup();
    let currentErrors: ErrorType[] = [
      { title: "Error 1", body: "First error" },
      { title: "Error 2", body: "Second error" },
    ];

    const setErrors = vi.fn((updater) => {
      if (typeof updater === "function") {
        currentErrors = updater(currentErrors);
      } else {
        currentErrors = updater;
      }
    });

    render(
      <ErrorContext.Provider
        value={{
          errors: currentErrors,
          setErrors,
          addError: vi.fn(),
        }}
      >
        <Errors />
      </ErrorContext.Provider>
    );

    // Find and close first error
    const alerts = screen.getAllByRole("alert");
    const firstAlert = alerts[0];
    const closeButton = within(firstAlert).getByRole("button", {
      name: /close/i,
    });

    await user.click(closeButton);

    // setErrors should have been called to remove the error
    expect(setErrors).toHaveBeenCalled();
  });

  it("should render errors without title", () => {
    const mockErrors: ErrorType[] = [{ body: "Error message without title" }];

    render(
      <ErrorContext.Provider
        value={{
          errors: mockErrors,
          setErrors: vi.fn(),
          addError: vi.fn(),
        }}
      >
        <Errors />
      </ErrorContext.Provider>
    );

    expect(screen.getByText("Error message without title")).toBeInTheDocument();
    // Should have default title from i18n
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
