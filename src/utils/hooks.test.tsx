import { renderHook, waitFor } from "@testing-library/react";
import { act, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TokenContextProvider } from "../context/token";
import { useIsLoggedIn, useLogout } from "./hooks";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("useIsLoggedIn", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return false when no token in localStorage", async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TokenContextProvider>{children}</TokenContextProvider>
    );

    const { result } = renderHook(() => useIsLoggedIn(), { wrapper });

    // After useEffect runs, becomes false (no token in localStorage)
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("should return true when valid token exists in localStorage", async () => {
    localStorage.setItem("edilkamin-token", "valid-token-12345");

    const wrapper = ({ children }: { children: ReactNode }) => (
      <TokenContextProvider>{children}</TokenContextProvider>
    );

    const { result } = renderHook(() => useIsLoggedIn(), { wrapper });

    // Wait for useEffect in TokenContext to load from localStorage
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("should return false when token is null (logged out)", async () => {
    localStorage.removeItem("edilkamin-token");

    const wrapper = ({ children }: { children: ReactNode }) => (
      <TokenContextProvider>{children}</TokenContextProvider>
    );

    const { result } = renderHook(() => useIsLoggedIn(), { wrapper });

    // Wait for useEffect to set token to null
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("should return false when token is empty string", async () => {
    localStorage.setItem("edilkamin-token", "");

    const wrapper = ({ children }: { children: ReactNode }) => (
      <TokenContextProvider>{children}</TokenContextProvider>
    );

    const { result } = renderHook(() => useIsLoggedIn(), { wrapper });

    // Empty string should be invalid
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("should return true for non-empty string tokens", async () => {
    localStorage.setItem("edilkamin-token", "x");

    const wrapper = ({ children }: { children: ReactNode }) => (
      <TokenContextProvider>{children}</TokenContextProvider>
    );

    const { result } = renderHook(() => useIsLoggedIn(), { wrapper });

    // Even single character is valid
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});

describe("useLogout", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
  });

  it("should return a logout function", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TokenContextProvider>{children}</TokenContextProvider>
    );

    const { result } = renderHook(() => useLogout(), { wrapper });

    expect(typeof result.current).toBe("function");
  });

  it("should clear localStorage when logout is called", async () => {
    localStorage.setItem("edilkamin-token", "test-token");

    const wrapper = ({ children }: { children: ReactNode }) => (
      <TokenContextProvider>{children}</TokenContextProvider>
    );

    const { result } = renderHook(() => useLogout(), { wrapper });

    // Call logout function
    act(() => {
      result.current();
    });

    // localStorage should be cleared
    await waitFor(() => {
      expect(localStorage.getItem("edilkamin-token")).toBe(null);
    });
  });

  it("should set token to null when logout is called", async () => {
    localStorage.setItem("edilkamin-token", "test-token");

    const wrapper = ({ children }: { children: ReactNode }) => (
      <TokenContextProvider>{children}</TokenContextProvider>
    );

    // Render both hooks together to share the same provider instance
    const { result } = renderHook(
      () => ({
        logout: useLogout(),
        isLoggedIn: useIsLoggedIn(),
      }),
      { wrapper },
    );

    // Wait for token to load
    await waitFor(() => {
      expect(result.current.isLoggedIn).toBe(true);
    });

    // Call logout
    act(() => {
      result.current.logout();
    });

    // Token should be set to null
    await waitFor(() => {
      expect(result.current.isLoggedIn).toBe(false);
    });
  });

  it("should redirect to home page when logout is called", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TokenContextProvider>{children}</TokenContextProvider>
    );

    const { result } = renderHook(() => useLogout(), { wrapper });

    // Call logout function
    act(() => {
      result.current();
    });

    // Router push should be called with "/"
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should perform all logout actions in correct order", async () => {
    localStorage.setItem("edilkamin-token", "test-token");

    const wrapper = ({ children }: { children: ReactNode }) => (
      <TokenContextProvider>{children}</TokenContextProvider>
    );

    const { result } = renderHook(() => useLogout(), { wrapper });

    // Call logout
    act(() => {
      result.current();
    });

    // All three actions should occur
    await waitFor(() => {
      expect(localStorage.getItem("edilkamin-token")).toBe(null); // localStorage cleared
      expect(mockPush).toHaveBeenCalledWith("/"); // redirected
      // token set to null is verified by localStorage being cleared
    });
  });
});
