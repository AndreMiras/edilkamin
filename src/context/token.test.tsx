import { render as renderWithoutProviders } from "@testing-library/react";
import { useContext } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { screen, waitFor } from "../test/utils";
import { render } from "../test/utils";
import { TokenContext, TokenContextProvider } from "./token";

describe("TokenContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("default context values", () => {
    it("should provide default context values when used without provider", () => {
      const TestComponent = () => {
        const { token, setToken } = useContext(TokenContext);
        return (
          <div>
            <div data-testid="token">{String(token)}</div>
            <button onClick={() => setToken("test")}>setToken</button>
          </div>
        );
      };

      renderWithoutProviders(<TestComponent />);
      expect(screen.getByTestId("token")).toHaveTextContent("undefined");
    });

    it("should have no-op default setToken function that does not throw", () => {
      const TestComponent = () => {
        const { setToken } = useContext(TokenContext);
        // Call default function - should not throw
        setToken("test-token");
        return <div data-testid="success">Success</div>;
      };

      renderWithoutProviders(<TestComponent />);
      expect(screen.getByTestId("success")).toBeInTheDocument();
    });
  });

  describe("provider functionality", () => {
    it("should set token to null when localStorage is empty", async () => {
      const TestComponent = () => {
        const { token } = useContext(TokenContext);
        return <div data-testid="token">{String(token)}</div>;
      };

      render(
        <TokenContextProvider>
          <TestComponent />
        </TokenContextProvider>
      );

      // After useEffect runs, token becomes null (no token in localStorage)
      await waitFor(() => {
        expect(screen.getByTestId("token")).toHaveTextContent("null");
      });
    });

    it("should load token from localStorage on mount", async () => {
      localStorage.setItem("edilkamin-token", "stored-token-12345");

      const TestComponent = () => {
        const { token } = useContext(TokenContext);
        return <div data-testid="token">{String(token)}</div>;
      };

      render(
        <TokenContextProvider>
          <TestComponent />
        </TokenContextProvider>
      );

      // Should load from localStorage via useEffect
      await waitFor(() => {
        expect(screen.getByTestId("token")).toHaveTextContent(
          "stored-token-12345"
        );
      });
    });

    it("should update token when setToken is called with string", async () => {
      const TestComponent = () => {
        const { token, setToken } = useContext(TokenContext);
        return (
          <div>
            <div data-testid="token">{String(token)}</div>
            <button onClick={() => setToken("new-token")}>Set Token</button>
          </div>
        );
      };

      render(
        <TokenContextProvider>
          <TestComponent />
        </TokenContextProvider>
      );

      screen.getByRole("button").click();

      await waitFor(() => {
        expect(screen.getByTestId("token")).toHaveTextContent("new-token");
      });
    });

    it("should update token when setToken is called with null", async () => {
      localStorage.setItem("edilkamin-token", "existing-token");

      const TestComponent = () => {
        const { token, setToken } = useContext(TokenContext);
        return (
          <div>
            <div data-testid="token">{String(token)}</div>
            <button onClick={() => setToken(null)}>Clear Token</button>
          </div>
        );
      };

      render(
        <TokenContextProvider>
          <TestComponent />
        </TokenContextProvider>
      );

      // Wait for token to load from localStorage
      await waitFor(() => {
        expect(screen.getByTestId("token")).toHaveTextContent("existing-token");
      });

      // Clear token
      screen.getByRole("button").click();

      await waitFor(() => {
        expect(screen.getByTestId("token")).toHaveTextContent("null");
      });
    });

    it("should load empty string from localStorage", async () => {
      localStorage.setItem("edilkamin-token", "");

      const TestComponent = () => {
        const { token } = useContext(TokenContext);
        return (
          <div data-testid="token">
            {token === "" ? "empty" : String(token)}
          </div>
        );
      };

      render(
        <TokenContextProvider>
          <TestComponent />
        </TokenContextProvider>
      );

      // Empty string is loaded as-is from localStorage
      await waitFor(() => {
        expect(screen.getByTestId("token")).toHaveTextContent("empty");
      });
    });
  });
});
