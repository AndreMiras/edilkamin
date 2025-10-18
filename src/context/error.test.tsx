import { render as renderWithoutProviders } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";

import { screen } from "../test/utils";
import { render } from "../test/utils";
import { ErrorContext, ErrorContextProvider } from "./error";

describe("ErrorContext", () => {
  describe("default context values", () => {
    it("should provide default context values when used without provider", () => {
      const TestComponent = () => {
        const { errors, setErrors, addError } = useContext(ErrorContext);
        return (
          <div>
            <div data-testid="errors">{JSON.stringify(errors)}</div>
            <button onClick={() => setErrors([{ body: "test" }])}>
              setErrors
            </button>
            <button onClick={() => addError({ body: "test" })}>addError</button>
          </div>
        );
      };

      // Render without provider - uses defaults
      renderWithoutProviders(<TestComponent />);
      expect(screen.getByTestId("errors")).toHaveTextContent("[]");
    });

    it("should have no-op default functions that do not throw", () => {
      const TestComponent = () => {
        const { setErrors, addError } = useContext(ErrorContext);
        // Call default functions - should not throw
        setErrors([{ body: "test" }]);
        addError({ body: "test" });
        return <div data-testid="success">Success</div>;
      };

      renderWithoutProviders(<TestComponent />);
      expect(screen.getByTestId("success")).toBeInTheDocument();
    });
  });

  describe("provider functionality", () => {
    it("should initialize with empty errors array", () => {
      const TestComponent = () => {
        const { errors } = useContext(ErrorContext);
        return <div data-testid="errors">{JSON.stringify(errors)}</div>;
      };

      render(
        <ErrorContextProvider>
          <TestComponent />
        </ErrorContextProvider>
      );
      expect(screen.getByTestId("errors")).toHaveTextContent("[]");
    });

    it("should update errors when setErrors is called", async () => {
      const TestComponent = () => {
        const { errors, setErrors } = useContext(ErrorContext);
        return (
          <div>
            <div data-testid="errors">{JSON.stringify(errors)}</div>
            <button
              onClick={() =>
                setErrors([{ title: "Error", body: "Something went wrong" }])
              }
            >
              Set Errors
            </button>
          </div>
        );
      };

      const { user } = render(
        <ErrorContextProvider>
          <TestComponent />
        </ErrorContextProvider>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(screen.getByTestId("errors")).toHaveTextContent(
        JSON.stringify([{ title: "Error", body: "Something went wrong" }])
      );
    });

    it("should add error when addError is called", async () => {
      const TestComponent = () => {
        const { errors, addError } = useContext(ErrorContext);
        return (
          <div>
            <div data-testid="errors">{JSON.stringify(errors)}</div>
            <button onClick={() => addError({ body: "First error" })}>
              Add Error
            </button>
          </div>
        );
      };

      const { user } = render(
        <ErrorContextProvider>
          <TestComponent />
        </ErrorContextProvider>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(screen.getByTestId("errors")).toHaveTextContent("First error");
    });

    it("should accumulate multiple errors when addError is called multiple times", async () => {
      const TestComponent = () => {
        const { errors, addError } = useContext(ErrorContext);
        return (
          <div>
            <div data-testid="error-count">{errors.length}</div>
            <button onClick={() => addError({ body: "Error 1" })}>
              Add Error 1
            </button>
            <button onClick={() => addError({ body: "Error 2" })}>
              Add Error 2
            </button>
          </div>
        );
      };

      const { user } = render(
        <ErrorContextProvider>
          <TestComponent />
        </ErrorContextProvider>
      );

      await user.click(screen.getByRole("button", { name: /Add Error 1/i }));
      expect(screen.getByTestId("error-count")).toHaveTextContent("1");

      await user.click(screen.getByRole("button", { name: /Add Error 2/i }));
      expect(screen.getByTestId("error-count")).toHaveTextContent("2");
    });

    it("should support errors with optional title field", async () => {
      const TestComponent = () => {
        const { errors, addError } = useContext(ErrorContext);
        return (
          <div>
            <div data-testid="errors">{JSON.stringify(errors)}</div>
            <button
              onClick={() => addError({ title: "Warning", body: "Test" })}
            >
              Add With Title
            </button>
            <button onClick={() => addError({ body: "No title" })}>
              Add Without Title
            </button>
          </div>
        );
      };

      const { user } = render(
        <ErrorContextProvider>
          <TestComponent />
        </ErrorContextProvider>
      );

      await user.click(screen.getByRole("button", { name: /Add With Title/i }));
      expect(screen.getByTestId("errors")).toHaveTextContent("Warning");

      await user.click(
        screen.getByRole("button", { name: /Add Without Title/i })
      );
      expect(screen.getByTestId("errors")).toHaveTextContent("No title");
    });
  });
});
