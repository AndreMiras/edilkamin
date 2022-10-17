import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { removeTokenLocalStorage } from "./helpers";
import { TokenContext } from "../context/token";

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
  const navigate = useNavigate();
  return () => {
    removeTokenLocalStorage();
    setToken(null);
    navigate("/");
  };
};

export { useIsLoggedIn, useLogout };
