import { useRouter } from "next/router";
import { useContext } from "react";

import { TokenContext } from "../context/token";
import { removeTokenLocalStorage } from "./helpers";

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

export { useIsLoggedIn, useLogout };
