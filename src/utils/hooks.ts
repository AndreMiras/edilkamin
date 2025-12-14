import axios from "axios";
import { getSession } from "edilkamin";
import { useRouter } from "next/router";
import { useCallback, useContext } from "react";

import { TokenContext } from "../context/token";
import { removeTokenLocalStorage, setTokenLocalStorage } from "./helpers";

/**
 * Returns:
 * - true if a token in a valid format is stored
 * - undefined if the application is still loading
 * - false if the token is in an invalid format
 */
const useIsLoggedIn = (): boolean | undefined => {
  const { token } = useContext(TokenContext);
  // application is still loading
  if (token === undefined) return undefined;
  const tokenValid = typeof token === "string" ? token.length > 0 : false;
  return tokenValid;
};

const useLogout = (): (() => void) => {
  const { setToken } = useContext(TokenContext);
  const router = useRouter();
  return () => {
    removeTokenLocalStorage();
    setToken(null);
    router.push("/");
  };
};

type RefreshTokenFn = () => Promise<string | null>;

interface TokenRefreshResult {
  refreshToken: RefreshTokenFn;
  withRetry: <T>(
    token: string,
    apiCall: (t: string) => Promise<T>,
  ) => Promise<T>;
}

const useTokenRefresh = (): TokenRefreshResult => {
  const { setToken } = useContext(TokenContext);
  const router = useRouter();

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const useLegacy = process.env.NEXT_PUBLIC_USE_LEGACY_API === "true";
      const newToken = await getSession(true, useLegacy);
      setTokenLocalStorage(newToken);
      setToken(newToken);
      return newToken;
    } catch {
      // Refresh failed, force logout
      removeTokenLocalStorage();
      setToken(null);
      router.push("/");
      return null;
    }
  }, [setToken, router]);

  const withRetry = useCallback(
    async <T>(
      token: string,
      apiCall: (t: string) => Promise<T>,
    ): Promise<T> => {
      try {
        return await apiCall(token);
      } catch (error) {
        if (axios.isAxiosError(error) && error?.response?.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
            return await apiCall(newToken);
          }
        }
        throw error;
      }
    },
    [refreshToken],
  );

  return { refreshToken, withRetry };
};

export { useIsLoggedIn, useLogout, useTokenRefresh };
