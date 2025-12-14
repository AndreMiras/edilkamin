import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import { getSession } from "edilkamin";
import { act, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TokenContextProvider } from "../context/token";
import { useIsLoggedIn, useLogout, useTokenRefresh } from "./hooks";

const mockPush = vi.fn();
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("useIsLoggedIn", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
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
    const storedToken = "valid-token-12345";
    localStorage.setItem("edilkamin-token", storedToken);
    vi.mocked(getSession).mockResolvedValueOnce(storedToken);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <TokenContextProvider>{children}</TokenContextProvider>
    );

    const { result } = renderHook(() => useIsLoggedIn(), { wrapper });

    // Wait for useEffect in TokenContext to load and refresh token
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
    vi.mocked(getSession).mockResolvedValueOnce("x");

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
    vi.clearAllMocks();
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
    vi.mocked(getSession).mockResolvedValueOnce("test-token");

    const wrapper = ({ children }: { children: ReactNode }) => (
      <TokenContextProvider>{children}</TokenContextProvider>
    );

    const { result } = renderHook(() => useLogout(), { wrapper });

    // Wait for initial token load
    await waitFor(() => {
      expect(getSession).toHaveBeenCalled();
    });

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
    vi.mocked(getSession).mockResolvedValueOnce("test-token");

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
    vi.mocked(getSession).mockResolvedValueOnce("test-token");

    const wrapper = ({ children }: { children: ReactNode }) => (
      <TokenContextProvider>{children}</TokenContextProvider>
    );

    const { result } = renderHook(() => useLogout(), { wrapper });

    // Wait for initial token load
    await waitFor(() => {
      expect(getSession).toHaveBeenCalled();
    });

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

describe("useTokenRefresh", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_USE_LEGACY_API;
  });

  describe("refreshToken", () => {
    it("should refresh token and update storage", async () => {
      const newToken = "new-refreshed-token";
      vi.mocked(getSession).mockResolvedValueOnce(newToken);

      const wrapper = ({ children }: { children: ReactNode }) => (
        <TokenContextProvider>{children}</TokenContextProvider>
      );

      const { result } = renderHook(() => useTokenRefresh(), { wrapper });

      let refreshedToken: string | null = null;
      await act(async () => {
        refreshedToken = await result.current.refreshToken();
      });

      expect(refreshedToken).toBe(newToken);
      expect(getSession).toHaveBeenCalledWith(true, false);
      expect(localStorage.getItem("edilkamin-token")).toBe(newToken);
    });

    it("should logout and return null when refresh fails", async () => {
      localStorage.setItem("edilkamin-token", "old-token");
      // First call is for TokenContext init (succeeds), second is for refreshToken (fails)
      vi.mocked(getSession)
        .mockResolvedValueOnce("old-token")
        .mockRejectedValueOnce(new Error("Refresh failed"));

      const wrapper = ({ children }: { children: ReactNode }) => (
        <TokenContextProvider>{children}</TokenContextProvider>
      );

      const { result } = renderHook(() => useTokenRefresh(), { wrapper });

      // Wait for initial token load
      await waitFor(() => {
        expect(getSession).toHaveBeenCalledTimes(1);
      });

      let refreshedToken: string | null = "not-null";
      await act(async () => {
        refreshedToken = await result.current.refreshToken();
      });

      expect(refreshedToken).toBeNull();
      expect(localStorage.getItem("edilkamin-token")).toBeNull();
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("should pass legacy flag based on environment variable", async () => {
      process.env.NEXT_PUBLIC_USE_LEGACY_API = "true";
      vi.mocked(getSession).mockResolvedValueOnce("token");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <TokenContextProvider>{children}</TokenContextProvider>
      );

      const { result } = renderHook(() => useTokenRefresh(), { wrapper });

      await act(async () => {
        await result.current.refreshToken();
      });

      expect(getSession).toHaveBeenCalledWith(true, true);
    });
  });

  describe("withRetry", () => {
    it("should return result when API call succeeds", async () => {
      const mockApiCall = vi.fn().mockResolvedValueOnce("success");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <TokenContextProvider>{children}</TokenContextProvider>
      );

      const { result } = renderHook(() => useTokenRefresh(), { wrapper });

      let response: string | null = null;
      await act(async () => {
        response = await result.current.withRetry("token", mockApiCall);
      });

      expect(response).toBe("success");
      expect(mockApiCall).toHaveBeenCalledWith("token");
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it("should refresh and retry on 401 error", async () => {
      const newToken = "new-token";
      const error401 = { response: { status: 401 } };
      const mockApiCall = vi
        .fn()
        .mockRejectedValueOnce(error401)
        .mockResolvedValueOnce("success");
      vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
      vi.mocked(getSession).mockResolvedValueOnce(newToken);

      const wrapper = ({ children }: { children: ReactNode }) => (
        <TokenContextProvider>{children}</TokenContextProvider>
      );

      const { result } = renderHook(() => useTokenRefresh(), { wrapper });

      let response: string | null = null;
      await act(async () => {
        response = await result.current.withRetry("old-token", mockApiCall);
      });

      expect(response).toBe("success");
      expect(mockApiCall).toHaveBeenCalledTimes(2);
      expect(mockApiCall).toHaveBeenLastCalledWith(newToken);
    });

    it("should throw non-401 errors without retry", async () => {
      const networkError = new Error("Network error");
      const mockApiCall = vi.fn().mockRejectedValueOnce(networkError);
      vi.spyOn(axios, "isAxiosError").mockReturnValue(false);

      const wrapper = ({ children }: { children: ReactNode }) => (
        <TokenContextProvider>{children}</TokenContextProvider>
      );

      const { result } = renderHook(() => useTokenRefresh(), { wrapper });

      await expect(
        act(async () => {
          await result.current.withRetry("token", mockApiCall);
        }),
      ).rejects.toThrow("Network error");
      expect(mockApiCall).toHaveBeenCalledTimes(1);
      expect(getSession).not.toHaveBeenCalled();
    });

    it("should throw when refresh fails on 401", async () => {
      const error401 = { response: { status: 401 } };
      const mockApiCall = vi.fn().mockRejectedValueOnce(error401);
      vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
      vi.mocked(getSession).mockRejectedValueOnce(new Error("Refresh failed"));

      const wrapper = ({ children }: { children: ReactNode }) => (
        <TokenContextProvider>{children}</TokenContextProvider>
      );

      const { result } = renderHook(() => useTokenRefresh(), { wrapper });

      await expect(
        act(async () => {
          await result.current.withRetry("token", mockApiCall);
        }),
      ).rejects.toEqual(error401);
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });
  });
});
