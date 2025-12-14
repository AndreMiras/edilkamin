import { render as renderWithoutProviders } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getSession } from "edilkamin";
import { useContext } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { screen, waitFor } from "../test/utils";
import { render } from "../test/utils";
import { TokenContext, TokenContextProvider } from "./token";

describe("TokenContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up env var
    delete process.env.NEXT_PUBLIC_USE_LEGACY_API;
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
        </TokenContextProvider>,
      );

      // After useEffect runs, token becomes null (no token in localStorage)
      await waitFor(() => {
        expect(screen.getByTestId("token")).toHaveTextContent("null");
      });
      // getSession should not be called when no stored token
      expect(getSession).not.toHaveBeenCalled();
    });

    it("should refresh token on load when stored token exists", async () => {
      const storedToken = "stored-token-12345";
      const refreshedToken = "refreshed-token";
      localStorage.setItem("edilkamin-token", storedToken);
      vi.mocked(getSession).mockResolvedValueOnce(refreshedToken);

      const TestComponent = () => {
        const { token } = useContext(TokenContext);
        return <div data-testid="token">{String(token)}</div>;
      };

      renderWithoutProviders(
        <TokenContextProvider>
          <TestComponent />
        </TokenContextProvider>,
      );

      // Should call getSession and use the refreshed token
      await waitFor(() => {
        expect(screen.getByTestId("token")).toHaveTextContent(refreshedToken);
      });
      expect(getSession).toHaveBeenCalledWith(false, false);
      expect(localStorage.getItem("edilkamin-token")).toBe(refreshedToken);
    });

    it("should update token when setToken is called with string", async () => {
      const user = userEvent.setup();
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
        </TokenContextProvider>,
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId("token")).toHaveTextContent("null");
      });

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByTestId("token")).toHaveTextContent("new-token");
      });
    });

    it("should update token when setToken is called with null", async () => {
      const user = userEvent.setup();
      const refreshedToken = "refreshed-token";
      localStorage.setItem("edilkamin-token", "existing-token");
      vi.mocked(getSession).mockResolvedValueOnce(refreshedToken);

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
        </TokenContextProvider>,
      );

      // Wait for token to load (refreshed)
      await waitFor(() => {
        expect(screen.getByTestId("token")).toHaveTextContent(refreshedToken);
      });

      // Clear token
      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByTestId("token")).toHaveTextContent("null");
      });
    });

    it("should set token to null when empty string in localStorage", async () => {
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
        </TokenContextProvider>,
      );

      // Empty string is treated as no token (falsy), so token becomes null
      await waitFor(() => {
        expect(screen.getByTestId("token")).toHaveTextContent("null");
      });
      expect(getSession).not.toHaveBeenCalled();
    });
  });

  describe("token refresh on load", () => {
    it("should set token to null when refresh fails", async () => {
      localStorage.setItem("edilkamin-token", "expired-token");
      vi.mocked(getSession).mockRejectedValueOnce(new Error("Session expired"));

      const TestComponent = () => {
        const { token } = useContext(TokenContext);
        return <div data-testid="token">{String(token)}</div>;
      };

      render(
        <TokenContextProvider>
          <TestComponent />
        </TokenContextProvider>,
      );

      await waitFor(() => {
        expect(getSession).toHaveBeenCalled();
        expect(screen.getByTestId("token")).toHaveTextContent("null");
      });
    });

    it("should pass legacy flag based on environment variable", async () => {
      localStorage.setItem("edilkamin-token", "token");
      process.env.NEXT_PUBLIC_USE_LEGACY_API = "true";
      vi.mocked(getSession).mockResolvedValueOnce("new-token");

      const TestComponent = () => {
        const { token } = useContext(TokenContext);
        return <div data-testid="token">{String(token)}</div>;
      };

      render(
        <TokenContextProvider>
          <TestComponent />
        </TokenContextProvider>,
      );

      await waitFor(() => {
        expect(getSession).toHaveBeenCalledWith(false, true);
      });
    });
  });
});
